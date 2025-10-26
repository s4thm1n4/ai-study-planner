# Full corrected backend/main.py
from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware # Import CORS
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel # Corrected import!
from typing import Optional, List
import asyncio
from jose import jwt
from jose.exceptions import JWTError
import os
import sys
from datetime import datetime, timedelta

# Add current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import agents - Ensure these files exist and are correct
try:
    # Try relative import first (when running as module using uvicorn)
    from .simple_agents import generate_schedule, find_resource, coordinator
    from . import file_parser # NEW
    from . import summarize_agent # NEW
    print("[IMPORT] Successfully imported agents using relative paths.")
except ImportError as e1:
    print(f"[IMPORT-WARN] Relative import failed: {e1}. Trying absolute.")
    try:
        # Try absolute import from backend directory (less common)
        from backend.simple_agents import generate_schedule, find_resource, coordinator
        from backend import file_parser # NEW
        from backend import summarize_agent # NEW
        print("[IMPORT] Successfully imported agents using absolute paths.")
    except ImportError as e2:
        # Fallback if running main.py directly from backend folder (NOT recommended for FastAPI)
        print(f"[IMPORT-ERROR] Absolute import failed: {e2}. Trying direct import (might fail).")
        try:
            from simple_agents import generate_schedule, find_resource, coordinator
            import file_parser # NEW
            import summarize_agent # NEW
            print("[IMPORT] Successfully imported agents using direct import (fallback).")
        except ImportError as e3:
            print(f"[FATAL IMPORT ERROR] Could not import agent modules: {e3}")
            # Depending on your setup, you might need to adjust PYTHONPATH
            # Or ensure you run uvicorn from the project root directory
            coordinator = None # Set to None to indicate failure
            file_parser = None
            summarize_agent = None


app = FastAPI(title="AI Study Planner - Multi-Agent System", version="2.0.1") # Version bump

# --- ✅ CORS FIX ---
# Configure CORS to allow requests from your frontend (localhost:8001)
# And allow necessary methods and headers for file uploads.
origins = [
    "http://localhost:8001", # Your frontend origin
    "http://127.0.0.1:8001",
    # Add any other origins if needed (e.g., deployed frontend URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], # Explicitly allow POST and OPTIONS
    allow_headers=["Authorization", "Content-Type"], # Allow necessary headers
)
print("[CONFIG] CORS Middleware added for origins:", origins)
# --- END CORS FIX ---


# JWT Configuration (Same as before)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
security = HTTPBearer()

# --- User Models and Auth Functions (Keep your original logic) ---
class User(BaseModel): username: str; email: str; password: str
class UserLogin(BaseModel): username: str; password: str
# !!! Replace mock_users_db with your actual user storage/retrieval !!!
# !!! Use proper password hashing (e.g., passlib with Argon2/bcrypt) !!!
mock_users_db = { "testuser": { "id": "1", "username": "testuser", "email": "test@example.com", "hashed_password": "hashed_password_replace_with_real_one", "learning_style": "visual", "knowledge_level": "beginner" } }

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=JWT_EXPIRATION_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        user_id: str = payload.get("id") # Assuming you added 'id' during token creation
        if username is None or user_id is None:
            raise credentials_exception
        # !!! Replace with actual database lookup !!!
        user = mock_users_db.get(username)
        if user is None or user.get("id") != user_id:
            raise credentials_exception
        # Return user info without the password hash
        user_info = {k: v for k, v in user.items() if k != "hashed_password"}
        return user_info # Return user info without hash
    except JWTError:
        raise credentials_exception

# --- Original Auth Endpoints ---
@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
async def register_user(user: User):
    # !!! Replace with real registration: hash password, save to DB !!!
    if user.username in mock_users_db: raise HTTPException(status_code=400, detail="Username exists")
    hashed_password = f"hashed_{user.password}" # Replace with Argon2 or bcrypt hashing
    new_user_id = str(len(mock_users_db) + 1)
    new_user = { "id": new_user_id, "username": user.username, "email": user.email, "hashed_password": hashed_password, "learning_style": "default", "knowledge_level": "beginner" }
    mock_users_db[user.username] = new_user
    print(f"[AUTH] Registered user: {user.username}")
    return {"id": new_user_id, "username": user.username, "email": user.email}

@app.post("/api/auth/token")
async def login_for_access_token(form_data: UserLogin):
     # !!! Replace with real login: fetch user, verify hash !!!
    user = mock_users_db.get(form_data.username)
    # Replace mock password check with hash verification
    is_password_correct = (user and f"hashed_{form_data.password}" == user["hashed_password"]) # Example check
    if not is_password_correct:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    access_token = create_access_token(data={"sub": user["username"], "id": user["id"]})
    user_info = {k: v for k, v in user.items() if k != "hashed_password"} # Exclude hash
    print(f"[AUTH] User login successful: {user['username']}")
    return {"access_token": access_token, "token_type": "bearer", "user": user_info}

