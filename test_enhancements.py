#!/usr/bin/env python3
"""
Test the enhanced advanced planner with knowledge levels and learning styles
"""

import sys
import os
import asyncio

# Add the backend directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

try:
    from simple_agents import CoordinatorAgent
    
    async def test_knowledge_levels():
        """Test different knowledge levels"""
        print("🧪 Testing Knowledge Levels")
        
        coordinator = CoordinatorAgent()
        test_subject = "Python Programming"
        
        for level in ["beginner", "intermediate", "advanced"]:
            print(f"\n🔍 Testing {level} level:")
            
            result = await coordinator.generate_complete_study_plan(
                user_id="test_user",
                subject=test_subject,
                available_hours_per_day=2,
                total_days=7,
                knowledge_level=level,
                learning_style="mixed"
            )
            
            if result.get('status') == 'success':
                plan = result.get('study_plan', {})
                print(f"  ✅ Hours: {plan.get('total_hours')}h")
                print(f"  ✅ Difficulty: {plan.get('difficulty')}")
                print(f"  ✅ Topics: {len(plan.get('schedule', []))}")
            else:
                print(f"  ❌ Failed: {result.get('message')}")
    
    async def test_learning_styles():
        """Test different learning styles"""
        print("\n🎨 Testing Learning Styles")
        
        coordinator = CoordinatorAgent()
        test_subject = "SEO"
        
        for style in ["visual", "auditory", "reading", "kinesthetic", "mixed"]:
            print(f"\n🔍 Testing {style} learning style:")
            
            result = await coordinator.generate_complete_study_plan(
                user_id="test_user",
                subject=test_subject,
                available_hours_per_day=2,
                total_days=5,
                knowledge_level="beginner",
                learning_style=style
            )
            
            if result.get('status') == 'success':
                plan = result.get('study_plan', {})
                resources = plan.get('resources', [])
                print(f"  ✅ Resources found: {len(resources)}")
                
                # Show resource types and scores
                for resource in resources[:2]:  # Show first 2
                    score = resource.get('similarity_score', 0)
                    res_type = resource.get('resource_type', 'unknown')
                    print(f"    - {res_type}: {score:.2f}")
            else:
                print(f"  ❌ Failed: {result.get('message')}")
    
    async def main():
        print("🚀 Testing Enhanced Advanced Planner\n")
        await test_knowledge_levels()
        await test_learning_styles()
        print("\n✨ Testing complete!")
    
    if __name__ == "__main__":
        asyncio.run(main())

except Exception as e:
    print(f"❌ Error: {e}")