from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import your agent functions from agents.py
from agents import generate_schedule, find_resource

# This line creates the "app" object Uvicorn is looking for
app = FastAPI()

# Add CORS middleware to allow your frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate-plan")
def get_plan(data: dict):
    goal = data.get('goal')
    if not goal:
        return {"error": "Goal not provided"}

    # 1. Call Agent 1
    schedule_topics = generate_schedule(goal)

    # 2. Call Agent 2
    if not schedule_topics or "Could not" in schedule_topics[0]:
        return {"error": "Failed to generate a schedule."}

    first_topic_full = schedule_topics[0]
    # Clean up the topic text (e.g., "1. Learn about Rome" -> "Learn about Rome")
    first_topic_clean = first_topic_full.split('. ', 1)[-1]
    resource_link = find_resource(first_topic_clean)

    # 3. Return the combined result
    return {
        "schedule": schedule_topics,
        "first_resource": {
            "topic": first_topic_clean,
            "link": resource_link
        }
    }