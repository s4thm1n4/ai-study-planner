import os
import google.generativeai as genai
from typing import Optional # This one is fine

# Configure the Gemini client (it will use the same key as your other agents)
try:
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    print("Summarize Agent configured successfully.")
except Exception as e:
    print(f"[ERROR] Summarize Agent: GEMINI_API_KEY not configured. {e}")
    model = None

async def summarize_text(document_text: str) -> str:
    """Generates a summary of the provided text."""
    if not model:
        return "Error: Summarizer AI model is not configured."

    prompt = f"""
    You are a professional study assistant. Below is the text extracted from a study document.
    Please provide a concise, high-level summary of this material in clear, easy-to-understand bullet points.

    --- DOCUMENT TEXT ---
    {document_text}
    --- END OF TEXT ---

    Summary:
    """
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"[ERROR] Gemini summarization failed: {e}")
        return f"Error generating summary: {e}"

async def answer_question(document_text: str, question: str) -> str:
    """Answers a specific question based on the provided text."""
    if not model:
        return "Error: Q&A AI model is not configured."

    prompt = f"""
    You are a professional study assistant. Use the following document text to answer the user's question.
    If the answer is not found in the text, state that clearly. Do not make up information.

    --- DOCUMENT TEXT ---
    {document_text}
    --- END OF TEXT ---

    User Question: "{question}"

    Answer:
    """
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"[ERROR] Gemini Q&A failed: {e}")
        return f"Error generating answer: {e}"