import json
import re
import random
import os
from typing import Dict, List, Optional, Tuple
from datetime import datetime
from dataclasses import dataclass

@dataclass
class MotivationResponse:
    type: str
    mood_detected: str
    severity: str
    personalized_message: str
    motivational_quote: Optional[Dict] = None
    study_tips: List[Dict] = None
    stress_management: List[Dict] = None
    ai_generated_content: Optional[str] = None
    emergency_resources: List[Dict] = None
    follow_up_actions: List[str] = None

class AIMotivationAgent:
    def __init__(self):
        self.load_motivation_data()
        self.gemini_available = False  # Set to False since we're not using Gemini for now
        
        # Crisis detection keywords
        self.crisis_keywords = [
            "die", "suicide", "kill myself", "end it all", "worthless", 
            "hopeless", "can't go on", "want to disappear", "no point",
            "hate myself", "better off dead", "give up", "nothing matters"
        ]
        
        # Mood detection patterns
        self.mood_patterns = {
            "overwhelmed": ["overwhelmed", "too much", "can't handle", "drowning", "stressed out"],
            "frustrated": ["frustrated", "angry", "annoyed", "stuck", "hate this"],
            "anxious": ["anxious", "worried", "nervous", "scared", "panic"],
            "discouraged": ["discouraged", "giving up", "pointless", "hopeless", "defeated"],
            "confused": ["confused", "don't understand", "lost", "unclear", "complicated"],
            "tired": ["tired", "exhausted", "burned out", "drained", "no energy"],
            "procrastinating": ["procrastinating", "putting off", "can't start", "avoiding"],
            "imposter_syndrome": ["not good enough", "fraud", "don't belong", "fake", "imposter"]
        }
    
    def load_motivation_data(self):
        """Load motivation data from JSON file"""
        try:
            dataset_path = os.path.join(os.path.dirname(__file__), 'datasets', 'motivation_data.json')
            print(f"Looking for dataset at: {dataset_path}")
            
            if os.path.exists(dataset_path):
                with open(dataset_path, 'r', encoding='utf-8') as f:
                    self.data = json.load(f)
                print("Motivation data loaded successfully")
            else:
                print("Warning: motivation_data.json not found, using default data")
                self.data = self.get_default_data()
                
        except Exception as e:
            print(f"Error loading motivation data: {e}")
            self.data = self.get_default_data()
    
    def get_default_data(self):
        """Return default motivation data when file is not available"""
        return {
            "motivational_quotes": [
                {
                    "id": 1,
                    "quote": "The only way to do great work is to love what you do.",
                    "author": "Steve Jobs",
                    "category": "general_motivation",
                    "mood_target": "neutral"
                },
                {
                    "id": 2,
                    "quote": "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                    "author": "Winston Churchill",
                    "category": "perseverance",
                    "mood_target": "frustrated"
                }
            ],
            "study_tips": [
                {
                    "id": 1,
                    "tip": "Take regular breaks to maintain focus and prevent burnout.",
                    "category": "wellness",
                    "difficulty": "beginner",
                    "mood_target": "overwhelmed"
                },
                {
                    "id": 2,
                    "tip": "Break complex tasks into smaller, manageable steps.",
                    "category": "task_management",
                    "difficulty": "beginner",
                    "mood_target": "overwhelmed"
                }
            ],
            "encouragement_messages": [
                {
                    "id": 1,
                    "message": "Every expert was once a beginner. You're on the right path!",
                    "category": "confidence_building",
                    "mood_target": "imposter_syndrome"
                }
            ]
        }
    
    def detect_crisis(self, user_input: str) -> bool:
        """Detect if user input contains crisis indicators"""
        user_input_lower = user_input.lower()
        return any(keyword in user_input_lower for keyword in self.crisis_keywords)
    
    def analyze_mood(self, user_input: str) -> Dict[str, any]:
        """Analyze user mood from input text"""
        user_input_lower = user_input.lower()
        
        # Check for crisis first
        if self.detect_crisis(user_input_lower):
            return {
                "primary_mood": "crisis",
                "severity": "critical",
                "confidence": 1.0,
                "needs_immediate_support": True,
                "detected_keywords": [kw for kw in self.crisis_keywords if kw in user_input_lower]
            }
        
        # Analyze other moods
        mood_scores = {}
        for mood, keywords in self.mood_patterns.items():
            score = sum(1 for keyword in keywords if keyword in user_input_lower)
            if score > 0:
                mood_scores[mood] = score / len(keywords)  # Normalize score
        
        if not mood_scores:
            return {
                "primary_mood": "neutral",
                "severity": "low",
                "confidence": 0.5,
                "needs_immediate_support": False
            }
        
        # Get primary mood
        primary_mood = max(mood_scores, key=mood_scores.get)
        confidence = mood_scores[primary_mood]
        
        # Determine severity
        if confidence >= 0.3:
            severity = "high"
        elif confidence >= 0.15:
            severity = "medium"
        else:
            severity = "low"
        
        return {
            "primary_mood": primary_mood,
            "severity": severity,
            "confidence": confidence,
            "mood_scores": mood_scores,
            "needs_immediate_support": severity == "high" and primary_mood in ["overwhelmed", "frustrated", "anxious"]
        }
    
    def get_from_dataset(self, mood: str) -> Dict[str, any]:
        """Get relevant content from local dataset"""
        result = {
            "quote": None,
            "tips": [],
            "encouragement": None
        }
        
        # Get relevant quote
        relevant_quotes = [
            quote for quote in self.data.get("motivational_quotes", [])
            if quote.get("mood_target") == mood or quote.get("category") == mood
        ]
        if relevant_quotes:
            result["quote"] = random.choice(relevant_quotes)
        elif self.data.get("motivational_quotes"):
            # Fallback to any quote
            result["quote"] = random.choice(self.data["motivational_quotes"])
        
        # Get relevant study tips
        relevant_tips = [
            tip for tip in self.data.get("study_tips", [])
            if tip.get("mood_target") == mood
        ]
        result["tips"] = relevant_tips[:2]  # Limit to 2 tips
        
        # Get encouragement message
        relevant_encouragements = [
            msg for msg in self.data.get("encouragement_messages", [])
            if msg.get("mood_target") == mood
        ]
        if relevant_encouragements:
            result["encouragement"] = random.choice(relevant_encouragements)
        
        return result
    
    def get_crisis_response(self) -> MotivationResponse:
        """Generate crisis intervention response"""
        emergency_resources = [
            {
                "name": "National Suicide Prevention Lifeline",
                "contact": "988",
                "description": "24/7 crisis support and suicide prevention"
            },
            {
                "name": "Crisis Text Line",
                "contact": "Text HOME to 741741",
                "description": "Free crisis counseling via text message"
            }
        ]
        
        immediate_actions = [
            "Take slow, deep breaths - you are safe in this moment",
            "Reach out to a trusted friend, family member, or counselor immediately",
            "Call a crisis helpline if you need someone to talk to right now"
        ]
        
        return MotivationResponse(
            type="crisis_intervention",
            mood_detected="crisis",
            severity="critical",
            personalized_message="I'm really concerned about what you're going through right now. Your feelings are valid, but please know that you don't have to face this alone.",
            emergency_resources=emergency_resources,
            follow_up_actions=immediate_actions
        )
    
    async def generate_motivation(self, user_input: str, user_context: Dict = None) -> MotivationResponse:
        """Main method to generate comprehensive motivational response"""
        
        # Analyze mood
        mood_analysis = self.analyze_mood(user_input)
        
        # Handle crisis situations first
        if mood_analysis["primary_mood"] == "crisis":
            return self.get_crisis_response()
        
        primary_mood = mood_analysis["primary_mood"]
        severity = mood_analysis["severity"]
        
        # Get content from dataset
        dataset_content = self.get_from_dataset(primary_mood)
        
        # Create personalized message
        personalized_message = self.get_default_message(primary_mood)
        
        # Create response
        return MotivationResponse(
            type="motivational_support",
            mood_detected=primary_mood,
            severity=severity,
            personalized_message=personalized_message,
            motivational_quote=dataset_content["quote"],
            study_tips=dataset_content["tips"][:3],  # Limit to 3 tips
            follow_up_actions=self.get_follow_up_actions(primary_mood, severity)
        )
    
    def get_default_message(self, mood: str) -> str:
        """Get default empathetic message for mood"""
        messages = {
            "overwhelmed": "I can see you're feeling overwhelmed right now, and that's completely understandable. Sometimes our minds need a moment to process everything we're taking in.",
            "frustrated": "Your frustration shows how much you care about your success, and that dedication is actually one of your greatest strengths.",
            "anxious": "Feeling anxious about your studies is natural - it shows this matters to you. Let's work through this together.",
            "discouraged": "Everyone faces moments of discouragement in their learning journey. What you're feeling right now doesn't define your capabilities.",
            "confused": "Confusion is often the first step toward understanding. It means you're pushing your boundaries and growing.",
            "tired": "Mental fatigue is real, and acknowledging it shows self-awareness. Your brain needs rest to process and consolidate learning.",
            "procrastinating": "Procrastination often happens when we feel overwhelmed or uncertain. Let's break this down into manageable steps.",
            "imposter_syndrome": "Those feelings of self-doubt are more common than you think. Even experts started as beginners once.",
            "neutral": "Thank you for reaching out. I'm here to support you on your learning journey."
        }
        
        return messages.get(mood, "Thank you for sharing how you're feeling. Your honesty takes courage, and I'm here to support you through this.")
    
    def get_follow_up_actions(self, mood: str, severity: str) -> List[str]:
        """Get recommended follow-up actions"""
        actions = {
            "overwhelmed": [
                "List everything you need to do, then pick just the top 3 priorities",
                "Break your current task into 15-minute chunks",
                "Schedule a 20-minute break after each hour of study"
            ],
            "frustrated": [
                "Take a 10-minute walk to clear your mind",
                "Try explaining the concept to someone else or even to yourself out loud",
                "Switch to a different subject for 30 minutes, then return with fresh eyes"
            ],
            "anxious": [
                "Practice deep breathing for 5 minutes",
                "Write down your specific worries and tackle them one by one",
                "Start with the easiest task on your list to build momentum"
            ]
        }
        
        return actions.get(mood, [
            "Take a short break and do something you enjoy",
            "Remember your 'why' - what motivated you to start learning this",
            "Celebrate the effort you're putting in, regardless of the outcome"
        ])

# Test function
async def test_agent():
    agent = AIMotivationAgent()
    response = await agent.generate_motivation("I'm feeling really overwhelmed with my studies")
    print(f"Response: {response.personalized_message}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_agent())