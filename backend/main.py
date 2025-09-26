from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, Annotated
import asyncio
import jwt
import os
from datetime import datetime, timedelta

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

# Pydantic models
class StudyGoal(BaseModel):
    goal: str

class AdvancedStudyRequest(BaseModel):
    subject: str
    available_hours_per_day: int
    total_days: int
    learning_style: Optional[str] = "mixed"
    knowledge_level: Optional[str] = "beginner"

class ResourceRequest(BaseModel):
    subject: str
    resource_type: Optional[str] = None
    limit: Optional[int] = 5

class MotivationRequest(BaseModel):
    mood_text: str

class UserRegistration(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

# JWT Authentication Functions
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
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/login")
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

# ===== PROTECTED Study Planner Endpoints =====
@app.get("/api/subjects")
async def get_available_subjects(current_user: dict = Depends(get_current_user)):
    """Get list of available subjects (PROTECTED)"""
    try:
        subjects = list(coordinator.schedule_agent.subjects_db.keys())
        return subjects  # Return as simple list for frontend compatibility
    except Exception as e:
        print(f"Error getting subjects: {e}")
        # Fallback subjects
        return [
            "Machine Learning",
            "Python Programming", 
            "Data Science",
            "Web Development",
            "Database Management",
            "Cybersecurity",
            "Cloud Computing",
            "Mobile Development"
        ]

@app.post("/api/generate-advanced-plan")
async def generate_advanced_plan(
    request: AdvancedStudyRequest, 
    current_user: dict = Depends(get_current_user)
):
    """Generate a comprehensive study plan using the multi-agent system (PROTECTED)"""
    try:
        print(f"[DEBUG] Generating advanced plan for user: {current_user['id']}")
        print(f"[DEBUG] Request: {request}")
        
        result = await coordinator.generate_complete_study_plan(
            user_id=current_user["id"],
            subject=request.subject,
            available_hours_per_day=request.available_hours_per_day,
            total_days=request.total_days,
            learning_style=request.learning_style or "mixed",
            knowledge_level=request.knowledge_level or "beginner"
        )
        
        print(f"[DEBUG] Plan generation result: {result}")
        
        if result["status"] == "error":
            raise HTTPException(status_code=500, detail=result["message"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Exception in generate_advanced_plan: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/find-resources")
async def find_resources(
    request: ResourceRequest,
    current_user: dict = Depends(get_current_user)
):
    """Find educational resources for a subject (PROTECTED)"""
    try:
        print(f"[DEBUG] Finding resources for: {request.subject}")
        
        resources = coordinator.resource_agent.find_best_resources(
            subject=request.subject,
            difficulty="beginner",  # Default difficulty
            resource_type=request.resource_type,
            limit=request.limit or 5
        )
        
        print(f"[DEBUG] Found {len(resources)} resources")
        
        return {"resources": resources}
    except Exception as e:
        print(f"[ERROR] Exception in find_resources: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/get-motivation")
async def get_motivation(
    request: MotivationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Get motivational message based on user mood (PROTECTED)"""
    try:
        print(f"[DEBUG] Getting motivation for mood: {request.mood_text}")
        
        # Analyze sentiment
        sentiment = coordinator.motivation_agent.analyze_sentiment(request.mood_text)
        
        # Get motivation message
        motivation = coordinator.motivation_agent.get_motivation_message(
            mood=sentiment["mood"], 
            progress_percentage=0.5
        )
        
        return {
            "sentiment": sentiment,
            "motivation": motivation
        }
    except Exception as e:
        print(f"[ERROR] Exception in get_motivation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Legacy endpoint for simple plan generation (for homepage demo)
@app.post("/api/generate-plan")
async def generate_study_plan_legacy(request: StudyGoal):
    """Legacy endpoint - generates simple 3-day plan"""
    try:
        print(f"[DEBUG] Received legacy request for goal: '{request.goal}'")
        
        # Import here to avoid circular imports
        from simple_agents import generate_schedule, find_resource
        
        # Generate schedule using the async function
        print("[DEBUG] Calling generate_schedule...")
        schedule_items = await generate_schedule(request.goal)
        print(f"[DEBUG] Generated schedule items: {schedule_items}")
        
        # Find resource using the async function
        print("[DEBUG] Calling find_resource...")
        resource_info = await find_resource(request.goal)
        print(f"[DEBUG] Found resource: {resource_info}")
        
        # Ensure we return a proper response structure
        response_data = {
            "schedule": schedule_items if schedule_items else [
                f"Day 1: Introduction to {request.goal}",
                f"Day 2: Core concepts and practice", 
                f"Day 3: Advanced topics and review"
            ],
            "resource": resource_info if resource_info else {
                "topic": request.goal,
                "link": f"https://www.google.com/search?q={request.goal.replace(' ', '+')}"
            }
        }
        
        print(f"[DEBUG] Final response: {response_data}")
        return response_data
        
    except Exception as e:
        print(f"[ERROR] Exception in generate_study_plan_legacy: {e}")
        import traceback
        traceback.print_exc()
        
        # Return a structured error response instead of raising HTTPException
        return {
            "schedule": [
                f"Day 1: Begin learning {request.goal}",
                f"Day 2: Practice {request.goal} fundamentals",
                f"Day 3: Review and apply {request.goal} concepts"
            ],
            "resource": {
                "topic": f"{request.goal} - Basic Resources",
                "link": f"https://www.google.com/search?q={request.goal.replace(' ', '+')}"
            },
            "error": f"Generated fallback plan due to error: {str(e)}"
        }

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile (protected endpoint)"""
    return {"status": "success", "user": current_user}

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