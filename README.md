# SIPwise - Smart Intelligent Beverage Guidance Platform

![SIPwise Logo](images/logo.png)

## 🎯 Project Overview

**SIPwise** is an AI-powered health awareness platform that educates users about the harmful effects of sugary soft drinks and promotes healthier beverage choices. Built with a responsive web interface, SIPwise combines interactive features, AI-driven insights, and gamification to make health education engaging and personalized.

The platform helps users understand what they're really drinking—from sugar content to harmful ingredients—and guides them toward better alternatives with science-backed facts and a supportive community.

---

## ✨ What SIPwise Does

SIPwise transforms health awareness into an interactive experience by providing:

### Core Features:
1. **Interactive Sugar Visualization** - Visual representation of sugar content in beverages
2. **Health Facts & Education** - Curated daily facts about beverage-related health risks
3. **AI-Powered Quiz Master** - Personalized quizzes generated based on user preferences and difficulty level
4. **Health AI Chatbot** - 10-question conversational interview for personalized wellness assessment
5. **Ingredient Learning** - Detailed information about harmful additives in beverages
6. **Daily Challenges** - Gamified challenges with point rewards to encourage healthy habits
7. **Leaderboard System** - Community ranking to foster friendly competition
8. **Image Generation** - Create custom visualizations using AI
9. **User Profiles** - Track progress, points, and personal wellness journey

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup for accessibility
- **CSS3** - Responsive design with animations
- **JavaScript (Vanilla)** - Interactive features, DOM manipulation
- **GSAP** - Advanced animations and scroll triggers
- **Firebase** - User authentication and data persistence

### Backend
- **Node.js** - Server runtime
- **Express.js** - REST API framework
- **Perplexity AI** - AI-powered content generation (quiz, health insights, facts)
- **Stability AI** - Image generation for visualizations
- **Firebase Admin SDK** - Database and storage management
- **Firestore** - NoSQL database for user data

### Additional Dependencies
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **form-data** - Multipart form handling
- **date-fns** - Date utility library
- **uuid** - Unique identifier generation

---

## 📋 Workflow & User Journey

### User Flow:
1. **Landing Page** - Hero section with call-to-action buttons
2. **Explore Drinks** - Browse and learn about various beverages
3. **Learn Ingredients** - Understand harmful additives
4. **Health Facts** - Read daily health tips
5. **Quiz** - Take personalized quiz based on preferences
6. **Health AI Interview** - 10-question conversational wellness assessment
7. **View Results** - Get personalized wellness summary
8. **Leaderboard** - Compete with other users
9. **Profile** - Track personal progress and points
10. **Daily Challenges** - Complete challenges for rewards

### AI Workflow:
- **Quiz Generation**: Perplexity AI generates 8 personalized questions based on user preferences
- **Health Assessment**: AI conducts a 10-question interview and provides comprehensive wellness summary
- **Image Creation**: Stability AI generates custom visuals based on user prompts
- **Daily Content**: AI creates fresh daily facts and health tips

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Git
- API Keys:
  - Perplexity AI API Key
  - Stability AI API Key (optional)
  - Firebase Project Setup

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Sachin23991/sipwise.git
   cd sipwise
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   Create a `.env` file in the root directory:
   ```env
   PERPLEXITY_API_KEY=your_perplexity_key_here
   STABILITY_API_KEY=your_stability_key_here
   FIREBASE_STORAGE_BUCKET=your_firebase_bucket
   PORT=3000
   NODE_ENV=development
   ```

4. **Firebase Setup** (Optional)
   - Add your `serviceAccountKey.json` to the root directory
   - Or use `serviceAccountKey.json.json` if needed

5. **Start the Server**
   ```bash
   node server.js
   ```
   Server runs at: `http://localhost:3000`

6. **Open in Browser**
   - Navigate to `http://localhost:3000`
   - Or open `index.html` directly in your browser

---

## 📁 Project Structure

