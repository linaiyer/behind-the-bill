# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Native Expo app called "Behind the Bill" that helps users understand legislative bills and their potential impacts. The app features bill discovery, impact simulation, and AI-powered chat functionality to explain legislation in accessible terms.

## Key Development Commands

```bash
# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

## Architecture

### Core Structure
- **App.tsx**: Main entry point with font loading and navigation setup
- **src/navigation/AppNavigator.tsx**: Stack navigator managing app routing
- **src/screens/**: Main application screens (Welcome, Home, Chat, Simulator, Survey)
- **src/types/index.ts**: TypeScript interfaces for Bill, User, ChatMessage, and SimulationResult
- **src/utils/newsApi.ts**: External API integration utilities

### Navigation Flow
The app uses React Navigation v7 with a stack navigator. Current flow: Welcome → Home screen with planned integration for Survey and other screens.

### Key Dependencies
- **Expo SDK 53**: Core platform framework
- **React Navigation**: Navigation between screens
- **NativeWind**: Tailwind CSS styling for React Native
- **Work Sans Font**: Custom typography via @expo-google-fonts
- **TypeScript**: Strict typing enabled

### Styling System
Uses NativeWind (Tailwind for React Native) with a custom theme defined in tsconfig.json:
- Primary color: #008080 (teal)
- Text colors: #111111 (primary), #6B6B6B (secondary)
- Background: #FFFFFF
- Font family: Work Sans (400, 500, 600, 700 weights)

### Data Models
Core types defined in src/types/index.ts:
- **Bill**: Legislative bill data with status, sponsor, impact areas
- **User**: User profile with interests and preferences
- **ChatMessage**: Chat interface for bill discussions
- **SimulationResult**: Impact simulation outcomes

The app appears to be designed around helping users understand complex legislation through interactive features and personalized impact analysis.