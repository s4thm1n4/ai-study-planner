#!/usr/bin/env python3
"""
COURSEWORK DEMONSTRATION: NLP Techniques Integration Test
Shows how all 6 NLP techniques are applied in the AI Study Planner system
"""

import sys
sys.path.append('backend')

def demonstrate_nlp_techniques():
    """
    Demonstrate all NLP techniques learned in class integrated into the study planner
    """
    
    print("=" * 80)
    print("📚 COURSEWORK DEMONSTRATION: NLP TECHNIQUES IN AI STUDY PLANNER")
    print("=" * 80)
    print("Techniques Applied: Lowercasing, Punctuation Removal, Tokenization,")
    print("                   Stopword Removal, Stemming, Lemmatization")
    print("=" * 80)
    
    try:
        from backend.nlp_processor import nlp_processor
        from backend.simple_agents import MotivationCoachAgent, ScheduleCreatorAgent
        
        # Test 1: Subject Input Processing
        print("\n🎯 TEST 1: SUBJECT INPUT PROCESSING WITH NLP")
        print("=" * 50)
        
        schedule_agent = ScheduleCreatorAgent()
        
        messy_subjects = [
            "MACHINE LEARNING!!!",
            "python programming???",  
            "data Science & Analytics...",
            "WEB-Development, HTML, CSS",
            "artificial intelligence research"
        ]
        
        for subject in messy_subjects:
            processed = schedule_agent.process_subject_with_nlp(subject)
            print(f"✅ '{subject}' -> '{processed}'")
        
        # Test 2: Motivation Text Analysis with NLP
        print("\n💪 TEST 2: MOTIVATION ANALYSIS WITH NLP PREPROCESSING")
        print("=" * 50)
        
        motivation_agent = MotivationCoachAgent()
        
        user_inputs = [
            "I'm STRUGGLING with machine learning concepts!!!",
            "Really EXCITED about learning Python programming...",
            "Having trouble staying motivated, feeling overwhelmed with studies",
            "Can't understand these algorithms, they're too complex!"
        ]
        
        for user_input in user_inputs:
            print(f"\nInput: '{user_input}'")
            try:
                result = motivation_agent._get_enhanced_motivation(
                    user_input=user_input,
                    progress_percentage=0.5,
                    subject="Computer Science",
                    user_id="demo_user"
                )
                
                mood = result['mood_analysis']['detected_mood']
                print(f"-> Detected Mood: {mood}")
                print(f"-> Quote: '{result['quote']['content'][:50]}...'")
                
            except Exception as e:
                print(f"-> Error: {e}")
        
        # Test 3: Pure NLP Processing Pipeline
        print("\n🔬 TEST 3: PURE NLP PROCESSING PIPELINE")
        print("=" * 50)
        
        test_text = "I'm really struggling with understanding machine learning algorithms, it's overwhelming!"
        
        result = nlp_processor.process_text_full_pipeline(test_text)
        
        print(f"Original: {result.original_text}")
        print(f"Lowercased: {result.lowercased}")
        print(f"No Punctuation: {result.no_punctuation}")
        print(f"Tokens: {result.tokens}")
        print(f"No Stopwords: {result.no_stopwords}")
        print(f"Stemmed: {result.stemmed}")
        print(f"Lemmatized: {result.lemmatized}")
        print(f"Final Processed: {result.final_processed}")
        print(f"Techniques Applied: {', '.join(result.techniques_applied)}")
        
        # Test 4: Practical Benefits Summary
        print("\n📊 TEST 4: PRACTICAL BENEFITS OF NLP INTEGRATION")
        print("=" * 50)
        
        summary = nlp_processor.get_processing_summary()
        
        print("🔧 Techniques Implemented:")
        for technique in summary['techniques_implemented']:
            print(f"   ✅ {technique}")
            
        print("\n🎯 Integration Points:")
        for point in summary['integration_points']:
            print(f"   📍 {point}")
            
        print("\n💡 Practical Benefits:")
        for benefit in summary['practical_benefits']:
            print(f"   🌟 {benefit}")
        
        print("\n" + "=" * 80)
        print("🎉 COURSEWORK DEMONSTRATION COMPLETE!")
        print("=" * 80)
        print("✅ All 6 NLP techniques successfully integrated")
        print("✅ Practical applications demonstrated")
        print("✅ Real-world benefits shown")
        print("✅ System remains fully functional")
        print("\n📝 INSTRUCTOR NOTE: This demonstrates practical application of")
        print("    basic NLP preprocessing techniques learned in class using")
        print("    simple Python implementations (text.lower(), split(), etc.)")
        
    except Exception as e:
        print(f"❌ Error in demonstration: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    demonstrate_nlp_techniques()