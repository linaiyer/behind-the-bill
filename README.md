# Behind the Bill

<div align="center">
  <h3>🏛️ Making Politics Accessible Through AI</h3>
  <p>An AI-powered React Native app that transforms how Americans understand and engage with politics</p>
  
  ![React Native](https://img.shields.io/badge/React%20Native-0.73-blue.svg)
  ![Expo](https://img.shields.io/badge/Expo-SDK%2053-000020.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.1-blue.svg)
  ![License](https://img.shields.io/badge/License-MIT-green.svg)
</div>

## 📖 About

Behind the Bill is an AI-powered mobile application that makes understanding legislation fun, interactive, and personal. Our app helps users connect with the policies that matter most through personalized news curation, intelligent policy analysis, and conversational AI politicians.

### 🎯 Key Features

- **🤖 AI-Curated News**: Personalized political news feed powered by machine learning
- **💡 Smart Term Highlighting**: Real-time AI analysis of complex political terminology
- **📊 Impact Simulation**: AI-powered policy impact analysis tailored to your profile
- **💬 Political Chat**: Conversational AI trained on real politicians' positions
- **🌙 Dark Mode**: Full dark theme support with user preferences
- **📱 Cross-Platform**: Works on iOS, Android, and web

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for Mac) or Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/linaiyer/behind-the-bill
   cd behind-the-bill-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your preferred platform**
   ```bash
   # iOS (requires Mac)
   npm run ios
   
   # Android (requires Android Studio/emulator)
   npm run android
   
   # Web browser
   npm run web
   ```

## 📱 Usage

### First Time Setup

1. **Welcome Screen**: Launch the app and tap "Get Started"
2. **User Survey**: Complete the demographic and preference survey to personalize your experience
3. **News Feed**: Browse AI-curated political news tailored to your interests
4. **Article Reading**: Tap on articles to read with AI-powered term highlighting
5. **Political Chat**: Navigate to the chat tab to engage with AI politicians

### Navigation

- **Home Tab**: AI-curated news feed and article discovery
- **Chat Tab**: Search and chat with AI-powered political figures
- **Settings Tab**: Manage preferences, dark mode, and account settings

### Key Interactions

- **Swipe**: Navigate through news articles
- **Tap highlighted terms**: Get instant AI-powered explanations
- **Chat with politicians**: Ask questions about policies and their impacts
- **Simulate policy impacts**: See how legislation affects your interests

## 🏗️ Project Structure

```
behind-the-bill-app/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── SharedNavBar.tsx
│   │   ├── HighlightedText.tsx
│   │   └── AuthModal.tsx
│   ├── screens/             # Main application screens
│   │   ├── WelcomeScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ArticleReaderScreen.tsx
│   │   ├── ContextScreen.tsx
│   │   ├── PoliticalChatScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── navigation/          # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── MainTabNavigator.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useUserPreferences.ts
│   ├── services/           # API and external services
│   │   └── authService.ts
│   ├── utils/              # Utility functions and data
│   │   ├── newsApi.ts
│   │   ├── politicalFigures.ts
│   │   └── politicalTerms.ts
│   └── types/              # TypeScript type definitions
│       ├── index.ts
│       ├── auth.ts
│       └── politicalChat.ts
├── App.tsx                 # Main app entry point
├── package.json
└── README.md
```

## 🛠️ Development

### Architecture

- **Frontend**: React Native with Expo SDK 53
- **Language**: TypeScript for type safety
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: React Navigation v7
- **State Management**: React hooks with local state
- **AI Integration**: Custom services for political analysis and chat

### Key Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build system
- **TypeScript**: Static typing for better development experience
- **NativeWind**: Utility-first CSS framework
- **React Navigation**: Navigation library for React Native
- **Work Sans**: Custom font family for consistent typography

### Theme System

The app uses a comprehensive theming system supporting:
- Light and dark modes
- Customizable font sizes
- Consistent color palette
- Dynamic styling based on user preferences

### Development Commands

```bash
# Start development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web

# Type checking
npx tsc --noEmit

# Clear cache
npx expo start --clear
```

## 🎨 Design System

### Colors

- **Primary**: #008080 (Teal)
- **Text Primary**: #111111 (Dark Gray)
- **Text Secondary**: #6B6B6B (Medium Gray)
- **Background**: #FFFFFF (White)
- **Card Background**: Dynamic based on theme

### Typography

- **Font Family**: Work Sans (400, 500, 600, 700)
- **Font Scaling**: User-configurable sizing
- **Line Heights**: Optimized for readability

### Components

- Consistent spacing and padding
- Rounded corners and shadows
- Responsive touch targets
- Accessible color contrasts

## 🤖 AI Features

### News Curation
- Machine learning algorithms analyze user preferences
- Personalized content recommendations
- Continuous learning from user interactions

### Term Highlighting
- Natural language processing for political terminology
- Real-time content analysis
- Context-aware explanations

### Impact Simulation
- AI-powered policy analysis
- Personalized impact projections
- Multi-dimensional effect modeling

### Political Chat
- Conversational AI trained on public statements
- Policy position analysis
- Respectful discourse enforcement

## 📝 Contributing

We welcome contributions to Behind the Bill! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code formatting
- Write meaningful commit messages
- Test on multiple platforms
- Update documentation as needed

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
NEWS_API_KEY=your_news_api_key_here
POLITICAL_API_KEY=your_political_api_key_here

# App Configuration
APP_ENV=development
DEBUG_MODE=true
```

### User Preferences

The app supports customizable user preferences:

- **Dark Mode**: Toggle between light and dark themes
- **Font Size**: Small, medium, large, extra large
- **News Categories**: Customize content preferences
- **Political Interests**: Tailor policy recommendations

## 📱 Platform Support

- **iOS**: 13.0+
- **Android**: API 21+ (Android 5.0+)
- **Web**: Modern browsers with JavaScript enabled

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Run `npx expo start --clear`
2. **iOS simulator not starting**: Check Xcode installation
3. **Android emulator problems**: Verify Android Studio setup
4. **Font loading errors**: Ensure fonts are properly cached

### Debug Mode

Enable debug mode in settings to see:
- Console logs for navigation
- API response details
- Performance metrics
- Error stack traces

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team**: For the amazing development platform
- **React Native Community**: For continuous improvements
- **Open Source Contributors**: For the libraries that make this possible
- **Political Data Sources**: For providing accessible civic information

## 📞 Support

For support, questions, or feedback:

- **Email**: lina@codefornonprofit.org
