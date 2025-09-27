"""
Enhanced Motivation System with Advanced Sentiment Analysis and Ethical AI
Implements personalized motivation with mood-aware content selection and AI ethics compliance
"""

import os
import json
import random
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import re
from collections import defaultdict
import asyncio

# Try to import advanced libraries
try:
    import google.generativeai as genai
    from dotenv import load_dotenv
    load_dotenv()
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

@dataclass
class MoodProfile:
    """Represents user's emotional and motivational state"""
    energy_level: float  # 0.0 to 1.0
    confidence_level: float  # 0.0 to 1.0
    stress_level: float  # 0.0 to 1.0
    motivation_level: float  # 0.0 to 1.0
    frustration_level: float  # 0.0 to 1.0
    primary_mood: str
    context: Dict = None

@dataclass
class MotivationContent:
    """Represents motivational content with metadata"""
    content: str
    author: str
    category: str
    mood_targets: List[str]
    effectiveness_score: float
    usage_count: int = 0
    source: str = "database"
    generated_at: Optional[datetime] = None

class AdvancedSentimentAnalyzer:
    """Advanced multi-dimensional sentiment analysis for educational context"""
    
    def __init__(self):
        self.mood_keywords = self._initialize_mood_keywords()
        self.context_patterns = self._initialize_context_patterns()
        
    def _initialize_mood_keywords(self) -> Dict[str, Dict[str, List[str]]]:
        """Initialize comprehensive mood keyword mappings"""
        return {
            'energy': {
                'high': ['energetic', 'excited', 'motivated', 'ready', 'pumped', 'active', 'vibrant'],
                'medium': ['okay', 'fine', 'normal', 'steady', 'focused'],
                'low': ['tired', 'exhausted', 'drained', 'sleepy', 'lethargic', 'burnt out', 'weary']
            },
            'confidence': {
                'high': ['confident', 'sure', 'capable', 'strong', 'prepared', 'ready', 'skilled'],
                'medium': ['uncertain', 'questioning', 'learning', 'trying'],
                'low': ['doubt', 'imposter', 'fake', 'inadequate', 'unqualified', 'lost', 'confused']
            },
            'stress': {
                'high': ['overwhelmed', 'stressed', 'panic', 'anxious', 'pressure', 'deadline', 'cramming'],
                'medium': ['busy', 'tight schedule', 'concerned', 'worried'],
                'low': ['calm', 'relaxed', 'peaceful', 'composed', 'chill']
            },
            'motivation': {
                'high': ['determined', 'driven', 'passionate', 'committed', 'focused', 'ambitious'],
                'medium': ['interested', 'willing', 'curious', 'engaging'],
                'low': ['unmotivated', 'procrastinating', 'lazy', 'bored', 'disinterested', 'avoiding']
            },
            'frustration': {
                'high': ['frustrated', 'angry', 'stuck', 'blocked', 'annoyed', 'difficult', 'impossible'],
                'medium': ['challenging', 'hard', 'tricky', 'complex'],
                'low': ['smooth', 'easy', 'flowing', 'clear', 'straightforward']
            }
        }
    
    def _initialize_context_patterns(self) -> Dict[str, List[str]]:
        """Initialize context-aware patterns"""
        return {
            'exam_stress': ['exam', 'test', 'quiz', 'assessment', 'evaluation', 'grade'],
            'deadline_pressure': ['deadline', 'due', 'submit', 'assignment', 'project'],
            'learning_struggle': ['difficult', 'hard', 'complex', 'confusing', 'stuck'],
            'progress_celebration': ['finished', 'completed', 'achieved', 'learned', 'mastered'],
            'starting_journey': ['beginning', 'start', 'new', 'first time', 'introduction']
        }
    
    def analyze_mood(self, text: str, context: Dict = None) -> MoodProfile:
        """Perform advanced multi-dimensional mood analysis"""
        text_lower = text.lower()
        scores = {}
        
        # Calculate dimension scores
        for dimension, levels in self.mood_keywords.items():
            dimension_scores = []
            
            for level, keywords in levels.items():
                weight = {'high': 1.0, 'medium': 0.5, 'low': 0.0}.get(level, 0.5)
                keyword_matches = [keyword for keyword in keywords if keyword in text_lower]
                
                # Add weight for each keyword match
                for match in keyword_matches:
                    dimension_scores.append(weight)
            
            # Calculate final score for dimension
            if dimension_scores:
                scores[dimension] = sum(dimension_scores) / len(dimension_scores)
            else:
                scores[dimension] = 0.5  # Default neutral
        
        # Determine primary mood
        primary_mood = self._determine_primary_mood(scores, text_lower)
        
        # Add context awareness
        detected_context = self._detect_context(text_lower)
        
        return MoodProfile(
            energy_level=scores.get('energy', 0.5),
            confidence_level=scores.get('confidence', 0.5),
            stress_level=scores.get('stress', 0.5),
            motivation_level=scores.get('motivation', 0.5),
            frustration_level=scores.get('frustration', 0.5),
            primary_mood=primary_mood,
            context=detected_context
        )
    
    def _determine_primary_mood(self, scores: Dict[str, float], text: str) -> str:
        """Determine the primary mood based on dimension scores and keywords"""
        
        # Direct keyword detection for strong mood indicators
        text_lower = text.lower()
        
        # Check for explicit mood keywords first (negative patterns take priority)
        
        # Check for negation patterns first
        if any(phrase in text_lower for phrase in ['trouble staying motivated', 'having trouble', 'not motivated', 'unmotivated', 'lack motivation']):
            return 'procrastinating'
            
        if any(phrase in text_lower for phrase in ['struggling with', 'having difficulty', 'trouble understanding', 'can\'t understand']):

            return 'doubtful'
        
        # Then check positive/negative individual keywords
        if any(word in text_lower for word in ['overwhelmed', 'stressed', 'anxious', 'pressure', 'too much']):

            return 'overwhelmed'
            
        if any(word in text_lower for word in ['excited', 'pumped', 'love', 'passionate', 'thrilled']) or ('motivated' in text_lower and 'trouble' not in text_lower and 'not' not in text_lower):

            return 'motivated'
            
        if any(word in text_lower for word in ['tired', 'exhausted', 'burnt out', 'drained', 'sleepy']):

            return 'exhausted'
            
        if any(word in text_lower for word in ['struggling', 'difficult', 'hard', 'stuck', 'confused', 'lost']):

            return 'doubtful'
            
        if any(word in text_lower for word in ['procrastinating', 'avoiding', 'putting off', 'lazy', 'unmotivated']):

            return 'procrastinating'
        
        # Fallback to score-based analysis
        # High stress or frustration dominates
        if scores.get('stress', 0.5) > 0.6 or scores.get('frustration', 0.5) > 0.6:

            return 'overwhelmed'
        
        # Low confidence suggests doubt
        if scores.get('confidence', 0.5) < 0.4:

            return 'doubtful'
        
        # Low energy and motivation suggests exhaustion
        if scores.get('energy', 0.5) < 0.4 and scores.get('motivation', 0.5) < 0.4:

            return 'exhausted'
        
        # High motivation and energy suggests motivation
        if scores.get('motivation', 0.5) > 0.6 and scores.get('energy', 0.5) > 0.5:

            return 'motivated'
        
        # Low motivation suggests procrastination
        if scores.get('motivation', 0.5) < 0.4:

            return 'procrastinating'
        

        return 'neutral'
    
    def _detect_context(self, text: str) -> Dict:
        """Detect contextual patterns in the text"""
        detected = {}
        for context, patterns in self.context_patterns.items():
            if any(pattern in text for pattern in patterns):
                detected[context] = True
        return detected

