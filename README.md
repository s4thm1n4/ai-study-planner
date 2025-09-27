# 🤖 AI Study Planner - Multi-Agent System

A comprehensive AI-powered study planning system with **4 specialized agents** providing personalized learning experiences.

## 🎯 Features Implemented

### 🔒 **Security & Coordinator Agent** ✅
- **User Registration System**: Complete signup with username, email, password
- **User Authentication**: Secure login with password hashing
- **User Profile Management**: Retrieve and manage user information  
- **Database Integration**: SQLite database for persistent user data
- **Agent Coordination**: Seamlessly orchestrates all 4 agents
- **API Security**: Secure endpoints with proper error handling

### 📅 **Schedule Creator Agent** ✅
- **AI-Powered Scheduling**: Uses Google Gemini API for intelligent planning
- **Personalized Plans**: Adapts to learning style and knowledge level
- **Subject Database**: Comprehensive database of subjects with estimated hours
- **Flexible Scheduling**: Customizable daily hours and duration
- **Progress Tracking**: Database storage of study plans and progress

### 📚 **Resource Finder Agent (IR-Heavy)** ✅
- **Information Retrieval**: TF-IDF vectorization for content similarity
- **Resource Database**: Curated educational resources with ratings
- **Smart Matching**: Finds resources based on subject and difficulty
- **Multiple Formats**: Videos, articles, courses, and interactive content
- **Quality Scoring**: Resources ranked by relevance and quality

### 💪 **Motivation Coach Agent** ✅
- **Sentiment Analysis**: Analyzes user mood and motivation levels
- **Personalized Motivation**: Custom messages based on user state
- **Progress Encouragement**: Celebrates achievements and milestones
- **Study Tips**: Context-aware study recommendations
- **Mood-Based Responses**: Adapts messaging to user's emotional state

## 🚀 Getting Started

### Prerequisites
- Python 3.13+
- Virtual environment (recommended)
- Google API keys (Gemini AI, Custom Search)

### Installation

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd ai-study-planner
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # macOS/Linux
   ```

3. **Install Dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

4. **Configure Environment**
   Create `.env` file in root directory:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   ```

5. **Start the Server**
   ```bash
   cd backend
   python -m uvicorn main:app --reload
   ```

## 🌐 Access Points

- **Main Application**: http://127.0.0.1:8000/frontend/enhanced-index.html
- **Authentication**: http://127.0.0.1:8000/frontend/auth.html
- **API Documentation**: http://127.0.0.1:8000/docs
- **System Test**: http://127.0.0.1:8000/frontend/test-auth.html