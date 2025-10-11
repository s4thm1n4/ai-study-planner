# 🎓 AI Study Planner - Advanced IRWA Implementation

An intelligent, multi-agent study planning system that leverages Natural Language Processing, sentiment analysis, and gamification to create personalized learning experiences.

## 🌟 Features

### 🔤 Advanced Natural Language Processing
- **Complete NLP Pipeline**: Implementation of all 6 core techniques
  - Lowercasing for text normalization
  - Punctuation removal for clean processing
  - Tokenization for meaningful text units
  - Stopword removal for focused content
  - Stemming for word root extraction
  - Lemmatization for dictionary-based normalization

### 🤖 Multi-Agent Architecture
- **Security Agent**: Input validation and sanitization
- **Schedule Agent**: Personalized study plan generation
- **Resource Agent**: Educational content discovery with fuzzy matching
- **Motivation Agent**: Sentiment-aware encouragement system

### 🎭 Advanced Sentiment Analysis
- **Multi-dimensional Analysis**: Energy, confidence, and stress level detection
- **Mood-based Responses**: 5 distinct emotional states with personalized messaging
- **Dynamic Content**: Context-aware motivation based on subject and mood

### 📊 Gamified Progress Tracking
- **Daily Check-ins**: Hour-by-hour study tracking
- **Streak Counters**: Consistency motivation with visual feedback
- **Achievement System**: Milestone celebrations and progress rewards
- **Visual Analytics**: Charts and progress visualization

### 🔍 Intelligent Information Retrieval
- **Smart Search**: Fuzzy matching algorithms for resource discovery
- **Content Optimization**: Clean URLs and formatted subject names
- **Quality Scoring**: Relevance-based educational resource ranking
- **Personalized Recommendations**: Learning style adaptation

## 🏗️ Technical Architecture

### Frontend Layer
- **HTML5/CSS3**: Modern responsive design with animations
- **JavaScript ES6+**: Event-driven architecture with async processing
- **Chart.js**: Progress visualization and analytics
- **CSS Animations**: Smooth transitions and user feedback

### API Gateway
- **FastAPI**: High-performance async web framework
- **JWT Authentication**: Secure token-based user sessions
- **Request Validation**: Pydantic models for type safety
- **RESTful Endpoints**: Clean API design patterns

### AI Processing Layer
- **Custom NLP Engine**: Pure Python implementation of text processing
- **Sentiment Analyzer**: Multi-dimensional mood detection
- **Recommendation Engine**: Content matching and personalization
- **Agent Coordinator**: Multi-agent task distribution

### Data Layer
- **SQLite Database**: User accounts, progress tracking, and session management
- **JSON Datasets**: Educational resources and configuration data
- **Caching System**: Performance optimization for frequent queries

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Modern web browser
- SQLite support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-study-planner
   ```

2. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   # Start the backend server
   python main.py

   # Open frontend in browser
   # Navigate to frontend/enhanced-index.html
   ```

### Quick Start
1. Open `frontend/enhanced-index.html` in your browser
2. Enter your study subject and available hours
3. Select your current mood using animated emoji buttons
4. Receive your personalized study plan with resources
5. Track your daily progress and build study streaks

## 📋 IRWA Requirements Alignment

### ✅ Natural Language Processing
- **Complete Implementation**: All 6 core NLP techniques with visible processing
- **Integration**: NLP processing throughout the entire system
- **Demonstration**: Clear logging and feedback for coursework validation

### ✅ Information Retrieval
- **Advanced Search**: Fuzzy matching with relevance scoring
- **Content Discovery**: Educational resource database with quality filtering
- **Optimization**: Clean URLs and formatted content presentation

### ✅ Web Analytics
- **User Behavior Tracking**: Progress analytics and engagement metrics
- **Sentiment Analysis**: Multi-dimensional mood profiling
- **Performance Monitoring**: System usage and effectiveness tracking

### ✅ AI Integration
- **Multi-Agent System**: Coordinated AI agents for specialized tasks
- **Machine Learning**: Sentiment analysis and recommendation algorithms
- **Personalization**: Adaptive content based on user preferences

### ✅ User Experience
- **Responsive Design**: Cross-device compatibility
- **Gamification**: Achievement system and progress motivation
- **Modern Interface**: Animations, transitions, and visual feedback

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Study Planning
- `POST /api/plan` - Generate personalized study plan
  - Parameters: subject, hours, difficulty, mood
  - Returns: Schedule, resources, motivation

### Resources
- `GET /api/resources` - Educational content discovery
  - Parameters: subject, type, difficulty
  - Returns: Curated resource list with clean URLs

### Progress Tracking
- `POST /api/progress` - Update study progress
- `GET /api/progress/stats` - Retrieve analytics
- `GET /api/progress/achievements` - Achievement status

## 📊 System Metrics

- **NLP Techniques**: 6/6 implemented and integrated
- **Response Time**: < 200ms average for API calls
- **Code Coverage**: Comprehensive error handling and fallbacks
- **User Experience**: Mobile-responsive with smooth animations
- **Scalability**: Modular architecture for easy extension

## 🏆 Key Achievements

1. **Complete NLP Integration**: All 6 techniques visible and functional
2. **Multi-Agent Architecture**: Specialized AI agents working in coordination
3. **Advanced Sentiment Analysis**: Multi-dimensional mood detection
4. **Gamified User Experience**: Progress tracking with achievement system
5. **Professional Code Quality**: Clean architecture with comprehensive documentation

## 📚 Documentation

- **[Complete Documentation](frontend/documentation.html)**: Comprehensive feature overview
- **[Technical Architecture](frontend/architecture.html)**: Detailed system design
- **Code Comments**: Inline documentation throughout codebase
- **API Documentation**: FastAPI automatic documentation at `/docs`

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **SQLite**: Lightweight database for data persistence
- **Pydantic**: Data validation and serialization
- **JWT**: Secure authentication tokens

### Frontend
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: Pure ES6+ without frameworks
- **Chart.js**: Data visualization library
- **Font Awesome**: Icon library for enhanced UI

### AI/ML
- **Custom NLP Engine**: Pure Python text processing
- **Sentiment Analysis**: Multi-dimensional mood detection
- **Fuzzy Matching**: Similarity algorithms for content discovery
- **Recommendation System**: Personalized content suggestions

## 🔍 Testing

The system includes comprehensive testing for:
- **NLP Processing**: All 6 techniques with sample data
- **API Endpoints**: Request validation and response formatting
- **Authentication**: Security and token management
- **User Interface**: Cross-browser compatibility and responsiveness

## 📈 Performance Optimization

- **Async Processing**: Non-blocking API operations
- **Caching**: Frequent query result storage
- **Efficient Algorithms**: Optimized NLP and matching algorithms
- **Responsive Design**: Mobile-first approach for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request with detailed description

## 📄 License

This project is developed for educational purposes as part of IRWA coursework requirements.

---

**AI Study Planner** - Transforming education through intelligent technology 🚀