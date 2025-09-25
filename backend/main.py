from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import asyncio

# Import both legacy and simplified multi-agent functions
from agents import generate_schedule, find_resource
from simple_agents import coordinator

app = FastAPI(title="AI Study Planner - Multi-Agent System", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class StudyGoal(BaseModel):
    goal: str

class AdvancedStudyRequest(BaseModel):
    subject: str
    available_hours_per_day: int
    total_days: int
    learning_style: Optional[str] = "mixed"
    knowledge_level: Optional[str] = "beginner"

class UserRegistration(BaseModel):
    username: str
    email: str
    password: str
    learning_style: Optional[str] = "mixed"
    knowledge_level: Optional[str] = "beginner"

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    username: str
    email: str
    learning_style: str
    knowledge_level: str

# Legacy endpoint for backward compatibility
@app.post("/api/generate-plan")
async def generate_plan_legacy(data: dict):
    """Legacy endpoint for backward compatibility"""
    goal = data.get('goal')
    if not goal:
        return {"error": "Goal not provided"}

    try:
        # Import and use the original synchronous functions
        from agents import generate_schedule as sync_generate_schedule, find_resource as sync_find_resource
        
        # 1. Call Agent 1 (synchronous)
        schedule_topics = sync_generate_schedule(goal)

        # 2. Call Agent 2 (synchronous)
        if not schedule_topics or "Could not" in str(schedule_topics[0]):
            return {"error": "Failed to generate a schedule."}

        first_topic_full = str(schedule_topics[0])
        # Clean up the topic text (e.g., "1. Learn about Rome" -> "Learn about Rome")
        first_topic_clean = first_topic_full.split('. ', 1)[-1] if '. ' in first_topic_full else first_topic_full
        resource_link = sync_find_resource(first_topic_clean)

        # 3. Return the combined result
        return {
            "schedule": schedule_topics,
            "first_resource": {
                "topic": first_topic_clean,
                "link": resource_link
            }
        }
    except Exception as e:
        print(f"Error in legacy endpoint: {e}")
        return {"error": str(e)}

# New advanced endpoints
@app.post("/api/v2/generate-advanced-plan")
async def generate_advanced_plan(request: AdvancedStudyRequest):
    """Generate a comprehensive study plan using the multi-agent system"""
    try:
        result = await coordinator.generate_complete_study_plan(
            user_id="anonymous",  # In production, get from authentication
            subject=request.subject,
            available_hours_per_day=request.available_hours_per_day,
            total_days=request.total_days,
            learning_style=request.learning_style,
            knowledge_level=request.knowledge_level
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        return result["study_plan"]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/register")
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        result = coordinator.security_agent.register_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            learning_style=user_data.learning_style,
            knowledge_level=user_data.knowledge_level
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/{subject}")
async def get_resources(subject: str, difficulty: str = "beginner", limit: int = 5):
    """Get educational resources for a subject"""
    try:
        resources = coordinator.resource_agent.find_best_resources(
            subject=subject,
            difficulty=difficulty,
            limit=limit
        )
        return {"resources": resources}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motivation")
async def get_motivation(text: str = ""):
    """Get motivational message based on user mood"""
    try:
        if text:
            sentiment = coordinator.motivation_agent.analyze_sentiment(text)
            mood = sentiment["mood"]
        else:
            mood = "neutral"
        
        motivation = coordinator.motivation_agent.get_motivation_message(mood, 0.5)
        return motivation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subjects")
async def get_available_subjects():
    """Get list of available subjects"""
    try:
        subjects = list(coordinator.schedule_agent.subjects_db.keys())
        return {"subjects": subjects}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Authentication Endpoints =====
@app.post("/api/register")
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        result = coordinator.security_agent.register_user(
            username=user_data.username,
            email=user_data.email,
            password=user_data.password,
            learning_style=user_data.learning_style,
            knowledge_level=user_data.knowledge_level
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
async def login_user(login_data: UserLogin):
    """Authenticate user login"""
    try:
        result = coordinator.security_agent.authenticate_user(
            email=login_data.email,
            password=login_data.password
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=401, detail=result["message"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile information"""
    try:
        user = coordinator.security_agent.get_user_by_id(user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"status": "success", "user": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {
        "message": "AI Study Planner - Multi-Agent System API",
        "version": "2.0.0",
        "features": [
            "Personalized Schedule Creation",
            "Advanced Resource Finding with IR",
            "Motivation Coaching with Sentiment Analysis",
            "User Management and Security",
            "Progress Tracking"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)