@app.get("/api/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    # current_user already excludes the hash from get_current_user
    print(f"[AUTH] Get current user: {current_user.get('username')}")
    return current_user


# --- Original Agent Endpoints ---
class PlannerRequest(BaseModel):
    subject: str
    available_hours_per_day: int
    total_days: int
    knowledge_level: str
    learning_style: Optional[str] = None
    study_purpose: Optional[str] = None
    exam_date: Optional[str] = None
    learning_challenges: Optional[List[str]] = None

@app.post("/api/planner/generate-advanced")
async def generate_advanced_plan(req: PlannerRequest, current_user: dict = Depends(get_current_user)):
    # Make sure 'coordinator' object is initialized and available
    if not coordinator:
         raise HTTPException(status_code=503, detail="Coordinator agent not available.")
    print(f"[API] Generate plan request User={current_user.get('id')} Subject={req.subject}")
    try:
        plan = await coordinator.generate_complete_study_plan(
            user_id=current_user["id"], subject=req.subject, available_hours_per_day=req.available_hours_per_day,
            total_days=req.total_days, knowledge_level=req.knowledge_level, learning_style=req.learning_style,
            study_purpose=req.study_purpose, exam_date=req.exam_date, learning_challenges=req.learning_challenges
        )
        return {"plan": plan}
    except Exception as e:
        print(f"[ERROR] Advanced plan generation: {e}")
        # import traceback; traceback.print_exc(); # Uncomment for detailed logs
        raise HTTPException(status_code=500, detail="Failed to generate plan")

@app.get("/api/resources/find-advanced")
async def find_advanced_resources(topic: str, current_user: dict = Depends(get_current_user)):
     if not coordinator or not hasattr(coordinator, 'resource_agent'):
         raise HTTPException(status_code=503, detail="Resource agent not available.")
     print(f"[API] Find resources request User={current_user.get('id')} Topic={topic}")
     try:
        resources = coordinator.resource_agent.find_best_resources(topic, limit=5)
        return {"resources": resources}
     except Exception as e:
        print(f"[ERROR] Advanced resource finding: {e}")
        raise HTTPException(status_code=500, detail="Failed to find resources")

class MotivationRequest(BaseModel): user_input: str

@app.post("/api/motivation/get-advanced")
async def get_advanced_motivation(req: MotivationRequest, current_user: dict = Depends(get_current_user)):
    if not coordinator or not hasattr(coordinator, 'motivation_agent'):
         raise HTTPException(status_code=503, detail="Motivation agent not available.")
    print(f"[API] Motivation request User={current_user.get('id')}")
    try:
        response = await coordinator.motivation_agent.generate_motivation(req.user_input, current_user["id"])
        return response
    except Exception as e:
        print(f"[ERROR] Advanced motivation: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate motivation")

# --- ⭐ SUMMARIZER ENDPOINT (Corrected) ⭐ ---
@app.post("/api/summarize-document")
async def summarize_document_endpoint(
    current_user: dict = Depends(get_current_user),
    file: UploadFile = File(...),
    question: Optional[str] = Form(None) # Get question from Form data
):
    """
    Summarizes or answers questions about an uploaded document (PDF, PPTX, Image).
    (PROTECTED)
    """
    # Ensure agents were imported correctly
    if not file_parser or not summarize_agent:
         print("[ERROR] Summarizer endpoint called but agents not loaded!")
         raise HTTPException(status_code=503, detail="Summarizer components not available.")

    print(f"[API] Summarize request User={current_user.get('id')} File={file.filename} Q='{question}'")
    try:
        # 1. Parse the uploaded file to get text
        extracted_text = await file_parser.parse_document(file)

        # Check PyMuPDF extraction result specifically
        if file.content_type == "application/pdf" and (not extracted_text or extracted_text.isspace()):
             print(f"[API-WARN] PyMuPDF extracted no text from {file.filename}. Might be image-based or protected.")
             # Consider adding OCR for PDFs here if needed in the future
             raise HTTPException(status_code=400, detail="Could not extract text from this PDF. It might contain only images or be protected.")
        elif not extracted_text or extracted_text.isspace():
             print(f"[API-WARN] No text extracted from {file.filename} (Type: {file.content_type}). Check Tesseract for images.")
             raise HTTPException(status_code=400, detail="Could not extract text from the document. Check file content and Tesseract installation (for images).")


        # 2. Check if it's a Q&A or a Summary request
        if question:
            print(f"[API-DEBUG] Calling Q&A agent for {file.filename}")
            answer = await summarize_agent.answer_question(extracted_text, question)
            print(f"[API-DEBUG] Q&A successful for {file.filename}")
            return { "status": "success", "type": "qa", "filename": file.filename, "question": question, "answer": answer }
        else:
            print(f"[API-DEBUG] Calling Summarize agent for {file.filename}")
            summary = await summarize_agent.summarize_text(extracted_text)
            print(f"[API-DEBUG] Summarization successful for {file.filename}")
            return { "status": "success", "type": "summary", "filename": file.filename, "summary": summary }

    except ValueError as ve: # Catch unsupported file types from file_parser
        print(f"[API-ERROR] Unsupported file type: {ve}")
        raise HTTPException(status_code=415, detail=str(ve)) # 415 Unsupported Media Type
    except HTTPException as http_exc:
        # Re-raise HTTPExceptions (like the 400 for no text)
        print(f"[API-ERROR] HTTP Exception during summarization: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        print(f"[API-ERROR] Summarize endpoint failed unexpectedly: {e}")
        # import traceback; traceback.print_exc(); # Uncomment for detailed logs
        raise HTTPException(status_code=500, detail=f"An internal server error occurred processing the document.")


# --- Root & Ethics Endpoints ---
@app.get("/api/ethics")
async def get_ethics_policy(): return { "version": "1.0.0", "principles": { "...": "..." } } # Keep concise
@app.get("/")
async def root(): return { "message": "AI Study Planner API", "version": "2.0.1", "features": ["Planner", "Resources", "Motivation", "Auth", "Progress", "Summarizer"] }

# Comment out if __name__ == "__main__": block if using 'uvicorn backend.main:app --reload'
# if __name__ == "__main__":
#     import uvicorn
#     print("Starting server via __main__ is NOT recommended. Use: uvicorn backend.main:app --reload")
#     # uvicorn.run(app, host="127.0.0.1", port=8000) # Usually run from command line