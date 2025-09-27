"""
Advanced Multi-Agent System for AI Study Planner
Implements 4 specialized agents with IR and ML capabilities
"""

import os
import json
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import asyncio
from dataclasses import dataclass
import hashlib

# Load environment variables
load_dotenv()

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
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
        self.db = DatabaseManager()
    
    def hash_password(self, password: str) -> str:
        """Hash a password"""
        return self.pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, self.secret_key, algorithm="HS256")
    
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

class ScheduleCreatorAgent:
    """Enhanced schedule creator with personalization and datasets"""
    
    def __init__(self):
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
            self.subjects_db = {}
    
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
        hours_per_topic = total_hours // len(topics)
        
        schedule = []
        current_day = 0
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
    """Advanced resource finder with IR capabilities"""
    
    def __init__(self):
        self.load_resources_database()
        self.vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        self.build_resource_index()
    
    def load_resources_database(self):
        """Load educational resources database"""
        try:
            with open('datasets/educational_resources.json', 'r') as f:
                self.resources_db = json.load(f)
        except:
            self.resources_db = []
    
    def build_resource_index(self):
        """Build TF-IDF index for resources"""
        if not self.resources_db:
            return
        
        # Create corpus from resource descriptions and tags
        corpus = []
        for resource in self.resources_db:
            text = f"{resource.get('title', '')} {resource.get('description', '')} {' '.join(resource.get('tags', []))}"
            corpus.append(text)
        
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
    
    def find_best_resources(self, subject: str, difficulty: str = "beginner", 
                          resource_type: str = None, limit: int = 3) -> List[Dict]:
        """Find best resources using IR techniques"""
        if not self.resources_db:
            return []
        
        # Create query vector
        query = f"{subject} {difficulty}"
        query_vector = self.vectorizer.transform([query])
        
        # Calculate similarity scores
        similarity_scores = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        
        # Get resource indices sorted by similarity
        resource_indices = similarity_scores.argsort()[::-1]
        
        best_resources = []
        for idx in resource_indices[:limit * 2]:  # Get more to filter
            resource = self.resources_db[idx]
            
            # Filter by subject and difficulty
            if (resource.get('subject', '').lower() == subject.lower() or 
                subject.lower() in resource.get('subject', '').lower()):
                
                if resource_type is None or resource.get('resource_type') == resource_type:
                    resource['similarity_score'] = float(similarity_scores[idx])
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
            self.motivation_data = {
                "motivational_quotes": [],
                "study_tips": [],
                "progress_messages": []
            }
    
    def analyze_sentiment(self, text: str) -> Dict:
        """Analyze sentiment of user input"""
        blob = TextBlob(text)
        polarity = blob.sentiment.polarity
        
        if polarity > 0.1:
            mood = "positive"
        elif polarity < -0.1:
            mood = "negative"
        else:
            mood = "neutral"
        
        return {
            "mood": mood,
            "polarity": polarity,
            "subjectivity": blob.sentiment.subjectivity
        }
    
    def get_motivation_message(self, mood: str = "neutral", 
                             progress_percentage: float = 0) -> Dict:
        """Get appropriate motivation based on mood and progress"""
        
        # Get motivational quote based on mood
        quotes = self.motivation_data.get("motivational_quotes", [])
        suitable_quotes = [q for q in quotes if q.get("mood_target") == mood or mood == "neutral"]
        
        if not suitable_quotes:
            suitable_quotes = quotes
        
        selected_quote = suitable_quotes[0] if suitable_quotes else {
            "quote": "Keep going! You're doing great!",
            "author": "Study Planner AI"
        }
        
        # Get study tip
        tips = self.motivation_data.get("study_tips", [])
        selected_tip = tips[int(progress_percentage * len(tips)) % len(tips)] if tips else {
            "tip": "Take regular breaks to maintain focus."
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
            
            # 4. Save to database (simplified for demo)
            # In production, you'd save the complete plan to database
            
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