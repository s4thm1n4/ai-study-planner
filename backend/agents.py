import os
from dotenv import load_dotenv
import google.generativeai as genai
import requests

# This line loads your .env file
load_dotenv()

# --- Agent 1: The Scheduler (Gemini LLM) ---
def generate_schedule(goal: str):
    """Uses the Gemini API to create a simple study schedule."""
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    prompt = f"""
    Create a simple, 3-day study plan for the following goal: '{goal}'.
    Return ONLY a numbered list of topics, one for each day. Do not add any other text.
    """

    try:
        response = model.generate_content(prompt)
        topics = response.text.strip().split('\n')
        return topics
    except Exception as e:
        print(f"An error occurred with Gemini API: {e}")
        return ["Could not generate a schedule."]

# --- Agent 2: The Resource Finder (Google Search) ---
def find_resource(topic: str):
    """Uses the Google Search API to find a resource for a topic."""
    api_key = os.getenv("SEARCH_API_KEY")
    search_engine_id = os.getenv("SEARCH_ENGINE_ID")
    url = "https://www.googleapis.com/customsearch/v1"

    params = {'key': api_key, 'cx': search_engine_id, 'q': topic}

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        search_results = response.json()
        items = search_results.get('items', [])
        return items[0].get('link', 'No link found.') if items else 'No results found.'
    except requests.exceptions.RequestException as e:
        print(f"An error occurred with Search API: {e}")
        return "Could not fetch a resource."

# --- This is your testing area ---
if __name__ == "__main__":
    print("--- Testing Agent 1: Scheduler ---")
    test_plan = generate_schedule("BERT Model")
    print("Generated Plan:", test_plan)

    print("\n--- Testing Agent 2: Resource Finder ---")
    if test_plan and "Could not" not in test_plan[0]:
        first_topic = test_plan[0].split('. ')[1] # Extracts the topic from "1. Topic"
        test_link = find_resource(first_topic)
        print(f"Link for '{first_topic}': {test_link}")