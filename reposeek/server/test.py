# from flask import Flask, request, jsonify
# import google.generativeai as genai
# import google.api_core.exceptions
# import tempfile
# import os
# import time
# from dotenv import load_dotenv
# from tenacity import retry, stop_after_attempt, wait_exponential

# app = Flask(__name__)
# load_dotenv()
# GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# if GOOGLE_API_KEY is None:
#     raise ValueError("No GOOGLE_API_KEY found in environment variables")
# genai.configure(api_key=GOOGLE_API_KEY)

# @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
# def generate_content_with_retry(model, prompt, md_file):
#     return model.generate_content([prompt, md_file])

# @app.route('/upload', methods=['POST'])
# def upload_file():
#     if request.method == 'POST':
#         file = request.files['file']
#         keywords = request.args.get("keywords")
#         if file:
#             try:
#                 with tempfile.NamedTemporaryFile(delete=False) as temp_file:
#                     file.save(temp_file.name)
#                     md_file = genai.upload_file(
#                         path=temp_file.name,
#                         display_name="Starred Repos Content",
#                         mime_type="text/markdown"
#                     )

#                 PROMPT = """You are an AI assistant specializing in software development. Your task is to analyze a user's starred GitHub repositories and provide tailored recommendations based on their specific needs or interests."""

#                 PROMPT2 = f"""Given the content of my starred repositories, please recommend the best repos I should use for {keywords}. Provide a brief explanation for each recommendation, highlighting its relevance to my query."""

#                 model = genai.GenerativeModel(
#                     model_name="models/gemini-1.5-pro",
#                     generation_config={"response_mime_type": "application/json"},
#                     system_instruction=PROMPT
#                 )

#                 response = generate_content_with_retry(model, PROMPT2, md_file)
                
#                 return jsonify(response.text)

#             except google.api_core.exceptions.ResourceExhausted as e:
#                 error_message = "Quota exceeded for Generate Content API. Please try again later."
#                 return jsonify({'error': error_message, 'details': str(e)}), 429
#             except Exception as e:
#                 return jsonify({'error': 'An error occurred', 'details': str(e)}), 500
#             finally:
#                 if 'temp_file' in locals():
#                     os.unlink(temp_file.name)
#         else:
#             return jsonify({'error': 'No file provided'}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=8000)