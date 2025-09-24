import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load your API key
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

print("--- Finding Available Gemini Models ---")

# List all available models and check their supported methods
for model in genai.list_models():
    # We are looking for models that support the 'generateContent' method
    if 'generateContent' in model.supported_generation_methods:
        print(model.name)

print("\n--- End of List ---")