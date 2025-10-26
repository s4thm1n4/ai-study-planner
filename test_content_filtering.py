#!/usr/bin/env python3
"""
Test script to verify content filtering for inappropriate words in resource finder
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from simple_agents import ResourceFinderAgent

def test_content_filtering():
    print("🧪 Testing Resource Finder Content Filtering...")
    print("=" * 60)
    
    agent = ResourceFinderAgent()
    
    # Test cases - legitimate subjects (should work)
    legitimate_subjects = [
        "Mathematics",
        "Python Programming", 
        "History of World War 2",
        "Data Science",
        "Machine Learning",
        "Chemistry"
    ]
    
    # Test cases - inappropriate subjects (should be blocked)
    inappropriate_subjects = [
        "violence",
        "adult content",
        "drugs",
        "terrorism",
        "hate speech",
        "illegal activities",
        "porn",
        "weapons"
    ]
    
    print("\n✅ TESTING LEGITIMATE SUBJECTS (should work):")
    print("-" * 50)
    for subject in legitimate_subjects:
        result = agent.find_best_resources(subject, limit=1)
        is_blocked = (len(result) == 1 and result[0].get('id') == 'error_1')
        status = "❌ BLOCKED (ERROR!)" if is_blocked else "✅ ALLOWED"
        print(f"   '{subject}': {status}")
    
    print("\n❌ TESTING INAPPROPRIATE SUBJECTS (should be blocked):")
    print("-" * 50)
    for subject in inappropriate_subjects:
        result = agent.find_best_resources(subject, limit=1)
        is_blocked = (len(result) == 1 and result[0].get('id') == 'error_1')
        status = "✅ BLOCKED" if is_blocked else "❌ ALLOWED (ERROR!)"
        print(f"   '{subject}': {status}")
        if is_blocked:
            print(f"      → {result[0].get('description', 'No description')}")
    
    print("\n" + "=" * 60)
    print("✅ Content filtering test completed!")
    print("\nThe resource finder should:")
    print("  • Allow legitimate educational subjects")
    print("  • Block inappropriate/unethical content")
    print("  • Return helpful error messages for blocked content")

if __name__ == "__main__":
    test_content_filtering()