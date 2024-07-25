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

# Load environment variables
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
    allow_origins=["http://localhost:5173"],  # Allow the specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

class CodePayload(BaseModel):
    code: str
    
class TextInput(BaseModel):
    text: str
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

    
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def generate_content_with_retry(model, prompt, md_file):
    return model.generate_content([prompt, md_file])

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

@app.post("/gemini")
async def analyze_text(input: TextInput):
    try:
        PROMPT = """You are an AI assistant specializing in software development. Your task is to analyze a user's starred GitHub repositories and provide tailored recommendations based on their specific needs or interests."""
        PROMPT2 = f"""Given the content of my starred repositories, please recommend the best repos I should use for {input.keywords}. Provide a brief explanation for each recommendation, highlighting its relevance to my query. Format your response as a JSON array of objects, where each object represents a recommended repo and has the following structure:
        {{
            "name": "repo_name",
            "description": "brief description",
            "fullName": "owner/repo_name",
            "language": "primary_language",
            "url": "repo_url",
            "stargazersCount": number_of_stars,
            "explanation": "Your explanation for recommending this repo"
        }}"""
        
        model = genai.GenerativeModel(
            model_name="gemini-1.5-pro",
            generation_config={"temperature": 0.7, "top_p": 1.0, "top_k": 1},
        )
        
        response = generate_content_with_retry(model)
        
        curated_repos = json.loads(response.text)
        
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
        return JSONResponse(
            content={"error": f"An error occurred. Details: {str(e)}"},
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Credentials": "true",
            }
        )
        
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def generate_content_with_retry(model, content):
    return model.generate_content(content)        


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
