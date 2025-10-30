import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("Checking available models...")
try:
    models = genai.list_models()
    print("\nModels that support generateContent:")
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(f"  ✓ {m.name}")
            print(f"    Description: {m.description}")
            print(f"    Methods: {m.supported_generation_methods}")
            print()
except Exception as e:
    print(f"Error: {e}")
