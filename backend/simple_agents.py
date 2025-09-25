"""
Simplified Multi-Agent System for AI Study Planner
Works with basic functionality while maintaining the multi-agent structure
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio
from dataclasses import dataclass
import hashlib

# Try to import optional libraries, fall back to basic functionality if not available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    def load_dotenv(): pass
    load_dotenv()

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

@dataclass
class StudyPlan:
    user_id: str
    subject: str
    total_hours: int
    daily_hours: int
    difficulty: str
    start_date: str
    schedule: List[Dict]
    resources: List[Dict]

@dataclass
class User:
    id: str
    username: str
    email: str
    hashed_password: str
    learning_style: str
    knowledge_level: str
    created_at: str

class DatabaseManager:
    """Handles all database operations"""
    
    def __init__(self, db_path: str = "study_planner.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialize database tables"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                learning_style TEXT,
                knowledge_level TEXT,
                created_at TEXT
            )
        ''')
        
        # Study plans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS study_plans (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                subject TEXT,
                total_hours INTEGER,
                daily_hours INTEGER,
                difficulty TEXT,
                start_date TEXT,
                schedule TEXT,
                resources TEXT,
                created_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # User progress table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_progress (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                plan_id TEXT,
                completed_hours INTEGER,
                current_topic TEXT,
                progress_percentage REAL,
                last_activity TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        conn.commit()
        conn.close()

class SecurityAgent:
    """Handles authentication, authorization, and data security"""
    
    def __init__(self):
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
        self.db = DatabaseManager()
    
    def hash_password(self, password: str) -> str:
        """Simple hash function - in production use bcrypt"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password"""
        return self.hash_password(plain_password) == hashed_password
    
    def register_user(self, username: str, email: str, password: str, 
                     learning_style: str = "mixed", knowledge_level: str = "beginner") -> Dict:
        """Register a new user"""
        try:
            user_id = hashlib.md5(email.encode()).hexdigest()
            hashed_password = self.hash_password(password)
            
            conn = sqlite3.connect(self.db.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO users (id, username, email, hashed_password, 
                                 learning_style, knowledge_level, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, username, email, hashed_password, 
                  learning_style, knowledge_level, datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
            
            return {"status": "success", "user_id": user_id, "message": "User registered successfully"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def authenticate_user(self, email: str, password: str) -> Dict:
        """Authenticate user login"""
        try:
            conn = sqlite3.connect(self.db.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, hashed_password, learning_style, knowledge_level
                FROM users WHERE email = ?
            ''', (email,))
            
            user_data = cursor.fetchone()
            conn.close()
            
            if not user_data:
                return {"status": "error", "message": "User not found"}
            
            user_id, username, email, hashed_password, learning_style, knowledge_level = user_data
            
            if self.verify_password(password, hashed_password):
                return {
                    "status": "success",
                    "user": {
                        "id": user_id,
                        "username": username,
                        "email": email,
                        "learning_style": learning_style,
                        "knowledge_level": knowledge_level
                    },
                    "message": "Login successful"
                }
            else:
                return {"status": "error", "message": "Invalid password"}
                
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    def get_user_by_id(self, user_id: str) -> Optional[Dict]:
        """Get user information by ID"""
        try:
            conn = sqlite3.connect(self.db.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, learning_style, knowledge_level, created_at
                FROM users WHERE id = ?
            ''', (user_id,))
            
            user_data = cursor.fetchone()
            conn.close()
            
            if user_data:
                user_id, username, email, learning_style, knowledge_level, created_at = user_data
                return {
                    "id": user_id,
                    "username": username,
                    "email": email,
                    "learning_style": learning_style,
                    "knowledge_level": knowledge_level,
                    "created_at": created_at
                }
            return None
            
        except Exception as e:
            return None

class ScheduleCreatorAgent:
    """Enhanced schedule creator with personalization and datasets"""
    
    def __init__(self):
        if GENAI_AVAILABLE:
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.model = genai.GenerativeModel('gemini-pro')
        self.load_subjects_database()
    
    def load_subjects_database(self):
        """Load subjects database with estimated hours and topics"""
        try:
            with open('datasets/subjects_database.json', 'r') as f:
                data = json.load(f)
                self.subjects_db = {subject['name']: subject for subject in data['subjects']}
        except:
            # Fallback subjects database
            self.subjects_db = {
                "Machine Learning": {
                    "estimated_hours": 30,
                    "difficulty": "intermediate",
                    "topics": ["Introduction to ML", "Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Deep Learning Basics"]
                },
                "Python Programming": {
                    "estimated_hours": 25,
                    "difficulty": "beginner",
                    "topics": ["Python Basics", "Data Structures", "Functions", "Object-Oriented Programming", "Libraries"]
                },
                "Data Science": {
                    "estimated_hours": 35,
                    "difficulty": "intermediate",
                    "topics": ["Data Analysis", "Statistics", "Data Visualization", "Machine Learning", "Big Data"]
                }
            }
    
    def create_personalized_schedule(self, user_id: str, subject: str, 
                                   available_hours_per_day: int, 
                                   total_days: int, 
                                   knowledge_level: str = "beginner") -> StudyPlan:
        """Create a personalized study schedule"""
        
        # Get subject information from database
        subject_info = self.subjects_db.get(subject, {
            "estimated_hours": 20,
            "difficulty": "intermediate",
            "topics": ["Introduction", "Core Concepts", "Advanced Topics", "Practice"]
        })
        
        total_available_hours = available_hours_per_day * total_days
        estimated_hours = subject_info["estimated_hours"]
        
        # Adjust based on knowledge level
        if knowledge_level == "beginner":
            adjusted_hours = int(estimated_hours * 1.2)
        elif knowledge_level == "advanced":
            adjusted_hours = int(estimated_hours * 0.8)
        else:
            adjusted_hours = estimated_hours
        
        # Create detailed schedule
        schedule = self._generate_detailed_schedule(
            subject, subject_info, adjusted_hours, 
            available_hours_per_day, total_days
        )
        
        return StudyPlan(
            user_id=user_id,
            subject=subject,
            total_hours=adjusted_hours,
            daily_hours=available_hours_per_day,
            difficulty=subject_info.get("difficulty", "intermediate"),
            start_date=datetime.now().isoformat(),
            schedule=schedule,
            resources=[]
        )
    
    def _generate_detailed_schedule(self, subject: str, subject_info: Dict, 
                                  total_hours: int, daily_hours: int, total_days: int) -> List[Dict]:
        """Generate detailed daily schedule"""
        topics = subject_info.get("topics", ["Introduction", "Main Concepts", "Practice"])
        hours_per_topic = max(1, total_hours // len(topics))
        
        schedule = []
        current_topic_index = 0
        remaining_topic_hours = hours_per_topic
        
        for day in range(total_days):
            day_plan = {
                "day": day + 1,
                "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d"),
                "hours": daily_hours,
                "topics": [],
                "goals": []
            }
            
            hours_left_today = daily_hours
            
            while hours_left_today > 0 and current_topic_index < len(topics):
                current_topic = topics[current_topic_index]
                hours_to_spend = min(hours_left_today, remaining_topic_hours)
                
                day_plan["topics"].append({
                    "topic": current_topic,
                    "hours": hours_to_spend,
                    "type": "study"
                })
                
                hours_left_today -= hours_to_spend
                remaining_topic_hours -= hours_to_spend
                
                if remaining_topic_hours <= 0:
                    current_topic_index += 1
                    if current_topic_index < len(topics):
                        remaining_topic_hours = hours_per_topic
            
            schedule.append(day_plan)
        
        return schedule

class ResourceFinderAgent:
    """Resource finder with basic search capabilities"""
    
    def __init__(self):
        self.load_resources_database()
    
    def load_resources_database(self):
        """Load educational resources database"""
        try:
            with open('datasets/educational_resources.json', 'r') as f:
                self.resources_db = json.load(f)
        except:
            # Fallback resources
            self.resources_db = [
                {
                    "id": 1,
                    "title": "Machine Learning Course - Andrew Ng",
                    "subject": "Machine Learning",
                    "resource_type": "online_course",
                    "difficulty": "beginner",
                    "url": "https://www.coursera.org/learn/machine-learning",
                    "description": "Comprehensive introduction to machine learning concepts and algorithms.",
                    "tags": ["machine learning", "algorithms", "python"],
                    "rating": 4.9,
                    "source": "Coursera"
                },
                {
                    "id": 2,
                    "title": "Python for Everybody Specialization",
                    "subject": "Python Programming",
                    "resource_type": "online_course",
                    "difficulty": "beginner",
                    "url": "https://www.coursera.org/specializations/python",
                    "description": "Learn to program and analyze data with Python.",
                    "tags": ["python", "programming", "data analysis"],
                    "rating": 4.8,
                    "source": "Coursera"
                }
            ]
    
    def find_best_resources(self, subject: str, difficulty: str = "beginner", 
                          resource_type: str = None, limit: int = 3) -> List[Dict]:
        """Find best resources using simple matching"""
        if not self.resources_db:
            return []
        
        best_resources = []
        
        for resource in self.resources_db:
            # Simple matching based on subject
            if (subject.lower() in resource.get('subject', '').lower() or
                subject.lower() in resource.get('title', '').lower() or
                any(subject.lower() in tag.lower() for tag in resource.get('tags', []))):
                
                # Filter by resource type if specified
                if resource_type is None or resource.get('resource_type') == resource_type:
                    # Add similarity score for sorting
                    resource['similarity_score'] = 0.8  # Placeholder score
                    best_resources.append(resource)
                    
                    if len(best_resources) >= limit:
                        break
        
        return best_resources

class MotivationCoachAgent:
    """Provides motivation and tracks progress"""
    
    def __init__(self):
        self.load_motivation_data()
    
    def load_motivation_data(self):
        """Load motivational quotes and tips"""
        try:
            with open('datasets/motivation_data.json', 'r') as f:
                self.motivation_data = json.load(f)
        except:
            # Fallback motivation data
            self.motivation_data = {
                "motivational_quotes": [
                    {
                        "quote": "The only way to do great work is to love what you do.",
                        "author": "Steve Jobs",
                        "category": "general_motivation"
                    },
                    {
                        "quote": "Learning never exhausts the mind.",
                        "author": "Leonardo da Vinci",
                        "category": "learning"
                    }
                ],
                "study_tips": [
                    {
                        "tip": "Use the Pomodoro Technique: 25 minutes of focused study, then a 5-minute break.",
                        "category": "time_management"
                    },
                    {
                        "tip": "Create mind maps to visualize connections between concepts.",
                        "category": "learning_technique"
                    }
                ],
                "progress_messages": []
            }
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Simple sentiment analysis"""
        # Basic keyword-based sentiment analysis
        positive_words = ["good", "great", "excellent", "amazing", "love", "enjoy", "excited", "confident"]
        negative_words = ["bad", "terrible", "awful", "hate", "frustrated", "overwhelmed", "difficult", "hard"]
        
        text_lower = text.lower()
        positive_count = sum(1 for word in positive_words if word in text_lower)
        negative_count = sum(1 for word in negative_words if word in text_lower)
        
        if positive_count > negative_count:
            mood = "positive"
            polarity = 0.5
        elif negative_count > positive_count:
            mood = "negative"
            polarity = -0.5
        else:
            mood = "neutral"
            polarity = 0.0
        
        return {
            "mood": mood,
            "polarity": polarity,
            "subjectivity": 0.5
        }
    
    def get_motivation_message(self, mood: str = "neutral", 
                             progress_percentage: float = 0) -> Dict:
        """Get appropriate motivation based on mood and progress"""
        
        # Get motivational quote
        quotes = self.motivation_data.get("motivational_quotes", [])
        selected_quote = quotes[0] if quotes else {
            "quote": "Keep going! You're doing great!",
            "author": "Study Planner AI"
        }
        
        # Get study tip
        tips = self.motivation_data.get("study_tips", [])
        selected_tip = tips[0] if tips else {
            "tip": "Take regular breaks to maintain focus.",
            "category": "general"
        }
        
        return {
            "quote": selected_quote,
            "tip": selected_tip,
            "encouragement": f"You're {progress_percentage:.1%} through your journey. Keep it up!"
        }

class CoordinatorAgent:
    """Coordinates between all agents and manages the overall system"""
    
    def __init__(self):
        self.security_agent = SecurityAgent()
        self.schedule_agent = ScheduleCreatorAgent()
        self.resource_agent = ResourceFinderAgent()
        self.motivation_agent = MotivationCoachAgent()
    
    async def generate_complete_study_plan(self, user_id: str, subject: str, 
                                         available_hours_per_day: int,
                                         total_days: int,
                                         learning_style: str = "mixed",
                                         knowledge_level: str = "beginner") -> Dict:
        """Generate a complete study plan using all agents"""
        
        try:
            # 1. Create personalized schedule
            study_plan = self.schedule_agent.create_personalized_schedule(
                user_id, subject, available_hours_per_day, total_days, knowledge_level
            )
            
            # 2. Find best resources
            resources = self.resource_agent.find_best_resources(
                subject, knowledge_level, limit=5
            )
            study_plan.resources = resources
            
            # 3. Get initial motivation
            motivation = self.motivation_agent.get_motivation_message("positive", 0.0)
            
            return {
                "status": "success",
                "study_plan": {
                    "subject": study_plan.subject,
                    "total_hours": study_plan.total_hours,
                    "daily_hours": study_plan.daily_hours,
                    "difficulty": study_plan.difficulty,
                    "schedule": study_plan.schedule,
                    "resources": study_plan.resources,
                    "motivation": motivation
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to generate study plan: {str(e)}"
            }

# Initialize the coordinator agent
coordinator = CoordinatorAgent()

# Legacy functions for backward compatibility
async def generate_schedule(goal: str) -> List[str]:
    """Legacy function - now uses enhanced schedule creator"""
    try:
        result = await coordinator.generate_complete_study_plan(
            user_id="anonymous",
            subject=goal,
            available_hours_per_day=2,
            total_days=7,
            knowledge_level="beginner"
        )
        
        if result["status"] == "success":
            schedule = result["study_plan"]["schedule"]
            return [f"Day {day['day']}: {', '.join([topic['topic'] for topic in day['topics']])}" 
                   for day in schedule[:3]]  # Return first 3 days for compatibility
        else:
            return ["Could not generate a schedule."]
    except Exception as e:
        print(f"Error in generate_schedule: {e}")
        return ["Could not generate a schedule."]

async def find_resource(topic: str) -> Dict:
    """Legacy function - now uses enhanced resource finder"""
    try:
        resources = coordinator.resource_agent.find_best_resources(topic, limit=1)
        if resources:
            resource = resources[0]
            return {
                "topic": resource.get("title", topic),
                "link": resource.get("url", "No link available")
            }
        else:
            return {
                "topic": topic,
                "link": "No resources found"
            }
    except Exception as e:
        print(f"Error in find_resource: {e}")
        return {
            "topic": topic,
            "link": "Error finding resources"
        }

if __name__ == "__main__":
    # Test the system
    async def test_system():
        result = await coordinator.generate_complete_study_plan(
            user_id="test_user",
            subject="Machine Learning",
            available_hours_per_day=3,
            total_days=14,
            knowledge_level="intermediate"
        )
        print(json.dumps(result, indent=2))
    
    asyncio.run(test_system())