```
sipwise/
├── index.html              # Landing page
├── home.html              # Home dashboard
├── loginpage.html         # Authentication page
├── healthfact.html        # Health facts page
├── healthai.html          # AI chatbot interface
├── quiz.html              # Quiz interface
├── leaderboard.html       # Community rankings
├── profile.html           # User profile
├── ingredients.html       # Ingredient information
├── exploreindex.html      # Beverage explorer
├── map.html               # Location finder
├── aboutus.html           # About page
├── contactus.html         # Contact page
│
├── style.css              # Global styles
├── healthai.css           # AI chatbot styles
├── quiz.css               # Quiz styles
├── leaderboard.css        # Leaderboard styles
├── loginpagestyle.css     # Login styles
├── explorestyle.css       # Explorer styles
├── contactus.css          # Contact styles
├── map.css                # Map styles
├── profile.css            # Profile styles
│
├── script.js              # Main interactive features
├── healthai.js            # AI chatbot logic
├── quiz.js                # Quiz logic
├── leaderboard.js         # Leaderboard logic
├── loginpagescript.js     # Authentication logic
├── explorescript.js       # Explorer logic
├── profile.js             # Profile management
├── map.js                 # Map functionality
│
├── server.js              # Express backend server
├── package.json           # Dependencies
├── .env                   # Environment variables
├── cors.json              # CORS configuration
├── serviceAccountKey.json # Firebase credentials (if using)
│
├── images/                # Image assets
└── README.md              # This file
```

---

## 📚 How to Use

### For End Users:

#### 1. **First Time Setup**
- Visit the landing page
- Read the health facts
- Click "Explore Drinks" to learn about beverages
- Click "Learn About Harmful Ingredients"

#### 2. **Take a Quiz**
- Go to the Quiz section
- Answer preference questions
- Select difficulty level
- Answer generated questions
- View results with explanations

#### 3. **Health AI Interview**
- Start the Health AI chat
- Answer 10 conversational questions
- Receive personalized wellness summary with recommendations

#### 4. **Complete Challenges**
- Check the daily challenge
- Complete tasks and earn "Hydro Points"
- View your ranking on the leaderboard

#### 5. **Track Progress**
- Visit your profile
- See accumulated points
- View quiz history
- Check personalized health tips

### For Developers:

#### 1. **API Endpoints**

**Quiz Master Endpoints:**
- `POST /api/quiz-master` - Generate quiz, explanations, facts
  - Stages: `get_fact_of_the_day`, `start_interview`, `generate_quiz`, `explain_wrong_answers`

**Health AI:**
- `POST /api/health-ai` - Conversational wellness assessment
  - Returns: Next question or final wellness summary

**Image Generation:**
- `POST /api/generate-real-image` - Generate custom images
  - Body: `{ userPrompt, uid }`

**Gamification:**
- `GET /api/daily-challenge` - Get today's challenge
- `POST /api/complete-challenge` - Mark challenge complete
- `GET /api/leaderboard` - Top 10 users by points
- `GET /api/points/:uid` - Get user points
- `POST /api/points` - Update user points

**Activity Tracking:**
- `POST /api/activity/quiz` - Save quiz results
- `POST /api/activity/interview-answers` - Save interview answers
- `GET /api/activity/quiz-history/:uid` - Get past quizzes
- `GET /api/activity/health-tips/:uid` - Generate personalized tips

**Debug:**
- `GET /health` - Server health check
- `GET /debug/test-perplexity-key` - Test Perplexity API

#### 2. **Environment Variables Needed**
```
PERPLEXITY_API_KEY       # For AI content generation
STABILITY_API_KEY        # For image generation (optional)
FIREBASE_STORAGE_BUCKET  # Firebase storage bucket name
PORT                     # Server port (default: 3000)
NODE_ENV                 # Environment mode
```

#### 3. **Running in Development**
```bash
# Watch mode (requires nodemon)
npm install -g nodemon
nodemon server.js

# Or standard mode
node server.js

# Test Perplexity connectivity
curl http://localhost:3000/debug/test-perplexity-key
```

