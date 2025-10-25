"""
NLP Techniques Module for AI Study Planner
Demonstrates core NLP preprocessing techniques as required for coursework.

Techniques Implemented:
1. Lowercasing
2. Removing Punctuation  
3. Tokenization
4. Stopword Removal
5. Stemming
6. Lemmatization
"""

import re
import string
from typing import List, Dict, Tuple
from dataclasses import dataclass

# Simple implementations as per course requirements
class BasicNLPProcessor:
    """
    Basic NLP preprocessing using simple Python implementations
    as taught in the course (text.lower(), etc.)
    """
    
    def __init__(self):
        # Common English stopwords (basic set as per course)
        self.stopwords = {
            'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
            'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
            'to', 'was', 'will', 'with', 'i', 'am', 'my', 'me', 'we', 'our',
            'you', 'your', 'they', 'them', 'their', 'this', 'these', 'those'
        }
        
        # Simple stemming rules (basic suffix removal)
        self.stemming_rules = [
            ('ing', ''), ('ed', ''), ('er', ''), ('est', ''),
            ('ly', ''), ('ion', ''), ('tion', ''), ('ness', ''),
            ('ment', ''), ('able', ''), ('ible', ''), ('al', ''),
            ('ful', ''), ('less', ''), ('ous', ''), ('ive', ''),
            ('ant', ''), ('ent', ''), ('ism', ''), ('ist', ''),
            ('ity', ''), ('ize', ''), ('ise', ''), ('ate', '')
        ]
        
        # Basic lemmatization dictionary (sample as per course)
        self.lemma_dict = {
            'running': 'run', 'ran': 'run', 'runs': 'run',
            'programming': 'program', 'coded': 'code', 'coding': 'code',
            'learning': 'learn', 'learned': 'learn', 'learnt': 'learn',
            'studying': 'study', 'studied': 'study', 'studies': 'study',
            'feeling': 'feel', 'felt': 'feel', 'feels': 'feel',
            'thinking': 'think', 'thought': 'think', 'thinks': 'think',
            'working': 'work', 'worked': 'work', 'works': 'work',
            'trying': 'try', 'tried': 'try', 'tries': 'try',
            'struggling': 'struggle', 'struggled': 'struggle',
            'overwhelmed': 'overwhelm', 'overwhelming': 'overwhelm',
            'motivated': 'motivate', 'motivating': 'motivate',
            'excited': 'excite', 'exciting': 'excite',
            'frustrated': 'frustrate', 'frustrating': 'frustrate'
        }
    
    def apply_lowercasing(self, text: str) -> str:
        """
        NLP Technique 1: Lowercasing
        Converting text to all lowercase letters using text.lower()
        """
        result = text.lower()
        print(f"[NLP] Lowercasing: '{text}' -> '{result}'")
        return result
    
    def remove_punctuation(self, text: str) -> str:
        """
        NLP Technique 2: Removing Punctuation
        Deleting punctuation marks from text
        """
        # Using string.punctuation and simple string methods
        result = text.translate(str.maketrans('', '', string.punctuation))
        print(f"[NLP] Punctuation removal: Removed {len([c for c in text if c in string.punctuation])} punctuation marks")
        return result
    
    def tokenize(self, text: str) -> List[str]:
        """
        NLP Technique 3: Tokenization
        Breaking down sentence into individual words or "tokens"
        """
        # Simple tokenization using split()
        tokens = text.split()
        print(f"[NLP] Tokenization: {len(tokens)} tokens created from input")
        return tokens
    
    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        NLP Technique 4: Stopword Removal
        Removing common words that don't add much meaning
        """
        original_count = len(tokens)
        filtered_tokens = [token for token in tokens if token.lower() not in self.stopwords]
        removed_count = original_count - len(filtered_tokens)
        print(f"[NLP] Stopword removal: Removed {removed_count} stopwords, kept {len(filtered_tokens)} meaningful tokens")
        return filtered_tokens
    
    def apply_stemming(self, tokens: List[str]) -> List[str]:
        """
        NLP Technique 5: Stemming
        Reducing words to their root form (e.g., "playing" -> "play")
        """
        stemmed_tokens = []
        stemmed_count = 0
        
        for token in tokens:
            original_token = token
            # Apply simple suffix removal rules
            for suffix, replacement in self.stemming_rules:
                if token.endswith(suffix) and len(token) > len(suffix) + 2:
                    token = token[:-len(suffix)] + replacement
                    if token != original_token:
                        stemmed_count += 1
                    break
            stemmed_tokens.append(token)
        
        print(f"[NLP] Stemming: Applied stemming to {stemmed_count} words")
        return stemmed_tokens
    
    def apply_lemmatization(self, tokens: List[str]) -> List[str]:
        """
        NLP Technique 6: Lemmatization
        Reducing words to their dictionary form considering context
        """
        lemmatized_tokens = []
        lemmatized_count = 0
        
        for token in tokens:
            # Check if word has a known lemma
            if token.lower() in self.lemma_dict:
                lemma = self.lemma_dict[token.lower()]
                lemmatized_tokens.append(lemma)
                lemmatized_count += 1
                print(f"[NLP] Lemmatization: '{token}' -> '{lemma}'")
            else:
                lemmatized_tokens.append(token)
        
        print(f"[NLP] Lemmatization: Applied to {lemmatized_count} words using dictionary lookup")
        return lemmatized_tokens

@dataclass 
class NLPProcessingResult:
    """Results of NLP processing with step-by-step transformations"""
    original_text: str
    lowercased: str
    no_punctuation: str
    tokens: List[str]
    no_stopwords: List[str]
    stemmed: List[str]
    lemmatized: List[str]
    final_processed: List[str]
    techniques_applied: List[str]

class EnhancedNLPProcessor:
    """
    Enhanced NLP processor that applies all techniques in sequence
    and provides detailed logging for demonstration purposes
    """
    
    def __init__(self):
        self.basic_processor = BasicNLPProcessor()
        self.processing_stats = {}
    
    def process_text_full_pipeline(self, text: str, apply_all: bool = True) -> NLPProcessingResult:
        """
        Apply complete NLP pipeline demonstrating all 6 techniques
        """
        print(f"\n[NLP PIPELINE] Processing: '{text}'")
        print("=" * 50)
        
        techniques_applied = []
        
        # Step 1: Lowercasing
        lowercased = self.basic_processor.apply_lowercasing(text)
        techniques_applied.append("Lowercasing")
        
        # Step 2: Remove Punctuation
        no_punctuation = self.basic_processor.remove_punctuation(lowercased)
        techniques_applied.append("Punctuation Removal")
        
        # Step 3: Tokenization
        tokens = self.basic_processor.tokenize(no_punctuation)
        techniques_applied.append("Tokenization")
        
        # Step 4: Stopword Removal
        no_stopwords = self.basic_processor.remove_stopwords(tokens)
        techniques_applied.append("Stopword Removal")
        
        # Step 5: Stemming
        stemmed = self.basic_processor.apply_stemming(no_stopwords.copy())
        techniques_applied.append("Stemming")
        
        # Step 6: Lemmatization  
        lemmatized = self.basic_processor.apply_lemmatization(no_stopwords.copy())
        techniques_applied.append("Lemmatization")
        
        # Use lemmatized as final (generally better than stemming)
        final_processed = lemmatized
        
        print(f"[NLP PIPELINE] Complete! Applied {len(techniques_applied)} techniques")
        print("=" * 50)
        
        return NLPProcessingResult(
            original_text=text,
            lowercased=lowercased,
            no_punctuation=no_punctuation,
            tokens=tokens,
            no_stopwords=no_stopwords,
            stemmed=stemmed,
            lemmatized=lemmatized,
            final_processed=final_processed,
            techniques_applied=techniques_applied
        )
    
    def process_subject_input(self, subject: str) -> str:
        """
        Clean and normalize subject input using NLP techniques
        Perfect for handling messy user input
        """
        print(f"\n[SUBJECT PROCESSING] Cleaning subject input...")
        
        # Apply basic cleaning
        result = self.process_text_full_pipeline(subject, apply_all=False)
        
        # For subjects, we want to keep it readable, so just basic cleaning
        cleaned_subject = ' '.join(result.no_stopwords)
        
        # Capitalize for display
        final_subject = ' '.join(word.capitalize() for word in cleaned_subject.split())
        
        print(f"[SUBJECT PROCESSING] '{subject}' -> '{final_subject}'")
        return final_subject
    
    def extract_key_sentiment_words(self, text: str) -> List[str]:
        """
        Extract key words for sentiment analysis using NLP preprocessing
        """
        print(f"\n[SENTIMENT NLP] Extracting key words for sentiment analysis...")
        
        result = self.process_text_full_pipeline(text)
        
        # Filter for emotion/sentiment related words
        sentiment_keywords = []
        emotion_words = {
            'struggle', 'difficult', 'hard', 'easy', 'excited', 'motivate',
            'tire', 'exhaust', 'overwhelm', 'confuse', 'understand',
            'love', 'hate', 'like', 'enjoy', 'bore', 'interest',
            'stress', 'anxious', 'calm', 'relax', 'worry', 'concern'
        }
        
        for word in result.final_processed:
            if word in emotion_words:
                sentiment_keywords.append(word)
        
        print(f"[SENTIMENT NLP] Found {len(sentiment_keywords)} sentiment keywords: {sentiment_keywords}")
        return sentiment_keywords
    
    def get_processing_summary(self) -> Dict:
        """
        Get summary of NLP techniques applied (for instructor demonstration)
        """
        return {
            "techniques_implemented": [
                "1. Lowercasing (text.lower())",
                "2. Punctuation Removal (string.translate())",
                "3. Tokenization (text.split())",
                "4. Stopword Removal (filter with set lookup)",
                "5. Stemming (suffix removal rules)",
                "6. Lemmatization (dictionary lookup)"
            ],
            "integration_points": [
                "Subject input normalization",
                "Sentiment analysis preprocessing", 
                "User input cleaning",
                "Text standardization"
            ],
            "practical_benefits": [
                "Handles messy user input (UPPERCASE, punctuation)",
                "Improves sentiment analysis accuracy",
                "Normalizes subject names",
                "Enhances text matching"
            ]
        }

# Global instance for use in other modules
nlp_processor = EnhancedNLPProcessor()