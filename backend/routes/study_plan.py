from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import StudySession, Task, Topic
from ..schemas import TodaysPlanResponse, TaskResponse

router = APIRouter()

@router.get("/study-plan/today", response_model=TodaysPlanResponse)
async def get_todays_plan(topic: str, db: Session = Depends(get_db)):
    """
    Get today's study plan for a specific topic
    """
    # Get the topic from database
    db_topic = db.query(Topic).filter(Topic.name == topic).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    # Get today's study sessions
    today = datetime.now().date()
    today_sessions = db.query(StudySession).filter(
        StudySession.topic_id == db_topic.id,
        StudySession.date == today
    ).all()
    
    # Calculate hours completed today
    hours_completed = sum(session.duration for session in today_sessions) / 60  # Convert minutes to hours
    
    # Get uncompleted tasks for today
    tasks = db.query(Task).filter(
        Task.topic_id == db_topic.id,
        Task.scheduled_date == today,
        Task.completed == False
    ).limit(5).all()
    
    return {
        "topic": topic,
        "targetHours": 2,  # This could be customizable per topic
        "hoursCompleted": hours_completed,
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "completed": task.completed
            } for task in tasks
        ]
    }

@router.post("/study-session/start")
async def start_study_session(topic: str, db: Session = Depends(get_db)):
    """
    Start a new study session for a topic
    """
    db_topic = db.query(Topic).filter(Topic.name == topic).first()
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    session = StudySession(
        topic_id=db_topic.id,
        date=datetime.now().date(),
        start_time=datetime.now().time(),
        duration=0  # Will be updated when session ends
    )
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    return {"session_id": session.id}

@router.post("/study-session/{session_id}/end")
async def end_study_session(session_id: int, db: Session = Depends(get_db)):
    """
    End an ongoing study session
    """
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session.end_time:
        raise HTTPException(status_code=400, detail="Session already ended")
    
    session.end_time = datetime.now().time()
    session.duration = int((datetime.combine(datetime.today(), session.end_time) - 
                          datetime.combine(datetime.today(), session.start_time)).total_seconds() / 60)
    
    db.commit()
    db.refresh(session)
    
    return {"duration": session.duration}

@router.post("/task/{task_id}/complete")
async def complete_task(task_id: int, db: Session = Depends(get_db)):
    """
    Mark a task as completed
    """
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed = True
    task.completion_date = datetime.now()
    
    db.commit()
    db.refresh(task)
    
    return {"status": "success"}