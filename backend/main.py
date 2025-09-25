from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Annotated
import asyncio
import jwt
import os
from datetime import datetime, timedelta
from functools import wraps

# Import both legacy and simplified multi-agent functions
from agents import generate_schedule, find_resource
from simple_agents import coordinator

app = FastAPI(title="AI Study Planner - Multi-Agent System", version="2.0.0")

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Security setup
security = HTTPBearer(auto_error=False)

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
    first_name: str
    last_name: str
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserProfile(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: str
    email: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict
    expires_in: int

class ProtectedRequest(BaseModel):
    """Base class for requests that require authentication"""
    pass

# ===== JWT Authentication Functions =====
def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str):
    """Verify JWT token and return user data"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return {"user_id": user_id, "exp": payload.get("exp")}
    except jwt.PyJWTError:
        return None

async def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]):
    """Dependency to get current authenticated user"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token_data = verify_token(credentials.credentials)
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from database
    user = coordinator.security_agent.get_user_by_id(token_data["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

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

# ===== PROTECTED Study Planner Endpoints =====
@app.post("/api/v2/generate-advanced-plan")
async def generate_advanced_plan(
    request: AdvancedStudyRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Generate a comprehensive study plan using the multi-agent system (PROTECTED)"""
    try:
        result = await coordinator.generate_complete_study_plan(
            user_id=current_user["id"],  # Use authenticated user ID
            subject=request.subject,
            available_hours_per_day=request.available_hours_per_day,
            total_days=request.total_days,
            learning_style=request.learning_style or current_user["learning_style"],
            knowledge_level=request.knowledge_level or current_user["knowledge_level"]
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        return result["study_plan"]
        
    except HTTPException:
        raise
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
async def get_resources(
    subject: str, 
    difficulty: str = "beginner", 
    limit: int = 5,
    current_user: dict = Depends(get_current_user)
):
    """Get educational resources for a subject (PROTECTED)"""
    try:
        # Use user's knowledge level if not specified
        if difficulty == "beginner":
            difficulty = current_user.get("knowledge_level", "beginner")
            
        resources = coordinator.resource_agent.find_best_resources(
            subject=subject,
            difficulty=difficulty,
            limit=limit
        )
        return {"resources": resources, "user_id": current_user["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/motivation")
async def get_motivation(
    text: str = "", 
    current_user: dict = Depends(get_current_user)
):
    """Get motivational message based on user mood (PROTECTED)"""
    try:
        if text:
            sentiment = coordinator.motivation_agent.analyze_sentiment(text)
            mood = sentiment["mood"]
        else:
            mood = "neutral"
        
        motivation = coordinator.motivation_agent.get_motivation_message(mood, 0.5)
        motivation["user_id"] = current_user["id"]
        return motivation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/subjects")
async def get_available_subjects(current_user: dict = Depends(get_current_user)):
    """Get list of available subjects (PROTECTED)"""
    try:
        subjects = list(coordinator.schedule_agent.subjects_db.keys())
        return {
            "subjects": subjects, 
            "user_knowledge_level": current_user["knowledge_level"],
            "user_learning_style": current_user["learning_style"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ===== Authentication Endpoints =====
@app.post("/api/register")
async def register_user(user_data: UserRegistration):
    """Register a new user"""
    try:
        result = coordinator.security_agent.register_user(
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            username=user_data.username,
            email=user_data.email,
            password=user_data.password
        )
        
        if result["status"] == "error":
            raise HTTPException(status_code=400, detail=result["message"])
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login", response_model=LoginResponse)
async def login_user(login_data: UserLogin):
    """Authenticate user and return JWT token"""
    try:
        # Authenticate user
        result = coordinator.security_agent.authenticate_user(
            email=login_data.email,
            password=login_data.password
        )
        
        if result["status"] == "error":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result["message"],
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create JWT token
        access_token = create_access_token(data={"sub": result["user"]["id"]})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": result["user"],
            "expires_in": JWT_EXPIRATION_HOURS * 3600  # in seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile (protected endpoint)"""
    return {"status": "success", "user": current_user}

@app.post("/api/logout")
async def logout_user():
    """Logout user (client should delete token)"""
    return {"status": "success", "message": "Logged out successfully"}

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