class DynamicContentGenerator:
    """Generates fresh motivational content using AI and external APIs"""
    
    def __init__(self):
        self.gemini_model = None
        self.quote_cache = {}
        self.generation_history = []
        
        if GENAI_AVAILABLE and os.getenv("GEMINI_API_KEY"):
            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.gemini_model = genai.GenerativeModel('gemini-2.5-flash')
    
    def generate_personalized_quote_sync(self, mood_profile: MoodProfile, subject: str = None, user_input: str = None) -> MotivationContent:
        """Generate personalized motivational quote using AI (synchronous version)"""
        if not self.gemini_model:
            return self._generate_contextual_fallback(user_input, mood_profile)
        
        if user_input:
            prompt = self._build_contextual_prompt(user_input, mood_profile, subject)
        else:
            prompt = self._build_quote_prompt(mood_profile, subject)
        
        try:
            response = self.gemini_model.generate_content(prompt)
            quote_text = response.text.strip()
            
            # Parse the generated content
            quote, author = self._parse_generated_quote(quote_text)
            
            return MotivationContent(
                content=quote,
                author=author,
                category="ai_generated_personalized",
                mood_targets=[mood_profile.primary_mood],
                effectiveness_score=0.9,  # Higher score for personalized AI content
                source="gemini_ai_personalized",
                generated_at=datetime.now()
            )
            
        except Exception as e:
            print(f"Sync AI generation failed: {e}")
            return self._generate_contextual_fallback(user_input, mood_profile)
    
    async def generate_personalized_quote(self, mood_profile: MoodProfile, 
                                        subject: str = None, user_input: str = None) -> MotivationContent:
        """Generate AI-powered personalized motivational quote"""
        if not self.gemini_model:
            return self._fallback_quote(mood_profile)
        
        if user_input:
            prompt = self._build_contextual_prompt(user_input, mood_profile, subject)
        else:
            prompt = self._build_quote_prompt(mood_profile, subject)
        
        try:
            response = self.gemini_model.generate_content(prompt)
            quote_text = response.text.strip()
            
            # Parse the generated content
            quote, author = self._parse_generated_quote(quote_text)
            
            return MotivationContent(
                content=quote,
                author=author,
                category="ai_generated",
                mood_targets=[mood_profile.primary_mood],
                effectiveness_score=0.8,  # Default for AI-generated
                source="gemini_ai",
                generated_at=datetime.now()
            )
            
        except Exception as e:
            print(f"AI generation failed: {e}")
            return self._fallback_quote(mood_profile)
    
    def _build_quote_prompt(self, mood_profile: MoodProfile, subject: str = None) -> str:
        """Build contextual prompt for AI quote generation"""
        context_info = []
        
        if mood_profile.energy_level < 0.3:
            context_info.append("feeling low energy and tired")
        elif mood_profile.energy_level > 0.7:
            context_info.append("feeling energetic and ready")
        
        if mood_profile.confidence_level < 0.3:
            context_info.append("struggling with self-doubt")
        
        if mood_profile.stress_level > 0.7:
            context_info.append("feeling overwhelmed and stressed")
        
        if mood_profile.frustration_level > 0.6:
            context_info.append("experiencing frustration with learning")
        
        subject_context = f" studying {subject}" if subject else " learning"
        context_str = ", ".join(context_info) if context_info else "neutral mood"
        
        prompt = f"""Generate a short, inspiring motivational quote (under 50 words) for someone who is{subject_context} and currently {context_str}. 
        
        The quote should be:
        - Encouraging and supportive
        - Relevant to their emotional state
        - Educational/learning focused
        - Original and authentic
        
        Format: "Quote text" - Author Name
        
        If you create an original quote, use "Study Mentor AI" as the author."""
        
        return prompt
    
    def _parse_generated_quote(self, text: str) -> Tuple[str, str]:
        """Parse quote and author from generated text"""
        # Look for quote pattern: "quote" - author
        match = re.search(r'"([^"]+)"\s*-\s*(.+)', text)
        if match:
            return match.group(1).strip(), match.group(2).strip()
        
        # Fallback: use entire text as quote
        return text.strip(), "Study Mentor AI"
    
    def _fallback_quote(self, mood_profile: MoodProfile) -> MotivationContent:
        """Provide fallback quote when AI generation fails"""
        fallback_quotes = {
            'overwhelmed': ("Take it one step at a time. Every expert was once a beginner.", "Study Mentor"),
            'doubtful': ("You are more capable than you think. Trust your learning journey.", "Study Mentor"),
            'exhausted': ("Rest is part of learning. Take care of yourself first.", "Study Mentor"),
            'procrastinating': ("The best time to start was yesterday. The second best time is now.", "Study Mentor"),
            'motivated': ("Your enthusiasm is your superpower. Channel it wisely!", "Study Mentor"),
            'neutral': ("Every moment is a fresh opportunity to learn something new.", "Study Mentor")
        }
        
        quote, author = fallback_quotes.get(mood_profile.primary_mood, fallback_quotes['neutral'])
        
        return MotivationContent(
            content=quote,
            author=author,
            category="fallback",
            mood_targets=[mood_profile.primary_mood],
            effectiveness_score=0.6,
            source="fallback_system"
        )
    
    def _build_contextual_prompt(self, user_input: str, mood_profile: MoodProfile, subject: str = None) -> str:
        """Build highly contextual prompt based on user's specific input"""
        
        # Extract key themes from user input
        input_lower = user_input.lower()
        
        # Identify specific challenges
        challenges = []
        if any(word in input_lower for word in ['struggling', 'difficult', 'hard', 'stuck']):
            challenges.append("facing learning difficulties")
        if any(word in input_lower for word in ['overwhelmed', 'too much', 'can\'t handle']):
            challenges.append("feeling overwhelmed")
        if any(word in input_lower for word in ['unmotivated', 'no motivation', 'don\'t want']):
            challenges.append("lacking motivation")
        if any(word in input_lower for word in ['procrastinating', 'putting off', 'avoiding']):
            challenges.append("struggling with procrastination")
        if any(word in input_lower for word in ['anxious', 'worried', 'nervous', 'scared']):
            challenges.append("experiencing anxiety")
        
        # Identify positive aspects
        positives = []
        if any(word in input_lower for word in ['excited', 'eager', 'looking forward']):
            positives.append("showing enthusiasm")
        if any(word in input_lower for word in ['progress', 'improving', 'getting better']):
            positives.append("making progress")
        
        challenge_str = ", ".join(challenges) if challenges else "working on their studies"
        positive_str = f" while {', '.join(positives)}" if positives else ""
        
        subject_context = f" in {subject}" if subject else ""
        
        prompt = f'''Create a personalized, encouraging response for someone who said: "{user_input}"

They are currently {challenge_str}{subject_context}{positive_str}.

Generate a motivational quote that:
- Directly addresses their specific situation
- Acknowledges their feelings without dismissing them
- Provides hope and actionable encouragement
- Is relevant to their learning context
- Feels personal and understanding
- Is under 40 words for impact

Format: "Quote text" - Author Name
Use "AI Learning Coach" as the author for original quotes.'''

        return prompt
    
    def _generate_contextual_fallback(self, user_input: str, mood_profile: MoodProfile) -> MotivationContent:
        """Generate contextual fallback based on user input when AI fails"""
        
        if not user_input:
            return self._fallback_quote(mood_profile)
        
        # Analyze input for contextual response
        input_lower = user_input.lower()
        
        # Context-specific fallbacks
        if any(word in input_lower for word in ['struggling', 'difficult', 'hard']):
            quote = "Every challenge is an opportunity to grow stronger. You've got this!"
            author = "Learning Coach"
        elif any(word in input_lower for word in ['overwhelmed', 'too much']):
            quote = "Break it down into smaller pieces. One step at a time leads to success."
            author = "Study Mentor"
        elif any(word in input_lower for word in ['unmotivated', 'no motivation']):
            quote = "Motivation follows action. Take one small step and momentum will build."
            author = "Progress Guide"
        elif any(word in input_lower for word in ['procrastinating', 'putting off']):
            quote = "The perfect moment is now. Start imperfectly rather than not at all."
            author = "Action Coach"
        elif any(word in input_lower for word in ['anxious', 'worried', 'nervous']):
            quote = "Your anxiety shows you care. Channel that energy into focused learning."
            author = "Mindful Mentor"
        else:
            # Default to mood-based fallback
            return self._fallback_quote(mood_profile)
        
        return MotivationContent(
            content=quote,
            author=author,
            category="contextual_fallback",
            mood_targets=[mood_profile.primary_mood],
            effectiveness_score=0.7,
            source="contextual_system"
        )

