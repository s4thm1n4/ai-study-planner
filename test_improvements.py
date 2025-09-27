#!/usr/bin/env python3
"""
Test script to verify the improved topic generation and resource diversity
"""

import sys
import os
import json

# Add the backend path to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from simple_agents import ScheduleCreatorAgent, ResourceFinderAgent

def test_topic_generation():
    """Test the improved topic generation"""
    print("🔍 Testing Topic Generation...")
    print("=" * 50)
    
    agent = ScheduleCreatorAgent()
    
    test_subjects = [
        "Machine Learning", 
        "Python Programming", 
        "Gym Fitness Training",
        "Digital Marketing", 
        "Graphic Design",
        "React Development"
    ]
    
    for subject in test_subjects:
        print(f"\n📚 Subject: {subject}")
        topics = agent._generate_dynamic_topics(subject, 6)
        for i, topic in enumerate(topics, 1):
            print(f"  {i}. {topic}")

def test_resource_diversity():
    """Test the improved resource platform diversity"""
    print("\n\n🌐 Testing Resource Platform Diversity...")
    print("=" * 50)
    
    agent = ResourceFinderAgent()
    
    test_subjects = [
        ("Machine Learning", "data science"),
        ("JavaScript", "programming"), 
        ("Gym Training", "general"),
        ("Business Marketing", "business"),
        ("Graphic Design", "creative")
    ]
    
    for subject, category in test_subjects:
        print(f"\n📖 Subject: {subject} ({category})")
        resources = agent.find_best_resources(subject, difficulty="beginner", limit=5)
        
        for i, resource in enumerate(resources, 1):
            print(f"  {i}. {resource['title']}")
            print(f"     Platform: {resource['source']}")
            print(f"     Type: {resource['resource_type']}")
            print(f"     Score: {resource.get('similarity_score', 'N/A')}")
            print()

if __name__ == "__main__":
    test_topic_generation()
    test_resource_diversity()
    print("\n✅ Testing Complete!")