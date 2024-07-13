from flask import Flask, request, jsonify
import google.generativeai as genai
import tempfile
import os
from dotenv import load_dotenv

app = Flask(__name__)
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY is None:
    raise ValueError("No GOOGLE_API_KEY found in environment variables")
genai.configure(api_key=GOOGLE_API_KEY)

PROMPT = """you are a helper you will be provided a need and you have to search through the data of the starred repos of users and you have to provide the best solution they can use."""

@app.route('/upload', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        keywords = request.args.get("keywords")
        if file:
            try:
                # Create a temporary file
                temp_file = tempfile.NamedTemporaryFile(delete=False)
                # Save the uploaded file to the temporary file
                file.save(temp_file.name)
                # Upload the file to GenAI
                md_file = genai.upload_file(
                    path=temp_file.name,  # Pass the temporary file path
                    display_name="Starred Repos Content",
                    mime_type="text/markdown"
                )
                PROMPT2 = f"These are my starred repos tell me the best repos I should use for {keywords}"
                model = genai.GenerativeModel(model_name="models/gemini-1.5-pro",
                                              generation_config={"response_mime_type": "application/json"},
                                              system_instruction=PROMPT)
                response = model.generate_content([PROMPT2, md_file])
                
                # Close and delete the temporary file
                temp_file.close()
                os.unlink(temp_file.name)

                return jsonify(response.text)
            except google.api_core.exceptions.ResourceExhausted as e:
                error_message = "Quota exceeded for Generate Content API. Please try again later."
                return jsonify({'error': error_message, 'details': str(e)}), 429
            except Exception as e:
                return jsonify({'error': 'An error occurred', 'details': str(e)}), 500
        else:
            return jsonify({'error': 'No file provided'}), 400

if __name__ == '__main__':
    app.run(debug=True)
