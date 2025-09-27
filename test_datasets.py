#!/usr/bin/env python3
"""
Test script to verify enhanced dataset functionality
"""
import sys
import os
import json

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from simple_agents import ScheduleCreatorAgent, ResourceFinderAgent, CoordinatorAgent
    
    def test_subjects_database():
        """Test subject database loading and matching"""
        print("🔍 Testing Subjects Database...")
        
        schedule_agent = ScheduleCreatorAgent()
        
        # Test exact matches
        test_subjects = ["SEO", "Python Programming", "Machine Learning"]
        for subject in test_subjects:
            info = schedule_agent.subjects_db.get(subject)
            if info:
                print(f"✅ Found exact match for '{subject}': {info.get('difficulty')} level, {info.get('estimated_hours')}h")
            else:
                # Test fuzzy matching
                similar = schedule_agent._find_similar_subject(subject)
                if similar:
                    print(f"🔍 Found similar match for '{subject}': {similar.get('matched_via')}")
                else:
                    print(f"❌ No match found for '{subject}'")
        
        print(f"📊 Total subjects in database: {len(schedule_agent.subjects_db)}")
        
    def test_resources_database():
        """Test resource database loading and matching"""
        print("\n📚 Testing Resources Database...")
        
        resource_agent = ResourceFinderAgent()
        
        # Test resource finding for various subjects
        test_queries = [
            ("SEO", "beginner"),
            ("Python", "beginner"),
            ("JavaScript", "beginner"),
            ("Machine Learning", "intermediate"),
            ("Cooking", "beginner")
        ]
        
        for subject, difficulty in test_queries:
            resources = resource_agent.find_best_resources(subject, difficulty, limit=3)
            if resources:
                print(f"✅ Found {len(resources)} resources for '{subject}' ({difficulty}):")
                for resource in resources[:2]:  # Show first 2
                    print(f"   - {resource.get('title')} (score: {resource.get('similarity_score', 'N/A')})")
            else:
                print(f"❌ No resources found for '{subject}'")
        
        print(f"📊 Total resources in database: {len(resource_agent.resources_db)}")
    
    def test_full_integration():
        """Test full study plan generation"""
        print("\n🚀 Testing Full Study Plan Generation...")
        
        coordinator = CoordinatorAgent()
        
        # Test with a subject that should have good coverage
        test_subject = "SEO"
        print(f"Generating study plan for: {test_subject}")
        
        try:
            import asyncio
            
            async def run_test():
                result = await coordinator.generate_complete_study_plan(
                    user_id="test_user",
                    subject=test_subject,
                    available_hours_per_day=2,
                    total_days=7,
                    knowledge_level="beginner"
                )
                
                if result.get('status') == 'success':
                    plan = result.get('study_plan', {})
                    print(f"✅ Generated plan for '{test_subject}':")
                    print(f"   - Total hours: {plan.get('total_hours')}h")
                    print(f"   - Difficulty: {plan.get('difficulty')}")
                    print(f"   - Schedule days: {len(plan.get('schedule', []))}")
                    print(f"   - Resources found: {len(plan.get('resources', []))}")
                    
                    # Show first topic from schedule
                    schedule = plan.get('schedule', [])
                    if schedule and schedule[0].get('topics'):
                        first_topic = schedule[0]['topics'][0]
                        print(f"   - First topic: {first_topic.get('topic')}")
                else:
                    print(f"❌ Failed to generate plan: {result.get('message')}")
            
            asyncio.run(run_test())
            
        except Exception as e:
            print(f"❌ Error during integration test: {e}")
    
    if __name__ == "__main__":
        print("🧪 Starting Enhanced Dataset Tests\n")
        
        test_subjects_database()
        test_resources_database() 
        test_full_integration()
        
        print("\n✨ Test complete!")

except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure you're running this from the project root directory")
except Exception as e:
    print(f"❌ Unexpected error: {e}")