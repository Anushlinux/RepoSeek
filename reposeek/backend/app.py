from fastapi import FastAPI, Body, HTTPException, Response, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import google.generativeai as genai
import google.api_core.exceptions
import tempfile
from typing import List ,Dict, Any
import os
from dotenv import load_dotenv
from tenacity import retry, stop_after_attempt, wait_exponential

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:8000",
    "http://localhost:5000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
# GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")

GITHUB_CLIENT_ID = "Ov23lil8Z6B45d2ZRNnL"
GITHUB_CLIENT_SECRET = "76f8213d22c53fd4131ea67c8e6326a7c7900382"
GOOGLE_API_KEY = "AIzaSyCckBrioAA_1hxxBktEodvDW6PaRQt0Qq8"

class CodePayload(BaseModel):
    code: str
    
class TextInput(BaseModel):
    text: str
    keywords: str    

@app.post("/api/data")
async def get_data(payload: CodePayload = Body(...)):
    code = payload.code
    response = requests.post("https://github.com/login/oauth/access_token", params={
        "client_id": GITHUB_CLIENT_ID,
        "client_secret": GITHUB_CLIENT_SECRET,
        "code": code,
        "redirect_uri": "http://localhost:5173/api/github/callback",
    }, headers={"Accept": "application/json"})
    
    if response.status_code != 200:
        return JSONResponse(content={"error": "Failed to retrieve access token"}, status_code=response.status_code)
    
    return JSONResponse(
        content=response.json(),
        headers={
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Credentials": "true",
        }
    )

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY is None:
    raise ValueError("No GOOGLE_API_KEY found in environment variables")
genai.configure(api_key=GOOGLE_API_KEY)

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def generate_content_with_retry(model, prompt, md_file):
    return model.generate_content([prompt, md_file])

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
            return {"error": "Quota exceeded for Generate Content API. Please try again later.", "details": str(e)}, 429
        except Exception as e:
            return {"error": "An error occurred", "details": str(e)}, 500
        finally:
            if 'temp_file' in locals():
                os.unlink(temp_file.name)
    else:
        return {"error": "No file provided"}, 400
    
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import genai
import google.api_core.exceptions

app = FastAPI()

# class TextInput(BaseModel):
#     text: str
#     keywords: str

# @app.post("/gemini")
# async def analyze_text(input: TextInput):
#     try:
#         PROMPT = """You are an AI assistant specializing in software development. Your task is to analyze a user's starred GitHub repositories and provide tailored recommendations based on their specific needs or interests."""
#         PROMPT2 = f"""Given the content of my starred repositories, please recommend the best repos I should use for {input.keywords}. Provide a brief explanation for each recommendation, highlighting its relevance to my query."""
#         model = genai.GenerativeModel(
#             model_name="models/gemini-1.5-pro",
#             generation_config={"response_mime_type": "application/json"},
#             system_instruction=PROMPT
#         )
        
#         # Create a Content object with the provided text
#         content = genai.Content(
#             parts=[genai.Part(text=input.text)],
#             role="user"
#         )
        
#         response = generate_content_with_retry(model, PROMPT2, content)
       
#         return {"response": response.text}
#     except google.api_core.exceptions.ResourceExhausted as e:
#         raise HTTPException(status_code=429, detail=f"Quota exceeded for Generate Content API. Please try again later. Details: {str(e)}")
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An error occurred. Details: {str(e)}")
    
if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