class IntelligentMotivationSelector:
    """Intelligent selection algorithm for motivational content"""
    
    def __init__(self):
        self.usage_history = defaultdict(int)
        self.effectiveness_tracking = defaultdict(list)
        self.time_patterns = {}
    
    def select_optimal_content(self, 
                             available_content: List[MotivationContent],
                             mood_profile: MoodProfile,
                             user_id: str = None,
                             time_context: str = None) -> MotivationContent:
        """Select the most appropriate motivational content"""
        
        # Score each piece of content
        scored_content = []
        for content in available_content:
            score = self._calculate_content_score(content, mood_profile, user_id, time_context)
            scored_content.append((score, content))
        
        # Sort by score and add randomization to prevent repetition
        scored_content.sort(key=lambda x: x[0], reverse=True)
        
        # Select from top candidates with some randomization
        top_candidates = [content for score, content in scored_content[:3]]
        selected = random.choice(top_candidates)
        
        # Update usage tracking
        if user_id:
            self.usage_history[f"{user_id}_{selected.content[:20]}"] += 1
        
        return selected
    
    def _calculate_content_score(self, 
                               content: MotivationContent,
                               mood_profile: MoodProfile,
                               user_id: str,
                               time_context: str) -> float:
        """Calculate relevance score for content"""
        score = 0.0
        
        # Mood matching
        if mood_profile.primary_mood in content.mood_targets:
            score += 0.4
        
        # Freshness bonus (less used content gets higher score)
        usage_key = f"{user_id}_{content.content[:20]}" if user_id else content.content[:20]
        usage_penalty = self.usage_history[usage_key] * 0.1
        score -= min(usage_penalty, 0.3)  # Cap penalty at 0.3
        
        # Effectiveness score
        score += content.effectiveness_score * 0.3
        
        # Recency bonus for AI-generated content
        if content.source == "gemini_ai" and content.generated_at:
            age_hours = (datetime.now() - content.generated_at).total_seconds() / 3600
            if age_hours < 24:  # Fresh AI content gets bonus
                score += 0.2
        
        # Time context matching (morning energy, evening reflection, etc.)
        if time_context and self._matches_time_context(content, time_context):
            score += 0.15
        
        return score
    
    def _matches_time_context(self, content: MotivationContent, time_context: str) -> bool:
        """Check if content matches time-based context"""
        time_keywords = {
            'morning': ['start', 'begin', 'fresh', 'new day', 'energy'],
            'afternoon': ['progress', 'continue', 'push through', 'halfway'],
            'evening': ['reflect', 'accomplish', 'complete', 'wrap up'],
            'late_night': ['persistence', 'dedication', 'final push', 'almost there']
        }
        
        keywords = time_keywords.get(time_context, [])
        return any(keyword in content.content.lower() for keyword in keywords)

