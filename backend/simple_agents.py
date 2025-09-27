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
# Try to import intelligent topics generator
try:
    from intelligent_topics import IntelligentTopicGenerator
    INTELLIGENT_TOPICS_AVAILABLE = True
except ImportError:
    INTELLIGENT_TOPICS_AVAILABLE = False
    class IntelligentTopicGenerator:
        def __init__(self): pass
        def generate_contextual_topics(self, subject, num_topics=8):
            return [f"Topic {i+1}: {subject} Learning" for i in range(num_topics)]

# Import NLP processor for coursework demonstration
try:
    from backend.nlp_processor import nlp_processor
    NLP_AVAILABLE = True
except ImportError:
    try:
        from nlp_processor import nlp_processor
        NLP_AVAILABLE = True
    except ImportError:
        NLP_AVAILABLE = False
        print("[WARNING] NLP processor not available - coursework features disabled")

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
    original_subject: str = None  # For NLP demonstration
    nlp_feedback: str = None  # For NLP demonstration

@dataclass
class User:
    id: str
    first_name: str
    last_name: str
    username: str
    email: str
    hashed_password: str
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
        
        # Check if users table exists and migrate if needed
        cursor.execute("PRAGMA table_info(users)")
        columns_info = cursor.fetchall()
        existing_columns = [row[1] for row in columns_info]
        
        # Migrate existing table if it doesn't have the new columns
        if existing_columns and 'first_name' not in existing_columns:
            print("Migrating database: Adding first_name and last_name columns...")
            try:
                cursor.execute('ALTER TABLE users ADD COLUMN first_name TEXT')
                cursor.execute('ALTER TABLE users ADD COLUMN last_name TEXT')
                
                # Update existing records with placeholder values
                cursor.execute('''
                    UPDATE users 
                    SET first_name = 'User',
                        last_name = username
                    WHERE first_name IS NULL OR last_name IS NULL
                ''')
                conn.commit()
                print("Migration completed successfully!")
            except sqlite3.OperationalError as e:
                print(f"Migration error (might be already migrated): {e}")
        
        # Users table - create if not exists
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
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
    
    def register_user(self, first_name: str, last_name: str, username: str, email: str, password: str) -> Dict:
        """Register a new user"""
        try:
            user_id = hashlib.md5(email.encode()).hexdigest()
            hashed_password = self.hash_password(password)
            
            conn = sqlite3.connect(self.db.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO users (id, first_name, last_name, username, email, hashed_password, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (user_id, first_name, last_name, username, email, hashed_password, datetime.now().isoformat()))
            
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
                SELECT id, first_name, last_name, username, email, hashed_password
                FROM users WHERE email = ?
            ''', (email,))
            
            user_data = cursor.fetchone()
            conn.close()
            
            if not user_data:
                return {"status": "error", "message": "User not found"}
            
            user_id, first_name, last_name, username, email, hashed_password = user_data
            
            if self.verify_password(password, hashed_password):
                return {
                    "status": "success",
                    "user": {
                        "id": user_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "username": username,
                        "email": email
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
                SELECT id, first_name, last_name, username, email, created_at
                FROM users WHERE id = ?
            ''', (user_id,))
            
            user_data = cursor.fetchone()
            conn.close()
            
            if user_data:
                user_id, first_name, last_name, username, email, created_at = user_data
                return {
                    "id": user_id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "username": username,
                    "email": email,
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
        # Initialize the intelligent topic generator
        if INTELLIGENT_TOPICS_AVAILABLE:
            self.topic_generator = IntelligentTopicGenerator()
        else:
            self.topic_generator = IntelligentTopicGenerator()  # Uses fallback class
    
    def process_subject_with_nlp(self, raw_subject: str) -> str:
        """
        COURSEWORK DEMONSTRATION: Process subject input using NLP techniques
        Handles messy input like 'MACHINE LEARNING!!!', 'python programming???', etc.
        """
        if not NLP_AVAILABLE:
            return raw_subject.strip().title()
        
        print(f"\n[COURSEWORK] Applying NLP techniques to subject input...")
        print(f"[COURSEWORK] Raw input: '{raw_subject}'")
        
        # Apply full NLP pipeline to demonstrate all 6 techniques
        processed_subject = nlp_processor.process_subject_input(raw_subject)
        
        print(f"[COURSEWORK] Processed subject: '{processed_subject}'")
        
        # Try to match to existing subjects in database
        cleaned_subject = processed_subject.lower()
        
        # Look for matches in subject database using cleaned input
        best_match = None
        for subject_name in self.subjects_db.keys():
            if cleaned_subject in subject_name.lower() or subject_name.lower() in cleaned_subject:
                best_match = subject_name
                break
        
        # Use matched subject or processed input
        final_subject = best_match if best_match else processed_subject
        
        print(f"[COURSEWORK] Final subject: '{final_subject}' {'(matched from database)' if best_match else '(user input processed)'}")
        
        return final_subject
    
    def load_subjects_database(self):
        """Load subjects database with estimated hours and topics"""
        try:
            with open('datasets/subjects_database.json', 'r') as f:
                data = json.load(f)
                self.subjects_db = {subject['name']: subject for subject in data['subjects']}
                
            # Also create a searchable index by keywords
            self.subjects_by_keywords = {}
            for name, subject in self.subjects_db.items():
                # Index by keywords
                for keyword in subject.get('keywords', []):
                    if keyword not in self.subjects_by_keywords:
                        self.subjects_by_keywords[keyword] = []
                    self.subjects_by_keywords[keyword].append(name)
                
                # Index by category
                category = subject.get('category', '')
                if category and category not in self.subjects_by_keywords:
                    self.subjects_by_keywords[category] = []
                if category:
                    self.subjects_by_keywords[category].append(name)
        except Exception as e:
            print(f"Error loading subjects database: {e}")
            # Fallback subjects database
            self.subjects_db = {
                "Machine Learning": {
                    "estimated_hours": 30,
                    "difficulty": "intermediate",
                    "category": "Computer Science",
                    "keywords": ["ML", "algorithms", "data science", "prediction"],
                    "topics": ["Introduction to ML", "Supervised Learning", "Unsupervised Learning", "Model Evaluation", "Deep Learning Basics"]
                },
                "Python Programming": {
                    "estimated_hours": 25,
                    "difficulty": "beginner",
                    "category": "Programming",
                    "keywords": ["python", "coding", "programming", "scripting"],
                    "topics": ["Python Basics", "Data Structures", "Functions", "Object-Oriented Programming", "Libraries"]
                },
                "Data Science": {
                    "estimated_hours": 35,
                    "difficulty": "intermediate",
                    "category": "Computer Science",
                    "keywords": ["data analysis", "statistics", "visualization", "insights"],
                    "topics": ["Data Analysis", "Statistics", "Data Visualization", "Machine Learning", "Big Data"]
                }
            }
            self.subjects_by_keywords = {}
    
    def create_personalized_schedule(self, user_id: str, subject: str, 
                                   available_hours_per_day: int, 
                                   total_days: int, 
                                   knowledge_level: str = "beginner") -> StudyPlan:
        """Create a personalized study schedule with NLP-processed subject input"""
        
        # COURSEWORK DEMONSTRATION: Apply NLP techniques to subject input
        processed_subject = self.process_subject_with_nlp(subject)
        
        # Try to get subject information from database using processed subject
        subject_info = self.subjects_db.get(processed_subject)
        
        # Also try original subject if processed didn't match
        if not subject_info:
            subject_info = self.subjects_db.get(subject)
        
        # If not found, try fuzzy matching with keywords
        if not subject_info:
            subject_info = self._find_similar_subject(subject)
        
        # If still not found and AI is available, generate dynamic content
        if not subject_info and GENAI_AVAILABLE:
            subject_info = self._generate_subject_info_with_ai(subject, knowledge_level, total_days)
        
        # Fallback to generic structure if AI not available or fails
        if not subject_info:
            subject_info = {
                "estimated_hours": max(10, available_hours_per_day * total_days),
                "difficulty": knowledge_level,  # Use actual knowledge level
                "topics": self._generate_dynamic_topics(subject, total_days)
            }
        
        total_available_hours = available_hours_per_day * total_days
        estimated_hours = subject_info["estimated_hours"]
        
        # Adjust based on knowledge level
        if knowledge_level == "beginner":
            adjusted_hours = int(estimated_hours * 1.2)
        elif knowledge_level == "advanced":
            adjusted_hours = int(estimated_hours * 0.8)
        else:
            adjusted_hours = estimated_hours
        
        # Ensure we don't exceed available time
        final_hours = min(adjusted_hours, total_available_hours)
        
        # Create detailed schedule
        schedule = self._generate_detailed_schedule(
            subject, subject_info, final_hours, 
            available_hours_per_day, total_days
        )
        
        # Prepare NLP demonstration data
        original_subject = subject  # Store the original input
        display_subject = processed_subject if processed_subject else subject
        nlp_feedback = f"Processed from '{original_subject}'" if processed_subject and processed_subject != subject else None
        
        return StudyPlan(
            user_id=user_id,
            subject=display_subject,
            total_hours=final_hours,
            daily_hours=available_hours_per_day,
            difficulty=knowledge_level,  # Use user's selected knowledge level, not subject default
            start_date=datetime.now().isoformat(),
            schedule=schedule,
            resources=[],
            original_subject=original_subject,  # For NLP demonstration
            nlp_feedback=nlp_feedback  # For NLP demonstration
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
    
    def _generate_subject_info_with_ai(self, subject: str, knowledge_level: str, total_days: int) -> Dict:
        """Generate subject information using AI when available"""
        try:
            prompt = f"""
            Create a comprehensive study plan structure for the subject: "{subject}"
            
            Requirements:
            - Knowledge level: {knowledge_level}
            - Total study days: {total_days}
            - Provide estimated total hours needed
            - Create specific, actionable topics that progress logically
            - Determine appropriate difficulty level
            
            Return a JSON structure with:
            {{
                "estimated_hours": <number>,
                "difficulty": "<beginner|intermediate|advanced>",
                "topics": ["Topic 1", "Topic 2", "Topic 3", ...]
            }}
            
            Make topics specific to {subject} and appropriate for {knowledge_level} level.
            Create {min(total_days, 8)} main topics that can be studied progressively.
            """
            
            response = self.model.generate_content(prompt)
            
            # Try to parse JSON from response
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                try:
                    return json.loads(json_match.group())
                except json.JSONDecodeError:
                    pass
            
            # If JSON parsing fails, create structured data from text
            return self._extract_info_from_text(response.text, subject)
            
        except Exception as e:
            print(f"AI generation failed: {e}")
            return None
    
    def _extract_info_from_text(self, text: str, subject: str) -> Dict:
        """Extract structured information from AI response text"""
        import re
        lines = text.strip().split('\n')
        topics = []
        
        for line in lines:
            line = line.strip()
            if any(starter in line.lower() for starter in ['day', 'week', 'topic', 'chapter', 'learn', 'study']):
                # Clean and extract topic
                topic = re.sub(r'^[\d\.\-\*\s]*', '', line)  # Remove numbering
                topic = re.sub(r':\s*.*$', '', topic)  # Remove descriptions after colon
                if len(topic) > 3 and topic not in topics:
                    topics.append(topic[:50])  # Limit length
        
        # If no topics found, generate based on subject
        if not topics:
            topics = self._generate_dynamic_topics(subject, 6)
        
        return {
            "estimated_hours": len(topics) * 3,  # 3 hours per topic
            "difficulty": "intermediate",
            "topics": topics[:8]  # Limit to 8 topics
        }
    
    def _generate_dynamic_topics(self, subject: str, total_days: int) -> List[str]:
        """
        AI-powered topic generation that intelligently creates appropriate 
        learning topics for any subject without hardcoding.
        """
        # Use the intelligent topic generator
        num_topics = max(3, min(total_days, 8))  # Generate between 3-8 topics based on days
        
        try:
            # Generate contextually appropriate topics using AI
            topics = self.topic_generator.generate_contextual_topics(subject, num_topics)
            
            # Ensure we have the right number of topics
            if len(topics) < num_topics:
                # Fill any gaps with basic topics
                basic_topics = [
                    f"Fundamentals of {subject}",
                    f"Practical {subject} Applications", 
                    f"Advanced {subject} Concepts",
                    f"{subject} Best Practices",
                    f"Professional {subject} Skills"
                ]
                
                for topic in basic_topics:
                    if len(topics) < num_topics and topic not in topics:
                        topics.append(topic)
            
            return topics[:num_topics]
            
        except Exception as e:
            # Fallback to simple generic topics if AI generation fails
            print(f"AI topic generation failed: {e}. Using fallback.")
            return [
                f"Introduction to {subject}",
                f"{subject} Fundamentals",
                f"Practical {subject} Skills", 
                f"Advanced {subject} Techniques",
                f"{subject} Applications",
                f"Professional {subject} Development"
            ][:num_topics]
    
    def _find_similar_subject(self, subject: str) -> Dict:
        """Find similar subjects using keyword matching and fuzzy search"""
        subject_lower = subject.lower()
        best_match = None
        best_score = 0
        
        # Check direct keyword matches first
        for keyword, subject_names in getattr(self, 'subjects_by_keywords', {}).items():
            if subject_lower in keyword.lower() or keyword.lower() in subject_lower:
                for subject_name in subject_names:
                    subject_data = self.subjects_db.get(subject_name)
                    if subject_data:
                        score = len(keyword) / len(subject_lower)  # Longer matches get higher scores
                        if score > best_score:
                            best_score = score
                            best_match = subject_data.copy()
                            best_match['matched_via'] = f'keyword: {keyword}'
        
        # Check partial matches in subject names
        for subject_name, subject_data in self.subjects_db.items():
            # Check if search term is in subject name or vice versa
            if (subject_lower in subject_name.lower() or 
                any(word in subject_name.lower() for word in subject_lower.split())):
                score = 0.8  # High score for name matches
                if score > best_score:
                    best_score = score
                    best_match = subject_data.copy()
                    best_match['matched_via'] = f'name similarity: {subject_name}'
        
        return best_match if best_score > 0.3 else None  # Only return if reasonably good match

class ResourceFinderAgent:
    """Resource finder with basic search capabilities"""
    
    def __init__(self):
        self.load_resources_database()
        # Initialize NLP processor for coursework demonstration
        try:
            from nlp_processor import EnhancedNLPProcessor
            self.nlp_processor = EnhancedNLPProcessor()
        except ImportError:
            print("[DEBUG] NLP processor not available for ResourceFinderAgent")
            self.nlp_processor = None
    
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
                          resource_type: str = None, limit: int = 3, learning_style: str = "mixed") -> List[Dict]:
        """Find best resources using simple matching and generate fallbacks"""
        best_resources = []
        
        # First, try to find resources in the database
        if self.resources_db:
            for resource in self.resources_db:
                score = 0
                subject_lower = subject.lower()
                
                # Enhanced matching with scoring
                # Exact subject match gets highest score
                if subject_lower == resource.get('subject', '').lower():
                    score = 1.0
                # Subject contains the search term
                elif subject_lower in resource.get('subject', '').lower():
                    score = 0.9
                # Title contains the search term
                elif subject_lower in resource.get('title', '').lower():
                    score = 0.8
                # Keywords match
                elif any(subject_lower in keyword.lower() for keyword in resource.get('keywords', [])):
                    score = 0.85
                # Tags match
                elif any(subject_lower in tag.lower() for tag in resource.get('tags', [])):
                    score = 0.75
                # Category match
                elif subject_lower in resource.get('category', '').lower():
                    score = 0.7
                
                # If we found a match
                if score > 0:
                    # Filter by resource type if specified
                    if resource_type is None or resource.get('resource_type') == resource_type:
                        # Filter by difficulty if specified
                        if difficulty == "beginner" or resource.get('difficulty') == difficulty:
                            resource_copy = resource.copy()
                            
                            # Boost score based on learning style preference
                            if learning_style != "mixed":
                                resource_type_val = resource.get('resource_type', '').lower()
                                if learning_style == "visual" and resource_type_val in ['video_course', 'video_series', 'interactive_tutorial']:
                                    score += 0.15
                                elif learning_style == "auditory" and resource_type_val in ['video_course', 'podcast']:
                                    score += 0.15
                                elif learning_style == "reading" and resource_type_val in ['book', 'guide', 'tutorial', 'academic_paper']:
                                    score += 0.15
                                elif learning_style == "kinesthetic" and resource_type_val in ['interactive_course', 'interactive_tutorial', 'mobile_app']:
                                    score += 0.15
                            
                            resource_copy['similarity_score'] = min(score, 1.0)  # Cap at 1.0
                            best_resources.append(resource_copy)
            
            # Sort by similarity score (highest first)
            best_resources.sort(key=lambda x: x.get('similarity_score', 0), reverse=True)
            best_resources = best_resources[:limit]
        
        # If we don't have enough resources, generate fallback resources
        if len(best_resources) < limit:
            fallback_resources = self._generate_fallback_resources(subject, difficulty, limit - len(best_resources))
            best_resources.extend(fallback_resources)
        
        return best_resources[:limit]
    
    def _generate_fallback_resources(self, subject: str, difficulty: str, count: int) -> List[Dict]:
        """Generate fallback resources for any subject"""
        resources = []
        
        # Comprehensive educational platforms with diverse learning formats
        platforms = [
            {
                "name": "Coursera",
                "url_template": "https://www.coursera.org/search?query={}",
                "type": "online_course"
            },
            {
                "name": "edX",
                "url_template": "https://www.edx.org/search?q={}",
                "type": "online_course"
            },
            {
                "name": "Udemy",
                "url_template": "https://www.udemy.com/courses/search/?q={}",
                "type": "online_course"
            },
            {
                "name": "Khan Academy",
                "url_template": "https://www.khanacademy.org/search?page_search_query={}",
                "type": "interactive"
            },
            {
                "name": "YouTube",
                "url_template": "https://www.youtube.com/results?search_query={}+tutorial",
                "type": "video"
            },
            {
                "name": "Pluralsight",
                "url_template": "https://www.pluralsight.com/search?q={}",
                "type": "online_course"
            },
            {
                "name": "LinkedIn Learning",
                "url_template": "https://www.linkedin.com/learning/search?keywords={}",
                "type": "online_course"
            },
            {
                "name": "Skillshare",
                "url_template": "https://www.skillshare.com/search?query={}",
                "type": "creative_course"
            },
            {
                "name": "FreeCodeCamp",
                "url_template": "https://www.freecodecamp.org/learn",
                "type": "interactive"
            },
            {
                "name": "Codecademy",
                "url_template": "https://www.codecademy.com/search?query={}",
                "type": "interactive"
            },
            {
                "name": "MIT OpenCourseWare",
                "url_template": "https://ocw.mit.edu/search/?q={}",
                "type": "academic_course"
            },
            {
                "name": "Stanford Online",
                "url_template": "https://online.stanford.edu/search-catalog?keywords={}",
                "type": "academic_course"
            },
            {
                "name": "Udacity",
                "url_template": "https://www.udacity.com/catalog?query={}",
                "type": "nanodegree"
            },
            {
                "name": "Brilliant",
                "url_template": "https://brilliant.org/search/?q={}",
                "type": "interactive"
            },
            {
                "name": "Datacamp",
                "url_template": "https://www.datacamp.com/search?q={}",
                "type": "data_science_course"
            },
            {
                "name": "GitHub Learning Lab",
                "url_template": "https://lab.github.com/",
                "type": "hands_on"
            },
            {
                "name": "W3Schools",
                "url_template": "https://www.w3schools.com/",
                "type": "tutorial"
            },
            {
                "name": "MDN Web Docs",
                "url_template": "https://developer.mozilla.org/en-US/search?q={}",
                "type": "documentation"
            },
            {
                "name": "Crash Course (YouTube)",
                "url_template": "https://www.youtube.com/results?search_query=crash+course+{}",
                "type": "video_series"
            },
            {
                "name": "TED-Ed",
                "url_template": "https://ed.ted.com/search?qs={}",
                "type": "educational_video"
            }
        ]
        
        # Intelligently select platforms based on subject type
        subject_lower = subject.lower()
        
        # Define subject-specific platform preferences
        programming_subjects = ['programming', 'coding', 'javascript', 'python', 'java', 'web development', 'software']
        data_subjects = ['data science', 'machine learning', 'statistics', 'analytics', 'ai', 'artificial intelligence']
        business_subjects = ['business', 'marketing', 'finance', 'management', 'entrepreneurship']
        creative_subjects = ['design', 'art', 'photography', 'video', 'music', 'creative']
        academic_subjects = ['mathematics', 'physics', 'chemistry', 'biology', 'history', 'literature']
        
        # Select best platforms for the subject
        preferred_platforms = []
        
        if any(word in subject_lower for word in programming_subjects):
            preferred_platforms = ['FreeCodeCamp', 'Codecademy', 'Udemy', 'Pluralsight', 'GitHub Learning Lab', 'YouTube', 'MDN Web Docs']
        elif any(word in subject_lower for word in data_subjects):
            preferred_platforms = ['Datacamp', 'Coursera', 'edX', 'Udacity', 'Brilliant', 'YouTube', 'MIT OpenCourseWare']
        elif any(word in subject_lower for word in business_subjects):
            preferred_platforms = ['LinkedIn Learning', 'Coursera', 'edX', 'Udemy', 'YouTube', 'Stanford Online']
        elif any(word in subject_lower for word in creative_subjects):
            preferred_platforms = ['Skillshare', 'YouTube', 'Udemy', 'LinkedIn Learning', 'TED-Ed']
        elif any(word in subject_lower for word in academic_subjects):
            preferred_platforms = ['Khan Academy', 'MIT OpenCourseWare', 'Stanford Online', 'edX', 'Coursera', 'Crash Course (YouTube)', 'TED-Ed']
        else:
            # General subjects - use a balanced mix
            preferred_platforms = ['Coursera', 'edX', 'YouTube', 'Khan Academy', 'Udemy', 'Brilliant', 'TED-Ed']
        
        # Filter platforms based on preferences and ensure variety
        selected_platforms = []
        for platform_name in preferred_platforms:
            for platform in platforms:
                if platform['name'] == platform_name:
                    selected_platforms.append(platform)
                    break
            if len(selected_platforms) >= count:
                break
        
        # If we don't have enough, add remaining platforms
        if len(selected_platforms) < count:
            remaining_platforms = [p for p in platforms if p not in selected_platforms]
            selected_platforms.extend(remaining_platforms[:count - len(selected_platforms)])
        
        # Generate resources with better titles and descriptions
        # Clean subject for URLs using NLP techniques
        clean_subject = subject
        try:
            # Apply NLP cleaning for URL generation
            if hasattr(self, 'nlp_processor') and self.nlp_processor:
                clean_subject = self.nlp_processor.process_subject_input(subject)
            else:
                # Basic cleaning as fallback
                import re
                clean_subject = re.sub(r'[^\w\s]', '', subject)  # Remove punctuation
                clean_subject = ' '.join(clean_subject.split())  # Normalize whitespace
                clean_subject = clean_subject.lower().title()    # Proper case
        except Exception as e:
            print(f"[DEBUG] NLP processing failed for URL: {e}")
            # Basic cleaning as fallback
            import re
            clean_subject = re.sub(r'[^\w\s]', '', subject)
            clean_subject = ' '.join(clean_subject.split())
            clean_subject = clean_subject.lower().title()
        
        encoded_subject = clean_subject.replace(" ", "+").replace("&", "and")
        
        for i, platform in enumerate(selected_platforms[:count]):
            # Create more descriptive titles based on platform type
            if platform['type'] == 'interactive':
                title = f"Interactive {clean_subject} Tutorial - {platform['name']}"
                description = f"Hands-on interactive learning experience for {clean_subject} on {platform['name']}"
            elif platform['type'] == 'video' or platform['type'] == 'video_series':
                title = f"{clean_subject} Video Course - {platform['name']}"
                description = f"Comprehensive video tutorials and lectures on {clean_subject}"
            elif platform['type'] == 'academic_course':
                title = f"Academic {clean_subject} Course - {platform['name']}"
                description = f"University-level {clean_subject} course materials and lectures"
            elif platform['type'] == 'nanodegree':
                title = f"{clean_subject} Nanodegree Program - {platform['name']}"
                description = f"Industry-focused {clean_subject} program with real-world projects"
            else:
                title = f"{clean_subject} Course - {platform['name']}"
                description = f"Comprehensive {clean_subject} learning resources and courses"
            
            resources.append({
                "id": f"fallback_{i+1}",
                "title": title,
                "subject": clean_subject,
                "resource_type": platform["type"],
                "difficulty": difficulty,
                "url": platform["url_template"].format(encoded_subject),
                "description": description,
                "similarity_score": 0.75 - (i * 0.05),  # Slightly decrease score for lower priority
                "source": platform["name"],
                "tags": [clean_subject.lower(), "learning", difficulty, platform["type"]]
            })
        
        return resources

class MotivationCoachAgent:
    """Enhanced motivation coach with AI-powered personalization and ethics compliance"""
    
    def __init__(self):
        self.load_motivation_data()
        # Import enhanced motivation components
        try:
            from enhanced_motivation import (
                AdvancedSentimentAnalyzer, 
                DynamicContentGenerator, 
                IntelligentMotivationSelector
            )
            from ai_ethics import AIEthicsFramework
            
            self.sentiment_analyzer = AdvancedSentimentAnalyzer()
            self.content_generator = DynamicContentGenerator()
            self.content_selector = IntelligentMotivationSelector()
            self.ethics_framework = AIEthicsFramework()
            self.enhanced_mode = True
        except ImportError:
            print("Enhanced motivation system not available, using basic mode")
            self.enhanced_mode = False
    
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
    
    def get_motivation_message(self, 
                             user_input: str = "", 
                             mood: str = "neutral", 
                             progress_percentage: float = 0,
                             subject: str = None,
                             user_id: str = None) -> Dict:
        """Enhanced motivation with AI-powered personalization and ethics validation"""
        
        if self.enhanced_mode and user_input:
            return self._get_enhanced_motivation(user_input, progress_percentage, subject, user_id)
        else:
            return self._get_basic_motivation(mood, progress_percentage)
    
    def _get_enhanced_motivation(self, user_input: str, progress_percentage: float, 
                               subject: str, user_id: str) -> Dict:
        """Get AI-powered personalized motivation with ethics compliance"""
        
        # Analyze user's emotional state
        mood_profile = self.sentiment_analyzer.analyze_mood(user_input)
        
        # Generate content options
        available_content = []
        
        # Add database content
        quotes = self.motivation_data.get("motivational_quotes", [])
        for quote_data in quotes:
            if mood_profile.primary_mood in quote_data.get("mood_target", []):
                from enhanced_motivation import MotivationContent
                content = MotivationContent(
                    content=quote_data["quote"],
                    author=quote_data["author"],
                    category=quote_data.get("category", "general"),
                    mood_targets=[quote_data.get("mood_target", mood_profile.primary_mood)],
                    effectiveness_score=0.7,
                    source="database"
                )
                available_content.append(content)
        
        # Generate AI content using LLM for personalized responses
        try:
            # Always generate AI content for personalized experience
            ai_content = self.content_generator.generate_personalized_quote_sync(mood_profile, subject, user_input)
            if ai_content:
                available_content.append(ai_content)
                print(f"[SUCCESS] AI content generated: {ai_content.content[:50]}...")
        except Exception as e:
            print(f"[WARNING] AI content generation failed: {e}")
            # Generate dynamic encouragement based on user input
            dynamic_encouragement = self._generate_dynamic_encouragement(user_input, mood_profile)
            if dynamic_encouragement:
                available_content.append(dynamic_encouragement)
        
        # Select optimal content
        if available_content:
            selected_content = self.content_selector.select_optimal_content(
                available_content, mood_profile, user_id, self._get_time_context()
            )
        else:
            # Fallback
            selected_content = self.content_generator._fallback_quote(mood_profile)
        
        # Create response with ethics validation
        response_data = {
            "quote": {
                "content": selected_content.content,
                "author": selected_content.author
            },
            "mood_analysis": {
                "detected_mood": mood_profile.primary_mood,
                "energy_level": mood_profile.energy_level,
                "confidence_level": mood_profile.confidence_level,
                "stress_level": mood_profile.stress_level
            },
            "personalization": {
                "content_source": selected_content.source,
                "effectiveness_score": selected_content.effectiveness_score,
                "mood_match": mood_profile.primary_mood in selected_content.mood_targets
            },
            "encouragement": self._generate_contextual_encouragement(mood_profile, progress_percentage)
        }
        
        # Ethics validation
        is_ethical, ethics_report = self.ethics_framework.validate_ai_decision(
            agent_type="MotivationCoachAgent",
            input_data={"user_input": user_input, "mood": mood_profile.primary_mood},
            output_data=response_data,
            confidence_score=selected_content.effectiveness_score,
            reasoning=f"Selected {selected_content.source} content matching {mood_profile.primary_mood} mood",
            user_id=user_id
        )
        
        # Add transparency information
        response_data["transparency"] = {
            "why_this_content": f"Selected based on your detected mood ({mood_profile.primary_mood}) and current emotional state",
            "confidence_level": ethics_report["transparency_info"]["confidence_level"],
            "alternative_suggestions": ethics_report["transparency_info"]["alternative_options"][:2],
            "ethics_validated": is_ethical
        }
        
        if not is_ethical:
            # Use fallback content if ethics validation fails
            response_data = self._get_basic_motivation(mood_profile.primary_mood, progress_percentage)
            response_data["note"] = "Using validated fallback content for safety"
        
        return response_data
    
    def _get_basic_motivation(self, mood: str, progress_percentage: float) -> Dict:
        """Fallback basic motivation system"""
        quotes = self.motivation_data.get("motivational_quotes", [])
        tips = self.motivation_data.get("study_tips", [])
        
        # Simple mood-based selection
        mood_quotes = [q for q in quotes if mood in q.get("mood_target", [])]
        selected_quote = mood_quotes[0] if mood_quotes else (quotes[0] if quotes else {
            "quote": "Keep going! You're doing great!",
            "author": "Study Planner AI"
        })
        
        selected_tip = tips[0] if tips else {
            "tip": "Take regular breaks to maintain focus.",
            "category": "general"
        }
        
        return {
            "quote": selected_quote,
            "tip": selected_tip,
            "encouragement": f"You're {progress_percentage:.1%} through your journey. Keep it up!",
            "mode": "basic"
        }
    
    def _generate_contextual_encouragement(self, mood_profile, progress_percentage: float) -> str:
        """Generate contextual encouragement based on mood and progress"""
        encouragements = {
            'overwhelmed': [
                f"You're {progress_percentage:.1%} complete. Take it one step at a time!",
                "Breaking things down makes them manageable. You've got this!",
                "Progress is progress, no matter how small. Keep going!"
            ],
            'doubtful': [
                f"You've already made it {progress_percentage:.1%} of the way. That's proof you can do this!",
                "Every expert started where you are now. Trust your journey.",
                "Your willingness to learn shows your capability."
            ],
            'motivated': [
                f"Amazing energy! You're {progress_percentage:.1%} through and going strong!",
                "Channel this motivation - you're in the perfect mindset for learning!",
                "This enthusiasm will take you far. Keep up the momentum!"
            ],
            'exhausted': [
                f"You've made great progress at {progress_percentage:.1%}. Rest is part of success.",
                "Take care of yourself. Learning happens when you're well-rested too.",
                "Burnout is real. Your health comes first, learning comes second."
            ]
        }
        
        mood_messages = encouragements.get(mood_profile.primary_mood, [
            f"You're {progress_percentage:.1%} through your learning journey. Every step counts!"
        ])
        
        import random
        return random.choice(mood_messages)
    
    def _generate_dynamic_encouragement(self, user_input: str, mood_profile):
        """Generate dynamic encouragement based on user's specific input"""
        try:
            from backend.enhanced_motivation import MotivationContent
        except ImportError:
            from enhanced_motivation import MotivationContent
        from datetime import datetime
        
        input_lower = user_input.lower()
        
        # Analyze user input for specific encouragement
        if any(word in input_lower for word in ['machine learning', 'ml', 'ai', 'artificial intelligence']):
            content = "Machine Learning is challenging but incredibly rewarding. Every algorithm you master opens new possibilities!"
            author = "ML Mentor"
        elif any(word in input_lower for word in ['python', 'programming', 'coding', 'code']):
            content = "Programming is a superpower in today's world. Every line of code brings you closer to mastery!"
            author = "Code Coach"
        elif any(word in input_lower for word in ['math', 'mathematics', 'calculus', 'statistics']):
            content = "Math is the language of the universe. Each problem you solve strengthens your analytical mind!"
            author = "Math Mentor"
        elif any(word in input_lower for word in ['exam', 'test', 'quiz']):
            content = "Tests are opportunities to showcase your growth. You've prepared more than you realize!"
            author = "Exam Expert"
        elif any(word in input_lower for word in ['project', 'assignment', 'homework']):
            content = "Projects are where theory meets practice. This is where real learning happens!"
            author = "Project Guide"
        elif any(word in input_lower for word in ['struggling', 'difficult', 'hard', 'confusing']):
            content = "Struggle is the pathway to strength. Your brain is literally growing with each challenge!"
            author = "Growth Mindset Coach"
        elif any(word in input_lower for word in ['tired', 'exhausted', 'burned out']):
            content = "Rest is productive. Your brain consolidates learning during breaks. Take care of yourself!"
            author = "Wellness Guide"
        else:
            # Default dynamic encouragement
            content = f"Your dedication to learning shines through. Keep pushing forward - you're making real progress!"
            author = "Personal Learning Coach"
        
        return MotivationContent(
            content=content,
            author=author,
            category="dynamic_encouragement",
            mood_targets=[mood_profile.primary_mood],
            effectiveness_score=0.8,
            source="dynamic_ai_system",
            generated_at=datetime.now()
        )
    
    def _get_time_context(self) -> str:
        """Determine time context for content selection"""
        from datetime import datetime
        hour = datetime.now().hour
        
        if 5 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 22:
            return 'evening'
        else:
            return 'late_night'

class CoordinatorAgent:
    """Coordinates between all agents and manages the overall system"""
    
    def __init__(self):
        self.security_agent = SecurityAgent()
        self.schedule_agent = ScheduleCreatorAgent()
        self.resource_agent = ResourceFinderAgent()
        self.motivation_agent = MotivationCoachAgent()
        # Initialize enhanced motivation agent for mood-based responses
        try:
            from enhanced_motivation import AdvancedSentimentAnalyzer
            self.enhanced_motivation_agent = AdvancedSentimentAnalyzer()
        except ImportError:
            print("[DEBUG] Enhanced motivation not available")
            self.enhanced_motivation_agent = None
    
    async def generate_complete_study_plan(self, user_id: str, subject: str, 
                                         available_hours_per_day: int,
                                         total_days: int,
                                         learning_style: str = "mixed",
                                         knowledge_level: str = "beginner",
                                         user_mood: str = "neutral") -> Dict:
        """Generate a complete study plan using all agents"""
        
        try:
            # 1. Create personalized schedule
            study_plan = self.schedule_agent.create_personalized_schedule(
                user_id, subject, available_hours_per_day, total_days, knowledge_level
            )
            
            # 2. Find best resources with learning style preference
            resources = self.resource_agent.find_best_resources(
                subject, knowledge_level, limit=5, learning_style=learning_style
            )
            study_plan.resources = resources
            
            # 3. Get personalized motivation based on user mood (use processed subject)
            processed_subject = study_plan.subject  # Use the cleaned subject from NLP processing
            if self.enhanced_motivation_agent:
                try:
                    # Use enhanced motivation with processed subject and user mood
                    # First analyze the mood
                    mood_profile = self.enhanced_motivation_agent.analyze_mood(
                        text=f"I'm feeling {user_mood} about learning {processed_subject}",
                        context={"subject": processed_subject, "user_mood": user_mood}
                    )
                    # Generate personalized quote
                    motivation_content = self.enhanced_motivation_agent.generate_personalized_quote_sync(
                        mood_profile=mood_profile,
                        subject=processed_subject,
                        user_input=f"I'm feeling {user_mood} about learning {processed_subject}"
                    )
                    # Convert to expected format
                    motivation = {
                        "quote": {
                            "content": motivation_content.content,
                            "author": motivation_content.author
                        },
                        "encouragement": f"Keep going! Your progress in {processed_subject} matters."
                    }
                except Exception as e:
                    print(f"[DEBUG] Enhanced motivation failed, using fallback: {e}")
                    motivation = self._get_mood_based_motivation(user_mood, processed_subject)
            else:
                motivation = self._get_mood_based_motivation(user_mood, processed_subject)
            
            # Debug logging for hour calculation
            print(f"[HOUR DEBUG] Daily hours: {study_plan.daily_hours}")
            print(f"[HOUR DEBUG] Total hours: {study_plan.total_hours}")
            print(f"[HOUR DEBUG] Calculated: {study_plan.daily_hours} * days = total")
            
            return {
                "status": "success",
                "study_plan": {
                    "subject": study_plan.subject,
                    "total_hours": study_plan.total_hours,
                    "daily_hours": study_plan.daily_hours,
                    "difficulty": study_plan.difficulty,
                    "schedule": study_plan.schedule,
                    "resources": study_plan.resources,
                    "motivation": motivation,
                    "original_subject": getattr(study_plan, 'original_subject', None),
                    "nlp_feedback": getattr(study_plan, 'nlp_feedback', None)
                }
            }
            
        except Exception as e:
            return {
                "status": "error",
                "message": f"Failed to generate study plan: {str(e)}"
            }
    
    def _get_mood_based_motivation(self, user_mood: str, subject: str):
        """Generate mood-specific motivation messages"""
        mood_messages = {
            "excited": {
                "quote": f"Your excitement for {subject} is contagious! Channel that energy into focused learning sessions.",
                "author": "Enthusiasm Coach"
            },
            "focused": {
                "quote": f"Perfect mindset for learning {subject}! Your focus will be your superpower today.",
                "author": "Concentration Expert"
            },
            "neutral": {
                "quote": f"Starting with a calm mind is perfect for {subject}. Let's build momentum together!",
                "author": "Learning Strategist"
            },
            "stressed": {
                "quote": f"Take a deep breath. {subject} might seem overwhelming, but we'll break it down into manageable steps.",
                "author": "Stress Management Coach"
            },
            "tired": {
                "quote": f"Rest when needed, but don't give up on {subject}. Small steps lead to big achievements!",
                "author": "Wellness Guide"
            }
        }
        
        mood_data = mood_messages.get(user_mood, mood_messages["neutral"])
        return {
            "quote": {
                "content": mood_data["quote"],
                "author": mood_data["author"]
            },
            "encouragement": f"Remember: every expert was once a beginner in {subject}. You're on the right path!"
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