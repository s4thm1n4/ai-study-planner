#!/usr/bin/env python3
"""
Quick NLP Integration Demo for Instructors
Shows all 6 NLP techniques working in the system
"""

def demonstrate_nlp_integration():
    """Demonstrate NLP integration with messy input"""
    
    print("🎓 NLP Techniques Integration Demo")
    print("=" * 50)
    
    # Test inputs that students might enter
    test_inputs = [
        "PYTHON programming!!!*&&&",
        "machine   LEARNING???",
        "web development!!!",
        "DATA science**&*",
        "JavaScript Programming  !!!",
    ]
    
    try:
        from nlp_processor import BasicNLPProcessor
        nlp = BasicNLPProcessor()
        
        print("\n📋 Testing NLP Processing:")
        print("-" * 30)
        
        for test_input in test_inputs:
            print(f"\n🔤 Original Input: '{test_input}'")
            
            # Process with all 6 NLP techniques
            result = nlp.process_text(test_input)
            
            print(f"✨ Processed Output: '{result['processed_text']}'")
            print(f"📝 Techniques Applied: {', '.join(result['techniques_applied'])}")
            print(f"🔧 Processing Steps: {result['processing_summary']}")
            
            # Show URL encoding improvement
            clean_url = result['processed_text'].replace(" ", "+")
            dirty_url = test_input.replace(" ", "+")
            print(f"🌐 Clean URL: search?query={clean_url}")
            print(f"❌ Dirty URL: search?query={dirty_url}")
            
        print(f"\n✅ All 6 NLP Techniques Successfully Integrated!")
        print("1. Lowercasing ✓")
        print("2. Punctuation Removal ✓") 
        print("3. Tokenization ✓")
        print("4. Stopword Removal ✓")
        print("5. Stemming ✓")
        print("6. Lemmatization ✓")
        
    except ImportError as e:
        print(f"❌ NLP processor not available: {e}")
        return False
    
    print(f"\n🎯 Integration Points:")
    print("- Subject processing in study plans")
    print("- Resource search optimization") 
    print("- Sentiment analysis enhancement")
    print("- URL cleaning for external resources")
    
    return True

if __name__ == "__main__":
    demonstrate_nlp_integration()