# Test the enhanced motivation system
def test_enhanced_motivation_system():
    """Test the new motivation personalization system"""
    print("🧠 Testing Enhanced Motivation System")
    print("=" * 50)
    
    analyzer = AdvancedSentimentAnalyzer()
    generator = DynamicContentGenerator()
    selector = IntelligentMotivationSelector()
    
    test_inputs = [
        "I'm feeling really overwhelmed with all this machine learning stuff. There's so much to learn and I don't know if I'm smart enough.",
        "Just finished my first Python project! Feeling pretty confident about this programming journey.",
        "Ugh, I keep procrastinating on my JavaScript studies. I know I should be coding but I just can't get motivated.",
        "I have an exam tomorrow and I'm so stressed. I don't think I've studied enough.",
        "Starting my data science journey today! Super excited to learn all about algorithms and statistics."
    ]
    
    for i, user_input in enumerate(test_inputs, 1):
        print(f"\n{i}. User Input: \"{user_input}\"")
        
        # Analyze mood
        mood_profile = analyzer.analyze_mood(user_input)
        print(f"   Detected Mood: {mood_profile.primary_mood}")
        print(f"   Energy: {mood_profile.energy_level:.2f}, Confidence: {mood_profile.confidence_level:.2f}")
        print(f"   Stress: {mood_profile.stress_level:.2f}, Motivation: {mood_profile.motivation_level:.2f}")
        
        # Generate fallback content (since we can't test AI generation easily)
        content = generator._fallback_quote(mood_profile)
        print(f"   Recommended Quote: \"{content.content}\" - {content.author}")

if __name__ == "__main__":
    test_enhanced_motivation_system()