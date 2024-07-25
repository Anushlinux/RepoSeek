from fastapi import FastAPI, Body, HTTPException, UploadFile, File, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
from pydantic import BaseModel
import requests
import google.generativeai as genai
import google.api_core.exceptions
import tempfile
import os
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential
from typing import List

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

if GOOGLE_API_KEY is None:
    raise ValueError("No GOOGLE_API_KEY found in environment variables")

genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

class CodePayload(BaseModel):
    code: str
    
class RepoInfo(BaseModel):
    name: str
    description: str
    fullName: str
    language: str | None
    url: str
    stargazersCount: int   
    
class TextInput(BaseModel):
    text: List[RepoInfo]
    keywords: str

@app.post("/api/data")
async def handle_data(request: Request):
    try:
        payload = await request.json()
        code = payload.get("code")
        
        # Your GitHub API request
        response = requests.post(
            "https://github.com/login/oauth/access_token",
            params={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": "http://localhost:5173/api/github/callback",
            },
            headers={"Accept": "application/json"}
        )
        
        if response.status_code != 200:
            return JSONResponse(
                status_code=response.status_code,
                content={"error": "Failed to retrieve access token"}
            )
        
        return JSONResponse(content=response.json())
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

    

# @app.get("/test")
# async def test():
#     return {"message": "CORS is working"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), keywords: str = ""):
    if file:
        try:
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                contents = await file.read()
                with open(temp_file.name, "wb") as f:
                    f.write(contents)
                md_file = genai.upload_file(
                    path=temp_file.name,
                    display_name="Starred Repos Content",
                    mime_type="text/markdown"
                )

            PROMPT = """You are an AI assistant specializing in software development. Your task is to analyze a user's starred GitHub repositories and provide tailored recommendations based on their specific needs or interests."""

            PROMPT2 = f"""Given the content of my starred repositories, please recommend the best repos I should use for {keywords}. Provide a brief explanation for each recommendation, highlighting its relevance to my query."""

            model = genai.GenerativeModel(
                model_name="models/gemini-1.5-pro",
                generation_config={"response_mime_type": "application/json"},
                system_instruction=PROMPT
            )

            response = generate_content_with_retry(model, PROMPT2, md_file)
            
            return {"response": response.text}

        except google.api_core.exceptions.ResourceExhausted as e:
            return JSONResponse(
                content={"error": "Quota exceeded for Generate Content API. Please try again later.", "details": str(e)}, 
                status_code=429
            )
        except Exception as e:
            return JSONResponse(
                content={"error": "An error occurred", "details": str(e)}, 
                status_code=500
            )
        finally:
            if 'temp_file' in locals():
                os.unlink(temp_file.name)
    else:
        return JSONResponse(content={"error": "No file provided"}, status_code=400)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def generate_content_with_retry(model, content):
    return model.generate_content(content)  


@app.post("/gemini")
async def analyze_text(input: TextInput = Body(...)):
# async def analyze_text(request: Request):
#     d = await request.json()
#     p = TextInput(**d)
#     print(p)
    
    try:
        repos_text = "\n".join([
            f"- {repo.name}: {repo.description} (Language: {repo.language}, Stars: {repo.stargazersCount})"
            for repo in input.text
        ])

        PROMPT = """You are an AI assistant specializing in software development. Your task is to analyze a user's starred GitHub repositories and provide tailored recommendations based on their specific needs or interests."""
        PROMPT2 = f"""Given the following list of starred repositories:

        {repos_text}

        Please recommend the best repos I should use for {input.keywords}. Provide a brief explanation for each recommendation, highlighting its relevance to my query. 

        Format your response as a JSON array of objects, where each object represents a recommended repo. Do not include any markdown formatting or JSON indicators. The response should be a valid JSON array that can be directly parsed. Each object in the array should have the following structure:

        {{
            "name": "repo_name",
            "description": "brief description",
            "fullName": "owner/repo_name",
            "language": "primary_language",
            "url": "repo_url",
            "stargazersCount": number_of_stars,
            "explanation": "Your explanation for recommending this repo"
        }}

        Ensure that the response is a valid JSON array without any additional text or formatting."""
       
        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={"temperature": 0.7, "top_p": 1.0, "top_k": 1},
        )
       
        response = generate_content_with_retry(model, PROMPT + "\n" + PROMPT2)
        
        try:
            # Remove any potential leading/trailing whitespace
            response_text = response.text.strip()
            
            # If the response starts with '[' and ends with ']', it's likely already a JSON array
            if response_text.startswith('[') and response_text.endswith(']'):
                curated_repos = json.loads(response_text)
            else:
                # If not, try to find the JSON array within the text
                start = response_text.find('[')
                end = response_text.rfind(']') + 1
                if start != -1 and end != 0:
                    curated_repos = json.loads(response_text[start:end])
                else:
                    raise json.JSONDecodeError("No valid JSON array found in the response", response_text, 0)
        except json.JSONDecodeError:
            return JSONResponse(
                content={"error": "Failed to parse JSON response", "raw_response": response.text},
                status_code=500,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:5173",
                    "Access-Control-Allow-Credentials": "true",
                }
            )
       
        return JSONResponse(
            content={"curated_repos": curated_repos},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
            }
        )
   
    except google.api_core.exceptions.ResourceExhausted as e:
        return JSONResponse(
            content={"error": f"Quota exceeded for Generate Content API. Please try again later. Details: {str(e)}"},
            status_code=429,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
            }
        )
    except Exception as e:
        print("ERROR:", e)
        return JSONResponse(
            content={"error": f"An error occurred. Details: {str(e)}"},
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
            }
        )
        


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
