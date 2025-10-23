from sqlalchemy import Column, Integer, String, Boolean, Date, Time, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String)
    target_hours = Column(Float, default=2.0)
    created_at = Column(Date, default=datetime.now().date())
    
    sessions = relationship("StudySession", back_populates="topic")
    tasks = relationship("Task", back_populates="topic")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time, nullable=True)
    duration = Column(Integer)  # Duration in minutes
    
    topic = relationship("Topic", back_populates="sessions")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    title = Column(String)
    description = Column(String, nullable=True)
    scheduled_date = Column(Date)
    completed = Column(Boolean, default=False)
    completion_date = Column(Date, nullable=True)
    
    topic = relationship("Topic", back_populates="tasks")