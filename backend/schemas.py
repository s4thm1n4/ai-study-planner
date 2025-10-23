from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, List

class AchievementResponse(BaseModel):
    id: int
    name: str
    description: str
    icon: str
    unlocked: bool
    progress: float
    unlocked_at: Optional[datetime]

    class Config:
        from_attributes = True

class StreakInfo(BaseModel):
    current_streak: int
    freezes_available: int
    freeze_active: bool = False

    class Config:
        from_attributes = True

class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool

class TodaysPlanResponse(BaseModel):
    topic: str
    targetHours: float
    hoursCompleted: float
    tasks: List[TaskResponse]

class StudySessionCreate(BaseModel):
    topic: str
    duration: int  # minutes

class StudySessionResponse(BaseModel):
    id: int
    topic: str
    date: datetime
    duration: int
    
    class Config:
        from_attributes = True