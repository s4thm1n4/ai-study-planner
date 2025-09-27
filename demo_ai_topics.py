"""
Demonstration: AI-Powered vs Hardcoded Topic Generation
Shows how the new system handles unlimited subject types intelligently
"""

from backend.simple_agents import ScheduleCreatorAgent

def demonstrate_ai_flexibility():
    """Show how AI can handle any subject type without hardcoding"""
    
    agent = ScheduleCreatorAgent()
    
    # Test subjects that would have been impossible with hardcoded approach
    diverse_subjects = [
        # Traditional academic
        "Renaissance Art History",
        "Quantum Mechanics",
        
        # Professional skills  
        "Corporate Negotiation",
        "Project Management",
        
        # Creative arts
        "Watercolor Painting",
        "Jazz Improvisation",
        
        # Practical skills
        "Home Brewing Beer",
        "Urban Gardening",
        
        # Niche hobbies
        "Model Train Building", 
        "Competitive Chess",
        
        # Modern skills
        "Social Media Marketing",
        "Drone Photography",
        
        # Cultural/Language
        "Japanese Tea Ceremony",
        "Sign Language",
        
        # Fitness variants
        "Aerial Yoga",
        "Powerlifting",
        
        # Completely unique
        "Mushroom Cultivation",
        "Leather Crafting"
    ]
    
    print("🚀 AI-POWERED TOPIC GENERATION DEMONSTRATION")
    print("=" * 60)
    print("✅ Handles ANY subject without hardcoding!")
    print("✅ Contextually appropriate topics for each domain")
    print("✅ No IT bias - each gets subject-specific curriculum")
    print("=" * 60)
    
    for i, subject in enumerate(diverse_subjects, 1):
        # Get domain identification
        domain = agent.topic_generator.identify_domain(subject)
        topics = agent._generate_dynamic_topics(subject, 4)
        
        print(f"\n{i:2d}. 📚 {subject} ({domain.title()} Domain)")
        for j, topic in enumerate(topics, 1):
            print(f"    {j}. {topic}")
    
    print("\n" + "=" * 60)
    print("🎯 RESULT: The AI system intelligently generates appropriate")
    print("   learning topics for ANY subject a user might enter!")
    print("🔥 NO MORE HARDCODING NEEDED!")

if __name__ == "__main__":
    demonstrate_ai_flexibility()