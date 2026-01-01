# Pubs-tagram 🍺

An Instagram-style mobile app for tracking pubs you've visited, built with React Native and Firebase.

## Project Structure

```
pubs-tagram/
├── src/
│   ├── components/      # Reusable UI components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── services/        # Firebase services
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
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
- Expo Image Picker

## License

Private project - Not for distribution