---

## 🎮 Feature Explanations

### Sugar Visualization
Interactive feature showing exactly how much sugar is in a can of soda by pouring it into a visual representation.

### Quiz Master System
- Asks 3 initial preference questions
- Generates 8 personalized questions
- Provides detailed explanations for wrong answers
- Uses Perplexity AI for dynamic content

### Health AI Chatbot
- Conducts 10-question wellness interview
- Asks relevant follow-up questions
- Generates comprehensive wellness summary at the end
- Includes actionable health recommendations

### Leaderboard
- Ranks users by "Hydro Points"
- Points earned from completing daily challenges
- One challenge per day per user
- Community-driven engagement

### Daily Challenges
7 rotating challenges:
- Hydration Hero (20 points)
- Sugar Swap (30 points)
- Move Your Body (25 points)
- Mindful Sipping (15 points)
- Fruit Power (25 points)
- Share the Knowledge (20 points)
- Early Bird Hydration (15 points)

---

## 🔒 Security & Privacy

- Firebase Authentication for secure user accounts
- Environment variables protect API keys
- Firestore database with user-level access controls
- CORS properly configured for cross-domain requests
- No passwords stored in frontend code
- Sensitive data (API keys) never logged or exposed

---

## 🚨 Troubleshooting

### Issue: Perplexity API Returns 404/502
- **Solution**: Check PERPLEXITY_API_KEY in .env file
- The server tries multiple Perplexity endpoints for redundancy
- Check `/debug/test-perplexity-key` endpoint for diagnostics

### Issue: Firebase Not Connecting
- **Solution**: Ensure serviceAccountKey.json is in root directory
- Or disable Firebase features if not needed
- Server can run with degraded functionality

### Issue: CORS Errors
- **Solution**: Verify cors.json configuration
- Ensure frontend domain is in allowed origins
- Check CORS middleware in server.js

### Issue: Port Already in Use
- **Solution**: Change PORT in .env file
- Or kill process: `lsof -ti:3000 | xargs kill -9`

---

## 📱 Responsive Design

SIPwise is fully responsive across:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

CSS media queries ensure optimal layout on all devices.

---

## 🎨 Customization

### Styling
- Modify CSS files in root directory
- Use existing color scheme or create custom theme
- GSAP animations can be adjusted in script.js

### Content
- Daily challenges defined in server.js
- Quiz prompts customizable in API endpoints
- Health facts generated dynamically by Perplexity

### API Integration
- Replace Perplexity with other AI providers
- Swap Stability AI for alternative image generation
- Connect to different databases instead of Firebase

---

## 🤝 Contributing

Contributions welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Test all features before submitting PR
- Update README if adding new features
- Keep security best practices in mind

---

## 📄 License

This project is currently unlicensed. For licensing inquiries, contact the maintainer.

---

## 📞 Contact & Support

- **Creator**: Sachin Rao Mandhaiya
- **GitHub**: [@Sachin23991](https://github.com/Sachin23991)
- **Project**: [sipwise on GitHub](https://github.com/Sachin23991/sipwise)

### Support
For bug reports, feature requests, or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include environment details and error messages

---

## 🙏 Acknowledgments

- **GSAP** - Smooth animations and scroll triggers
- **Perplexity AI** - Intelligent content generation
- **Stability AI** - Image generation capabilities
- **Firebase** - Backend infrastructure
- **Express.js** - Web framework

---

## ⚠️ Disclaimer

This is an educational platform focused on health awareness. While we provide evidence-based information, this is not a substitute for professional medical advice. Always consult a healthcare professional for personal health concerns.

---

## 📊 Project Statistics

- **Frontend**: HTML (60.6%), JavaScript (22.3%), CSS (17.1%)
- **Lines of Code**: 1000+
- **API Endpoints**: 15+
- **Features**: 10+
- **Responsive Breakpoints**: 3

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Status**: Active Development
