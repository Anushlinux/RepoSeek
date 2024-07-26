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

        PROMPT = """You're a friendly and knowledgeable AI assistant who's passionate about software development. Your expertise spans across various programming languages and frameworks. Today, you're helping a fellow developer find the most suitable GitHub repositories based on their interests and needs."""

        PROMPT2 = f"""A developer has shared their list of starred GitHub repositories and is looking for guidance on a new project. Here are their starred repos:

        {repos_text}

        The developer is interested in: {input.keywords}. Could you recommend the best ones from this list that would be most helpful for me? I'd really appreciate it if you could explain why each recommendation is valuable and how it relates to my interests.Also, please provide a code snippet or example usage for each recommendation to help me understand how to use it effectively.
        
        Please help them by:
        1. Recommending the most relevant repos from their starred list for this project.
        2. Explaining how each recommended repo can be integrated into their project.
        3. Providing a brief code example or implementation suggestion for each recommended repo.
        4. Offering any additional advice or considerations for their project based on the available repos.

        When you respond, please format your recommendations as a JSON array of objects. Each object should represent a recommended repo and include the following details:
        - greetings: Greet the user first by saying "Heyyy wassup, seeing that you finally decided to take a look at your starred repos, welp check these out!"
        - name: The repo's name
        - description: A brief description of the repo
        - fullName: The full name (owner/repo_name)
        - language: The primary programming language used
        - url: The GitHub URL of the repo
        - stargazersCount: The number of stars the repo has
        - explanation: Your detailed explanation of why you're recommending this repo
        - codeSnippet: A code snippet or example usage of the repo

        Please make your explanations thorough and insightful. Consider factors like the repo's popularity, its unique features, how it compares to similar tools, and specific ways it could be useful for my interests in {input.keywords}.

        Remember, I need your response to be a valid JSON array that I can parse directly, without any additional text or formatting. Thanks for your help!"""
       
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
