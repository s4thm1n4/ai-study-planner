"""
AI Ethics and Data Protection Framework
Implements fairness, transparency, and privacy protection for the AI Study Planner
"""

import os
import json
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import uuid
from collections import defaultdict

# Configure logging for audit trails
logging.basicConfig(level=logging.INFO)
ethics_logger = logging.getLogger('ai_ethics')

class BiasType(Enum):
    """Types of bias to monitor"""
    DEMOGRAPHIC = "demographic"
    CULTURAL = "cultural"
    EDUCATIONAL = "educational"
    LINGUISTIC = "linguistic"
    SOCIOECONOMIC = "socioeconomic"

class DataCategory(Enum):
    """Categories of user data for privacy management"""
    PERSONAL_INFO = "personal_info"
    LEARNING_DATA = "learning_data"
    BEHAVIORAL_DATA = "behavioral_data"
    GENERATED_CONTENT = "generated_content"
    SYSTEM_LOGS = "system_logs"

@dataclass
class AIDecision:
    """Represents an AI decision with explainability metadata"""
    decision_id: str
    agent_type: str
    input_data: Dict
    output_data: Dict
    confidence_score: float
    reasoning: str
    bias_check: Dict
    timestamp: datetime
    user_id: Optional[str] = None
    
class BiasDetector:
    """Monitors and detects various types of bias in AI outputs"""
    
    def __init__(self):
        self.bias_patterns = self._load_bias_patterns()
        self.detection_history = []
        
    def _load_bias_patterns(self) -> Dict:
        """Load bias detection patterns"""
        return {
            'demographic': {
                'age_bias': ['too old', 'too young', 'at your age', 'for someone your age'],
                'gender_bias': ['boys are better', 'girls cant', 'masculine', 'feminine'],
                'cultural_bias': ['western education', 'american way', 'english-speaking']
            },
            'educational': {
                'institution_bias': ['ivy league', 'prestigious university', 'top school'],
                'background_bias': ['advanced degree', 'college educated', 'academic background'],
                'resource_bias': ['expensive course', 'premium content', 'paid subscription']
            },
            'linguistic': {
                'language_bias': ['native speaker', 'perfect english', 'accent', 'grammar mistakes'],
                'complexity_bias': ['simple terms', 'basic level', 'elementary']
            }
        }
    
    def check_bias(self, content: str, context: Dict = None) -> Dict[str, Any]:
        """Check content for various types of bias"""
        bias_report = {
            'has_bias': False,
            'detected_biases': [],
            'severity': 'none',
            'recommendations': []
        }
        
        content_lower = content.lower()
        
        for bias_category, patterns in self.bias_patterns.items():
            for bias_type, keywords in patterns.items():
                detected_keywords = [kw for kw in keywords if kw in content_lower]
                
                if detected_keywords:
                    bias_report['has_bias'] = True
                    bias_report['detected_biases'].append({
                        'type': bias_type,
                        'category': bias_category,
                        'keywords': detected_keywords,
                        'severity': self._assess_severity(detected_keywords)
                    })
        
        # Generate recommendations
        if bias_report['has_bias']:
            bias_report['recommendations'] = self._generate_bias_mitigation_recommendations(
                bias_report['detected_biases']
            )
            bias_report['severity'] = self._calculate_overall_severity(bias_report['detected_biases'])
        
        # Log bias detection
        self._log_bias_detection(content, bias_report, context)
        
        return bias_report
    
    def _assess_severity(self, keywords: List[str]) -> str:
        """Assess severity of detected bias"""
        if len(keywords) >= 3:
            return 'high'
        elif len(keywords) >= 2:
            return 'medium'
        else:
            return 'low'
    
    def _calculate_overall_severity(self, biases: List[Dict]) -> str:
        """Calculate overall bias severity"""
        severities = [bias['severity'] for bias in biases]
        if 'high' in severities:
            return 'high'
        elif 'medium' in severities:
            return 'medium'
        else:
            return 'low'
    
    def _generate_bias_mitigation_recommendations(self, biases: List[Dict]) -> List[str]:
        """Generate recommendations to mitigate detected bias"""
        recommendations = []
        
        bias_types = [bias['type'] for bias in biases]
        
        if 'age_bias' in bias_types:
            recommendations.append("Remove age-related assumptions and focus on learning capabilities")
        
        if 'gender_bias' in bias_types:
            recommendations.append("Use gender-neutral language and avoid stereotypes")
        
        if 'cultural_bias' in bias_types:
            recommendations.append("Include diverse cultural perspectives and avoid western-centric assumptions")
        
        if 'resource_bias' in bias_types:
            recommendations.append("Suggest both free and paid resources to ensure accessibility")
        
        return recommendations
    
    def _log_bias_detection(self, content: str, bias_report: Dict, context: Dict):
        """Log bias detection for audit purposes"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'content_hash': hashlib.sha256(content.encode()).hexdigest()[:16],
            'bias_detected': bias_report['has_bias'],
            'severity': bias_report['severity'],
            'context': context or {}
        }
        
        ethics_logger.info(f"Bias check: {log_entry}")
        self.detection_history.append(log_entry)

class TransparencyManager:
    """Manages AI decision transparency and explainability"""
    
    def __init__(self):
        self.decision_history = []
        
    def create_explanation(self, decision: AIDecision) -> Dict[str, Any]:
        """Create human-readable explanation for AI decision"""
        explanation = {
            'decision_summary': self._summarize_decision(decision),
            'confidence_level': self._interpret_confidence(decision.confidence_score),
            'key_factors': self._extract_key_factors(decision),
            'alternative_options': self._suggest_alternatives(decision),
            'bias_check_result': decision.bias_check,
            'how_to_improve': self._suggest_improvements(decision)
        }
        
        return explanation
    
    def _summarize_decision(self, decision: AIDecision) -> str:
        """Create human-readable summary of the AI decision"""
        summaries = {
            'ScheduleCreatorAgent': f"Created a study schedule based on your subject '{decision.input_data.get('subject', 'unknown')}' and {decision.input_data.get('total_days', 'N/A')} day timeline.",
            'ResourceFinderAgent': f"Found {len(decision.output_data.get('resources', []))} learning resources matching your topic '{decision.input_data.get('topic', 'unknown')}'.",
            'MotivationCoachAgent': f"Selected motivational content based on your detected mood: '{decision.input_data.get('mood', 'neutral')}'."
        }
        
        return summaries.get(decision.agent_type, "AI made a decision based on your input.")
    
    def _interpret_confidence(self, score: float) -> str:
        """Convert confidence score to human-readable level"""
        if score >= 0.9:
            return "Very High - The AI is very confident in this recommendation"
        elif score >= 0.7:
            return "High - The AI is confident in this recommendation"
        elif score >= 0.5:
            return "Medium - The AI has moderate confidence in this recommendation"
        else:
            return "Low - The AI has limited confidence; consider this as one option among many"
    
    def _extract_key_factors(self, decision: AIDecision) -> List[str]:
        """Extract key factors that influenced the decision"""
        factors = []
        
        # Extract factors based on agent type
        if decision.agent_type == 'ScheduleCreatorAgent':
            factors.extend([
                f"Subject: {decision.input_data.get('subject')}",
                f"Difficulty level: {decision.input_data.get('difficulty', 'not specified')}",
                f"Available time: {decision.input_data.get('daily_hours', 'flexible')} hours per day",
                f"Learning style: {decision.input_data.get('learning_style', 'mixed')}"
            ])
        
        elif decision.agent_type == 'ResourceFinderAgent':
            factors.extend([
                f"Search topic: {decision.input_data.get('topic')}",
                f"Preferred difficulty: {decision.input_data.get('difficulty', 'any')}",
                f"Resource type preferences: {decision.input_data.get('resource_type', 'all types')}"
            ])
        
        elif decision.agent_type == 'MotivationCoachAgent':
            factors.extend([
                f"Detected mood: {decision.input_data.get('mood')}",
                f"Progress level: {decision.input_data.get('progress', 'unknown')}%",
                f"Time of day: {decision.input_data.get('time_context', 'not specified')}"
            ])
        
        return factors
    
    def _suggest_alternatives(self, decision: AIDecision) -> List[str]:
        """Suggest alternative approaches or options"""
        alternatives = []
        
        if decision.confidence_score < 0.7:
            alternatives.append("Consider providing more specific information about your preferences")
            alternatives.append("Try rephrasing your request with different keywords")
        
        if decision.agent_type == 'ScheduleCreatorAgent':
            alternatives.extend([
                "Adjust the daily time commitment if the schedule seems too intensive",
                "Consider changing the difficulty level if content seems inappropriate",
                "Modify learning style preferences for different topic suggestions"
            ])
        
        elif decision.agent_type == 'ResourceFinderAgent':
            alternatives.extend([
                "Search for the same topic with different difficulty levels",
                "Explore related topics for broader learning context",
                "Filter by specific resource types (videos, articles, courses)"
            ])
        
        return alternatives
    
    def _suggest_improvements(self, decision: AIDecision) -> List[str]:
        """Suggest how to improve future recommendations"""
        suggestions = []
        
        suggestions.extend([
            "Provide feedback on the usefulness of these recommendations",
            "Be more specific about your current knowledge level",
            "Share your learning goals and preferences",
            "Let us know if the content difficulty matches your needs"
        ])
        
        return suggestions

class PrivacyManager:
    """Manages user data privacy and protection"""
    
    def __init__(self):
        self.data_inventory = defaultdict(dict)
        self.encryption_key = os.getenv('DATA_ENCRYPTION_KEY', 'default-key-change-in-production')
        
    def classify_data(self, data: Dict, user_id: str) -> Dict[DataCategory, List[str]]:
        """Classify user data into privacy categories"""
        classification = defaultdict(list)
        
        for key, value in data.items():
            if key in ['username', 'email', 'first_name', 'last_name']:
                classification[DataCategory.PERSONAL_INFO].append(key)
            elif key in ['subject', 'difficulty', 'learning_style', 'study_plan']:
                classification[DataCategory.LEARNING_DATA].append(key)
            elif key in ['login_time', 'session_duration', 'clicks', 'interactions']:
                classification[DataCategory.BEHAVIORAL_DATA].append(key)
            elif key in ['ai_generated_content', 'recommendations', 'motivational_quotes']:
                classification[DataCategory.GENERATED_CONTENT].append(key)
            else:
                classification[DataCategory.SYSTEM_LOGS].append(key)
        
        # Update data inventory
        self.data_inventory[user_id].update({
            'last_updated': datetime.now().isoformat(),
            'data_categories': {cat.value: fields for cat, fields in classification.items()}
        })
        
        return classification
    
    def anonymize_data(self, data: Dict, user_id: str) -> Dict:
        """Anonymize sensitive user data for analytics"""
        anonymized = {}
        user_hash = hashlib.sha256(user_id.encode()).hexdigest()[:16]
        
        for key, value in data.items():
            if key in ['username', 'email', 'first_name', 'last_name']:
                anonymized[key] = f"anonymized_{user_hash}"
            elif key == 'user_id':
                anonymized[key] = user_hash
            else:
                anonymized[key] = value
        
        return anonymized
    
    def generate_privacy_report(self, user_id: str) -> Dict:
        """Generate privacy report for user"""
        user_data = self.data_inventory.get(user_id, {})
        
        return {
            'user_id': user_id,
            'data_collected': user_data.get('data_categories', {}),
            'last_updated': user_data.get('last_updated'),
            'retention_period': '2 years from last activity',
            'sharing_policy': 'Data is not shared with third parties',
            'user_rights': {
                'access': 'Request copy of your data',
                'rectification': 'Correct inaccurate data',
                'erasure': 'Delete your account and data',
                'portability': 'Export your data',
                'objection': 'Object to data processing'
            },
            'contact': 'privacy@studyplanner.ai'
        }
    
    def process_deletion_request(self, user_id: str) -> Dict:
        """Process user's right to be forgotten request"""
        deletion_report = {
            'user_id': user_id,
            'request_timestamp': datetime.now().isoformat(),
            'data_deleted': [],
            'data_retained': [],
            'retention_reason': []
        }
        
        # In a real system, this would delete data from all systems
        if user_id in self.data_inventory:
            deletion_report['data_deleted'].append('User profile and learning data')
            del self.data_inventory[user_id]
        
        # Some data might be retained for legal/security reasons
        deletion_report['data_retained'].append('Anonymized analytics data')
        deletion_report['retention_reason'].append('Legal compliance and system security')
        
        ethics_logger.info(f"Data deletion processed for user: {user_id}")
        
        return deletion_report

