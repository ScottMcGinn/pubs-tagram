# Pubs-tagram 🍺

An Instagram-style mobile app for tracking pubs you've visited, built with React Native and Firebase.

[![Unit Tests](https://github.com/ScottMcGinn/pubs-tagram/actions/workflows/test.yml/badge.svg)](https://github.com/ScottMcGinn/pubs-tagram/actions/workflows/test.yml)
[![Lint & Type Check](https://github.com/ScottMcGinn/pubs-tagram/actions/workflows/lint.yml/badge.svg)](https://github.com/ScottMcGinn/pubs-tagram/actions/workflows/lint.yml)

## Project Structure

```
pubs-tagram/
├── src/
│   ├── __tests__/       # Unit tests
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # Firebase services
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .github/
│   └── workflows/       # GitHub Actions CI/CD
├── assets/              # Images, fonts, etc.
├── App.tsx              # Root component
└── package.json         # Dependencies
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator

### Step 1: Install Dependencies

Open terminal in the `D:\Documents\pubs-tagram` folder and run:

```bash
npm install
```

### Step 2: Firebase Setup

1. Go to https://console.firebase.google.com/
2. Create a new project called "Pubs-tagram"
3. Add an iOS app and/or Android app
4. Download the config files:
   - iOS: `GoogleService-Info.plist` 
   - Android: `google-services.json`
5. Place these files in the project root directory

6. Enable Firebase services:
   - Authentication > Sign-in method > Email/Password (enable)
   - Firestore Database > Create database > Start in test mode
   - Storage > Get started > Start in test mode

### Step 3: Configure Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /pubs/{pubId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/pubs/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

### Step 4: Run the App

```bash
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your physical device

## Development Roadmap

- [x] Phase 0: Project Setup
- [ ] Phase 1: Authentication
- [ ] Phase 2: Add Pub Entry
- [ ] Phase 3: Feed Display
- [ ] Phase 4: Pub Detail View
- [ ] Phase 5: Delete Functionality
- [ ] Phase 6: Polish & Testing
- [ ] Phase 7: Deployment

## Features (MVP)

- Sign up / Sign in with email/password
- Add pub entries with:
  - Pub name
  - Location
  - What you had (optional)
  - Value for money (1-5 beer glass rating)
  - 1-5 photos
- View pubs in Instagram-style feed
- Swipe through photos
- View pub details
- Delete pub entries

## Tech Stack

- React Native (Expo)
- TypeScript
- Firebase (Auth, Firestore, Storage)
- React Navigation
- Jest (Unit Testing)

## CI/CD Pipeline

This project uses **GitHub Actions** to automatically run tests and lint checks on every push and pull request.

### Workflows

- **Unit Tests** (`.github/workflows/test.yml`)
  - Runs on Node.js 18.x and 20.x
  - Executes `npm test` with coverage
  - Uploads coverage reports to Codecov
  - Triggered on pushes to `main` and `develop` branches

- **Lint & Type Check** (`.github/workflows/lint.yml`)
  - TypeScript type checking
  - ESLint validation
  - Ensures code quality standards
  - Triggered on pushes and PRs

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

See [TESTING.md](TESTING.md) for detailed testing documentation.
- Expo Image Picker

## License

Private project - Not for distribution
