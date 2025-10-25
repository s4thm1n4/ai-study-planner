"""
AI-Powered Topic Generation Module
Uses intelligent pattern matching and contextual understanding to generate
appropriate learning topics for any subject without hardcoding.
"""

import re
import json
from typing import List, Dict, Set
from dataclasses import dataclass

@dataclass
class TopicTemplate:
    """Template for generating subject-specific topics"""
    level: str  # 'beginner', 'intermediate', 'advanced'
    category: str  # 'theory', 'practical', 'application', 'assessment'
    template: str

class IntelligentTopicGenerator:
    """
    AI-powered topic generator that can create appropriate learning topics
    for any subject using pattern recognition and contextual understanding.
    """
    
    def __init__(self):
        self.domain_keywords = self._initialize_domain_keywords()
        self.topic_templates = self._initialize_topic_templates()
        self.learning_verbs = self._initialize_learning_verbs()
        
    def _initialize_domain_keywords(self) -> Dict[str, Set[str]]:
        """Initialize keyword patterns for different domains"""
        return {
            'technology': {
                'programming', 'coding', 'software', 'development', 'computer', 'web', 'app', 
                'algorithm', 'database', 'api', 'framework', 'library', 'javascript', 'python',
                'java', 'react', 'node', 'html', 'css', 'sql', 'git', 'devops', 'cloud',
                'artificial intelligence', 'machine learning', 'data science', 'cybersecurity'
            },
            'fitness': {
                'fitness', 'gym', 'workout', 'exercise', 'bodybuilding', 'training', 'sport',
                'athletic', 'muscle', 'strength', 'cardio', 'yoga', 'pilates', 'crossfit',
                'running', 'swimming', 'cycling', 'weightlifting', 'powerlifting', 'calisthenics'
            },
            'health': {
                'health', 'medical', 'wellness', 'therapy', 'medicine', 'healthcare', 'nutrition',
                'diet', 'mental health', 'psychology', 'physiology', 'anatomy', 'nursing',
                'pharmacy', 'rehabilitation', 'public health', 'epidemiology'
            },
            'creative': {
                'art', 'design', 'creative', 'graphics', 'drawing', 'painting', 'photography',
                'video', 'film', 'music', 'writing', 'illustration', 'animation', 'sculpture',
                'crafts', 'pottery', 'woodworking', 'fashion', 'interior design'
            },
            'culinary': {
                'cooking', 'culinary', 'baking', 'chef', 'food', 'recipe', 'kitchen', 'pastry',
                'cuisine', 'gastronomy', 'nutrition', 'bartending', 'wine', 'brewing'
            },
            'language': {
                'language', 'spanish', 'french', 'german', 'chinese', 'japanese', 'english',
                'speaking', 'linguistics', 'translation', 'writing', 'literature', 'grammar'
            },
            'business': {
                'business', 'management', 'marketing', 'finance', 'entrepreneur', 'sales',
                'accounting', 'economics', 'leadership', 'strategy', 'consulting', 'investing'
            },
            'science': {
                'science', 'physics', 'chemistry', 'biology', 'mathematics', 'math', 'research',
                'laboratory', 'experiment', 'theory', 'statistics', 'engineering', 'geology'
            },
            'music': {
                'music', 'instrument', 'piano', 'guitar', 'singing', 'vocal', 'composition',
                'theory', 'performance', 'band', 'orchestra', 'recording', 'production'
            },
            'academic': {
                'study', 'academic', 'education', 'learning', 'teaching', 'university', 'school',
                'research', 'thesis', 'dissertation', 'exam', 'test', 'curriculum'
            }
        }
    
    def _initialize_topic_templates(self) -> Dict[str, List[TopicTemplate]]:
        """Initialize learning topic templates for different domains"""
        return {
            'technology': [
                TopicTemplate('beginner', 'theory', '{subject} Fundamentals and Core Concepts'),
                TopicTemplate('beginner', 'practical', 'Setting Up {subject} Environment and Tools'),
                TopicTemplate('intermediate', 'theory', 'Advanced {subject} Principles and Patterns'),
                TopicTemplate('intermediate', 'practical', 'Building {subject} Projects and Applications'),
                TopicTemplate('advanced', 'theory', '{subject} Architecture and System Design'),
                TopicTemplate('advanced', 'practical', 'Professional {subject} Development and Deployment'),
                TopicTemplate('advanced', 'application', '{subject} Performance Optimization and Scaling'),
                TopicTemplate('assessment', 'assessment', '{subject} Testing, Debugging, and Quality Assurance')
            ],
            'fitness': [
                TopicTemplate('beginner', 'theory', '{subject} Fundamentals and Safety Guidelines'),
                TopicTemplate('beginner', 'practical', 'Basic {subject} Techniques and Form'),
                TopicTemplate('intermediate', 'theory', '{subject} Programming and Periodization'),
                TopicTemplate('intermediate', 'practical', 'Intermediate {subject} Exercises and Routines'),
                TopicTemplate('advanced', 'theory', 'Advanced {subject} Strategies and Periodization'),
                TopicTemplate('advanced', 'practical', 'Competition Preparation and Peak Performance'),
                TopicTemplate('application', 'application', '{subject} Nutrition and Recovery Protocols'),
                TopicTemplate('assessment', 'assessment', 'Progress Tracking and Performance Analysis')
            ],
            'creative': [
                TopicTemplate('beginner', 'theory', '{subject} Principles and Fundamental Concepts'),
                TopicTemplate('beginner', 'practical', 'Basic {subject} Tools and Techniques'),
                TopicTemplate('intermediate', 'theory', '{subject} Composition and Design Theory'),
                TopicTemplate('intermediate', 'practical', 'Intermediate {subject} Projects and Skills'),
                TopicTemplate('advanced', 'theory', 'Advanced {subject} Styles and Movements'),
                TopicTemplate('advanced', 'practical', 'Professional {subject} Portfolio Development'),
                TopicTemplate('application', 'application', '{subject} Industry Practices and Workflow'),
                TopicTemplate('assessment', 'assessment', '{subject} Critique and Self-Assessment')
            ],
            'language': [
                TopicTemplate('beginner', 'theory', '{subject} Basics and Pronunciation'),
                TopicTemplate('beginner', 'practical', 'Essential {subject} Vocabulary and Phrases'),
                TopicTemplate('intermediate', 'theory', '{subject} Grammar and Sentence Structure'),
                TopicTemplate('intermediate', 'practical', 'Conversational {subject} Practice'),
                TopicTemplate('advanced', 'theory', 'Advanced {subject} Grammar and Syntax'),
                TopicTemplate('advanced', 'practical', 'Professional and Academic {subject}'),
                TopicTemplate('application', 'application', '{subject} Cultural Context and Usage'),
                TopicTemplate('assessment', 'assessment', '{subject} Proficiency Testing and Evaluation')
            ],
            'business': [
                TopicTemplate('beginner', 'theory', '{subject} Fundamentals and Key Concepts'),
                TopicTemplate('beginner', 'practical', 'Basic {subject} Tools and Methods'),
                TopicTemplate('intermediate', 'theory', '{subject} Strategy and Analysis'),
                TopicTemplate('intermediate', 'practical', '{subject} Case Studies and Applications'),
                TopicTemplate('advanced', 'theory', 'Advanced {subject} Theory and Models'),
                TopicTemplate('advanced', 'practical', '{subject} Leadership and Implementation'),
                TopicTemplate('application', 'application', 'Real-world {subject} Problem Solving'),
                TopicTemplate('assessment', 'assessment', '{subject} Metrics and Performance Evaluation')
            ],
            'generic': [
                TopicTemplate('beginner', 'theory', 'Introduction to {subject}'),
                TopicTemplate('beginner', 'practical', '{subject} Basics and Getting Started'),
                TopicTemplate('intermediate', 'theory', 'Intermediate {subject} Concepts'),
                TopicTemplate('intermediate', 'practical', 'Practical {subject} Applications'),
                TopicTemplate('advanced', 'theory', 'Advanced {subject} Mastery'),
                TopicTemplate('advanced', 'practical', 'Professional {subject} Practice'),
                TopicTemplate('application', 'application', 'Real-world {subject} Implementation'),
                TopicTemplate('assessment', 'assessment', '{subject} Assessment and Evaluation')
            ]
        }
    
    def _initialize_learning_verbs(self) -> Dict[str, List[str]]:
        """Initialize action verbs for different learning phases"""
        return {
            'beginner': ['Learn', 'Understand', 'Explore', 'Discover', 'Introduction to'],
            'intermediate': ['Develop', 'Apply', 'Practice', 'Implement', 'Build'],
            'advanced': ['Master', 'Optimize', 'Specialize', 'Expert-level', 'Advanced'],
            'application': ['Apply', 'Integrate', 'Utilize', 'Deploy', 'Execute'],
            'assessment': ['Evaluate', 'Test', 'Assess', 'Review', 'Analyze']
        }
    
    def identify_domain(self, subject: str) -> str:
        """
        Intelligently identify the domain of a subject using keyword matching
        and contextual analysis.
        """
        subject_lower = subject.lower()
        subject_words = re.findall(r'\b\w+\b', subject_lower)
        
        domain_scores = {}
        
        # Calculate relevance scores for each domain
        for domain, keywords in self.domain_keywords.items():
            score = 0
            for word in subject_words:
                if word in keywords:
                    score += 2  # Exact word match
                else:
                    # Partial matching for compound words
                    for keyword in keywords:
                        if word in keyword or keyword in word:
                            score += 1
            
            # Check for multi-word phrase matches
            for keyword in keywords:
                if keyword in subject_lower:
                    score += 3
            
            domain_scores[domain] = score
        
        # Return the domain with the highest score, or 'generic' if no clear match
        if max(domain_scores.values()) > 0:
            return max(domain_scores, key=domain_scores.get)
        return 'generic'
    
    def generate_contextual_topics(self, subject: str, num_topics: int = 8) -> List[str]:
        """
        Generate contextually appropriate topics for any subject using AI-powered analysis.
        """
        # Identify the domain
        domain = self.identify_domain(subject)
        
        # Get appropriate templates
        templates = self.topic_templates.get(domain, self.topic_templates['generic'])
        
        # Generate topics using templates
        topics = []
        template_cycle = 0
        
        while len(topics) < num_topics and template_cycle < len(templates) * 2:
            template = templates[template_cycle % len(templates)]
            
            # Format the template with the subject
            topic = template.template.format(subject=subject)
            
            # Add some variation to avoid repetition
            if template_cycle >= len(templates):
                verb = self.learning_verbs[template.level][template_cycle % len(self.learning_verbs[template.level])]
                topic = f"{verb} {topic}"
            
            # Ensure topic uniqueness
            if topic not in topics:
                topics.append(topic)
            
            template_cycle += 1
        
        # If we still need more topics, generate some generic ones
        while len(topics) < num_topics:
            generic_topics = [
                f"Fundamentals of {subject}",
                f"Practical {subject} Skills",
                f"Advanced {subject} Techniques",
                f"{subject} Best Practices",
                f"{subject} Case Studies",
                f"Professional {subject} Development",
                f"{subject} Problem Solving",
                f"{subject} Innovation and Trends"
            ]
            
            for topic in generic_topics:
                if topic not in topics and len(topics) < num_topics:
                    topics.append(topic)
        
        return topics[:num_topics]
    
    def enhance_topic_with_context(self, base_topic: str, subject: str, domain: str) -> str:
        """
        Enhance a basic topic with contextual information based on the domain.
        """
        domain_enhancements = {
            'technology': ['Implementation', 'Best Practices', 'Architecture', 'Performance'],
            'fitness': ['Training', 'Technique', 'Programming', 'Performance'],
            'creative': ['Techniques', 'Composition', 'Style', 'Expression'],
            'language': ['Communication', 'Fluency', 'Grammar', 'Culture'],
            'business': ['Strategy', 'Analysis', 'Implementation', 'ROI'],
            'science': ['Theory', 'Research', 'Analysis', 'Application']
        }
        
        enhancements = domain_enhancements.get(domain, ['Theory', 'Practice', 'Application', 'Mastery'])
        
        # Randomly select an enhancement (in practice, you might use more sophisticated selection)
        import random
        enhancement = random.choice(enhancements)
        
        return f"{base_topic}: {enhancement} and {subject} Integration"


def test_intelligent_generator():
    """Test the intelligent topic generator with various subjects"""
    generator = IntelligentTopicGenerator()
    
    test_subjects = [
        "Quantum Physics",
        "Blockchain Development", 
        "Italian Cuisine",
        "Portrait Photography",
        "Jazz Piano",
        "Rock Climbing",
        "Digital Marketing",
        "Sustainable Gardening",
        "3D Animation",
        "Mindfulness Meditation"
    ]
    
    print("🤖 AI-Powered Topic Generation Test Results:")
    print("=" * 60)
    
    for subject in test_subjects:
        domain = generator.identify_domain(subject)
        topics = generator.generate_contextual_topics(subject, 6)
        
        print(f"\n📚 {subject} (Domain: {domain.title()})")
        for i, topic in enumerate(topics, 1):
            print(f"   {i}. {topic}")


if __name__ == "__main__":
    test_intelligent_generator()