class OutputValidator:
    """Validates and ensures quality of AI-generated outputs"""
    
    def __init__(self):
        self.validation_rules = self._load_validation_rules()
        self.quality_metrics = defaultdict(list)
        
    def _load_validation_rules(self) -> Dict:
        """Load content validation rules"""
        return {
            'safety': {
                'prohibited_content': ['harmful', 'offensive', 'inappropriate', 'dangerous'],
                'required_tone': ['supportive', 'educational', 'encouraging']
            },
            'educational_quality': {
                'min_length': 10,
                'max_length': 500,
                'required_elements': ['actionable', 'relevant', 'accurate']
            },
            'accessibility': {
                'reading_level': 'grade_8_or_below',
                'avoid_jargon': True,
                'include_examples': True
            }
        }
    
    def validate_output(self, content: str, output_type: str, context: Dict = None) -> Dict:
        """Comprehensive validation of AI output"""
        validation_result = {
            'is_valid': True,
            'quality_score': 0.0,
            'issues': [],
            'recommendations': [],
            'safety_check': 'passed'
        }
        
        # Safety validation
        safety_result = self._check_safety(content)
        validation_result['safety_check'] = safety_result['status']
        if not safety_result['is_safe']:
            validation_result['is_valid'] = False
            validation_result['issues'].extend(safety_result['issues'])
        
        # Educational quality validation
        quality_result = self._check_educational_quality(content, output_type)
        validation_result['quality_score'] = quality_result['score']
        validation_result['issues'].extend(quality_result['issues'])
        validation_result['recommendations'].extend(quality_result['recommendations'])
        
        # Accessibility validation
        accessibility_result = self._check_accessibility(content)
        validation_result['issues'].extend(accessibility_result['issues'])
        validation_result['recommendations'].extend(accessibility_result['recommendations'])
        
        # Final validation decision
        if validation_result['quality_score'] < 0.6:
            validation_result['is_valid'] = False
        
        # Log validation result
        self._log_validation(content, validation_result, context)
        
        return validation_result
    
    def _check_safety(self, content: str) -> Dict:
        """Check content safety"""
        prohibited = self.validation_rules['safety']['prohibited_content']
        content_lower = content.lower()
        
        found_issues = [word for word in prohibited if word in content_lower]
        
        return {
            'is_safe': len(found_issues) == 0,
            'status': 'passed' if len(found_issues) == 0 else 'failed',
            'issues': [f"Contains prohibited content: {word}" for word in found_issues]
        }
    
    def _check_educational_quality(self, content: str, output_type: str) -> Dict:
        """Check educational quality of content"""
        rules = self.validation_rules['educational_quality']
        score = 1.0
        issues = []
        recommendations = []
        
        # Length check
        if len(content) < rules['min_length']:
            score -= 0.2
            issues.append(f"Content too short (minimum {rules['min_length']} characters)")
            recommendations.append("Provide more detailed and comprehensive information")
        
        if len(content) > rules['max_length']:
            score -= 0.1
            issues.append(f"Content too long (maximum {rules['max_length']} characters)")
            recommendations.append("Make content more concise and focused")
        
        # Content relevance (basic check)
        if output_type == 'study_plan' and 'study' not in content.lower():
            score -= 0.3
            issues.append("Content doesn't seem relevant to study planning")
        
        return {
            'score': max(0.0, score),
            'issues': issues,
            'recommendations': recommendations
        }
    
    def _check_accessibility(self, content: str) -> Dict:
        """Check content accessibility"""
        issues = []
        recommendations = []
        
        # Simple readability check (word length approximation)
        words = content.split()
        avg_word_length = sum(len(word) for word in words) / len(words) if words else 0
        
        if avg_word_length > 6:
            issues.append("Content may be too complex (long average word length)")
            recommendations.append("Use simpler vocabulary and shorter sentences")
        
        # Check for explanatory content
        if len(content) > 100 and '?' not in content and 'example' not in content.lower():
            recommendations.append("Consider adding examples or explanatory questions")
        
        return {
            'issues': issues,
            'recommendations': recommendations
        }
    
    def _log_validation(self, content: str, result: Dict, context: Dict):
        """Log validation results for monitoring"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'content_hash': hashlib.sha256(content.encode()).hexdigest()[:16],
            'is_valid': result['is_valid'],
            'quality_score': result['quality_score'],
            'safety_status': result['safety_check'],
            'context': context or {}
        }
        
        ethics_logger.info(f"Output validation: {log_entry}")

# Integrated Ethics Framework
class AIEthicsFramework:
    """Main framework integrating all ethical AI components"""
    
    def __init__(self):
        self.bias_detector = BiasDetector()
        self.transparency_manager = TransparencyManager()
        self.privacy_manager = PrivacyManager()
        self.output_validator = OutputValidator()
        
    def validate_ai_decision(self, 
                           agent_type: str,
                           input_data: Dict,
                           output_data: Dict,
                           confidence_score: float,
                           reasoning: str,
                           user_id: str = None) -> Tuple[bool, Dict]:
        """Comprehensive validation of AI decision"""
        
        # Create decision record
        decision = AIDecision(
            decision_id=str(uuid.uuid4()),
            agent_type=agent_type,
            input_data=input_data,
            output_data=output_data,
            confidence_score=confidence_score,
            reasoning=reasoning,
            bias_check={},
            timestamp=datetime.now(),
            user_id=user_id
        )
        
        # Run bias detection
        output_text = self._extract_text_from_output(output_data)
        bias_check = self.bias_detector.check_bias(output_text, {'agent': agent_type})
        decision.bias_check = bias_check
        
        # Validate output quality
        validation_result = self.output_validator.validate_output(
            output_text, 
            agent_type.lower().replace('agent', ''),
            {'user_id': user_id}
        )
        
        # Generate transparency information
        transparency_info = self.transparency_manager.create_explanation(decision)
        
        # Privacy classification
        if user_id:
            self.privacy_manager.classify_data(input_data, user_id)
        
        # Overall validation decision
        is_valid = (
            not bias_check['has_bias'] or bias_check['severity'] != 'high'
        ) and validation_result['is_valid']
        
        ethics_report = {
            'decision_id': decision.decision_id,
            'is_ethical': is_valid,
            'bias_check': bias_check,
            'validation_result': validation_result,
            'transparency_info': transparency_info,
            'timestamp': decision.timestamp.isoformat()
        }
        
        return is_valid, ethics_report
    
    def _extract_text_from_output(self, output_data: Dict) -> str:
        """Extract text content from output for analysis"""
        text_parts = []
        
        def extract_recursive(obj):
            if isinstance(obj, str):
                text_parts.append(obj)
            elif isinstance(obj, dict):
                for value in obj.values():
                    extract_recursive(value)
            elif isinstance(obj, list):
                for item in obj:
                    extract_recursive(item)
        
        extract_recursive(output_data)
        return " ".join(text_parts)

# Test the ethics framework
def test_ethics_framework():
    """Test the AI ethics framework"""
    print("🛡️  Testing AI Ethics Framework")
    print("=" * 50)
    
    framework = AIEthicsFramework()
    
    # Test case 1: Biased content
    test_decision_1 = {
        'agent_type': 'ScheduleCreatorAgent',
        'input_data': {'subject': 'programming', 'user_age': 45},
        'output_data': {'topics': ['Basic programming for beginners - perfect for someone your age who might struggle with complex concepts']},
        'confidence_score': 0.8,
        'reasoning': 'Generated age-appropriate content',
        'user_id': 'test_user_1'
    }
    
    is_valid_1, report_1 = framework.validate_ai_decision(**test_decision_1)
    
    print(f"Test 1 - Potentially biased content:")
    print(f"  Valid: {is_valid_1}")
    print(f"  Bias detected: {report_1['bias_check']['has_bias']}")
    if report_1['bias_check']['has_bias']:
        print(f"  Bias types: {[b['type'] for b in report_1['bias_check']['detected_biases']]}")
        print(f"  Recommendations: {report_1['bias_check']['recommendations']}")
    
    # Test case 2: Clean content
    test_decision_2 = {
        'agent_type': 'MotivationCoachAgent',
        'input_data': {'mood': 'overwhelmed', 'subject': 'mathematics'},
        'output_data': {'quote': 'Every expert was once a beginner. Take it step by step.', 'tip': 'Break complex problems into smaller, manageable parts.'},
        'confidence_score': 0.9,
        'reasoning': 'Selected appropriate motivational content for overwhelmed learner',
        'user_id': 'test_user_2'
    }
    
    is_valid_2, report_2 = framework.validate_ai_decision(**test_decision_2)
    
    print(f"\nTest 2 - Clean content:")
    print(f"  Valid: {is_valid_2}")
    print(f"  Quality score: {report_2['validation_result']['quality_score']:.2f}")
    print(f"  Transparency summary: {report_2['transparency_info']['decision_summary']}")

if __name__ == "__main__":
    test_ethics_framework()