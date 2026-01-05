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

**Firestore Rules (Production):**

The app uses production-ready security rules. See [firestore.rules](firestore.rules) for the complete ruleset.

Key rules:
- Users can read all authenticated user profiles
- Users can only modify their own profile
- All authenticated users can read pubs
- Only pub creators can modify/delete their pubs
- Users can only like/dislike/follow as themselves

To deploy:
1. Copy `firestore.rules` content
2. Go to Firebase Console → Firestore → Rules
3. Replace with production rules
4. Click Publish

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/pubs/{allPaths=**} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId;
    }
    match /profiles/{userId}/profile.jpg {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

See [FIRESTORE_RULES_DEPLOYMENT.md](FIRESTORE_RULES_DEPLOYMENT.md) for detailed deployment instructions.

### Step 4: Run the App

#### Using Expo Go (Quick Development)
```bash
npm start
```
Scan the QR code with Expo Go app on your phone.

#### Using Development Builds (Production-Ready)
Development builds are recommended for production apps and provide full native SDK access:

```bash
# One-time setup
npm install -g eas-cli
eas login

# Build development app
eas build --platform android --profile development --local

# Then run dev server
npm start
```

See [DEVELOPMENT_BUILDS.md](DEVELOPMENT_BUILDS.md) for complete guide including:
- Differences between Expo Go and dev builds
- Setting up builds for iOS/Android
- Build profiles (development, preview, production)
- Troubleshooting
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on your physical device

## Development Roadmap

- [x] Phase 0: Project Setup
- [x] Phase 1: Authentication
- [x] Phase 2: Add Pub Entry
- [x] Phase 3: Feed & Explore Display
- [x] Phase 4: Pub Detail View
- [x] Phase 5: Social Features (Follow, Like/Dislike)
- [x] Phase 6: User Profiles & Search
- [x] Phase 7: Production Security Rules
- [ ] Phase 8: Advanced Features & Polish
- [ ] Phase 9: Performance Optimization
- [ ] Phase 10: Deployment

## Features (Current)

### Core Features ✅
- Sign up / Sign in with email/password
- Add pub entries with photos, ratings, and details
- Rate pubs with:
  - 💷 Value for Money (1-5 £ symbols)
  - 🍺 Beer Quality (1-5 beer glass emojis)
  - 🥧 Food Quality (1-5 pie emojis, optional)
- View pubs in Instagram-style feed with photos and ratings
- Swipe through photos in feed cards
- Tap pub cards to view full details with all ratings
- Like/dislike pubs with 👍 and 👎 buttons
- Track like/dislike counts per pub
- Photo carousel on pub detail view with navigation

### Social & Profile Features ✅
- Follow/unfollow other users
- View follower and following counts
- User profiles with:
  - Profile picture (auto-generated avatar with initials if not uploaded)
  - Display name and bio
  - Follower/Following buttons with counts
  - Grid and list views of user's pub entries
- Search users by display name
- View other users' profiles and their pub history
- Like/dislike as a way to rate pubs

### User Profile Management ✅
- Upload custom profile picture
- Edit profile information (display name, bio)
- View your own profile with stats
- Delete profile picture

### Responsive Design ✅
- Mobile-optimized interface
- Tablet/desktop compatible layouts
- Responsive grid views for pub cards
- Adaptive photo carousel and controls

### Coming Soon 🚀
- Private profiles / blocking users
- In-app messaging
- Advanced search filters
- Push notifications
- Analytics dashboard
- Pub visit date tracking
- Location-based pub discovery

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

**Current Test Status:**
- 40/40 tests passing ✅
- TypeScript: 0 errors ✅
- Coverage: 55% firestore.ts, 7.82% overall

See [TESTING.md](TESTING.md) for detailed testing documentation.

## Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture and data models
- [FIRESTORE_RULES_DEPLOYMENT.md](FIRESTORE_RULES_DEPLOYMENT.md) - How to deploy security rules
- [FIRESTORE_RULES_DETAILED.md](FIRESTORE_RULES_DETAILED.md) - Detailed security rules documentation
- [FIRESTORE_RULES_QUICK_REFERENCE.md](FIRESTORE_RULES_QUICK_REFERENCE.md) - Quick reference for security rules
- [PRODUCTION_READINESS.md](PRODUCTION_READINESS.md) - Production deployment checklist
- [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md) - Feature roadmap and sprint planning
- [TESTING.md](TESTING.md) - Testing strategy and coverage

## License

Private project - Not for distribution
