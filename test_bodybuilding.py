#!/usr/bin/env python3
"""
Test specific bodybuilding topic generation
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from simple_agents import ScheduleCreatorAgent

def test_bodybuilding():
    agent = ScheduleCreatorAgent()
    
    test_subjects = [
        "Body Building",
        "Bodybuilding", 
        "Fitness",
        "Gym Training",
        "Cooking",
        "Photography"
    ]
    
    for subject in test_subjects:
        print(f"\n🎯 {subject} Topics:")
        topics = agent._generate_dynamic_topics(subject, 6)
        for i, topic in enumerate(topics, 1):
            print(f"  {i}. {topic}")

if __name__ == "__main__":
    test_bodybuilding()