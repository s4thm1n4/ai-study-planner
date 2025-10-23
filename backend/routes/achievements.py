from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from ..database import get_db
from ..models import StudySession, Achievement, UserStreak
from ..schemas import AchievementResponse, StreakInfo

router = APIRouter()

@router.get("/achievements", response_model=List[AchievementResponse])
async def get_achievements(db: Session = Depends(get_db)):
    achievements = db.query(Achievement).all()
    return achievements

@router.get("/streak/info", response_model=StreakInfo)
async def get_streak_info(db: Session = Depends(get_db)):
    streak = db.query(UserStreak).first()
    if not streak:
        streak = UserStreak(current_streak=0, freezes_available=0)
        db.add(streak)
        db.commit()
    return streak

@router.post("/streak/use-freeze")
async def use_streak_freeze(db: Session = Depends(get_db)):
    streak = db.query(UserStreak).first()
    if not streak or streak.freezes_available <= 0:
        raise HTTPException(status_code=400, detail="No streak freezes available")
    
    streak.freezes_available -= 1
    streak.freeze_active = True
    db.commit()
    
    return {"success": True, "message": "Streak freeze applied successfully"}

@router.post("/achievement/unlock/{achievement_id}")
async def unlock_achievement(achievement_id: int, db: Session = Depends(get_db)):
    achievement = db.query(Achievement).filter(Achievement.id == achievement_id).first()
    if not achievement:
        raise HTTPException(status_code=404, detail="Achievement not found")
    
    if achievement.unlocked:
        raise HTTPException(status_code=400, detail="Achievement already unlocked")
    
    achievement.unlocked = True
    achievement.unlocked_at = datetime.now()
    db.commit()
    
    return {"success": True, "achievement": achievement}

@router.get("/study-log")
async def get_study_log(db: Session = Depends(get_db)):
    # Get study sessions for the last 30 days
    thirty_days_ago = datetime.now() - timedelta(days=30)
    sessions = db.query(StudySession).filter(StudySession.date >= thirty_days_ago).all()
    
    # Organize data by day
    daily_stats = {}
    topic_stats = {}
    
    for session in sessions:
        date_str = session.date.isoformat()
        if date_str not in daily_stats:
            daily_stats[date_str] = {"totalMinutes": 0, "topics": {}}
        
        daily_stats[date_str]["totalMinutes"] += session.duration
        
        topic_name = session.topic.name
        if topic_name not in daily_stats[date_str]["topics"]:
            daily_stats[date_str]["topics"][topic_name] = 0
        daily_stats[date_str]["topics"][topic_name] += session.duration
        
        # Update topic stats
        if topic_name not in topic_stats:
            topic_stats[topic_name] = {"totalHours": 0, "progressPercentage": 0}
        topic_stats[topic_name]["totalHours"] += session.duration / 60
    
    # Calculate progress percentages for topics
    for topic in topic_stats.values():
        topic["progressPercentage"] = min((topic["totalHours"] / 20) * 100, 100)  # Assuming 20 hours is 100%
    
    return {
        "dailyStats": daily_stats,
        "topicStats": topic_stats
    }