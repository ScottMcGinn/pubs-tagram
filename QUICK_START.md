# Quick Start Guide

## What I've Created

✅ Complete project structure with all folders
✅ Configuration files (package.json, tsconfig.json, etc.)
✅ TypeScript type definitions
✅ Authentication context and navigation
✅ Placeholder screens (Auth, Feed, AddPub, PubDetail)
✅ Basic styling matching Instagram aesthetic

## Next Steps for You

### 1. Install Node.js and Expo CLI
If you don't have them:
- Download Node.js: https://nodejs.org/ (LTS version)
- After Node is installed, open Command Prompt and run:
  ```
  npm install -g expo-cli
  ```

### 2. Install Project Dependencies
Open Command Prompt, navigate to the project folder:
```
cd D:\Documents\pubs-tagram
npm install
```

This will take a few minutes to download all dependencies.

### 3. Set Up Firebase

#### Create Firebase Project:
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "Pubs-tagram"
4. Follow the wizard (disable Google Analytics for now)

#### Add Apps to Firebase:
1. Click the gear icon > Project settings
2. Click "Add app" > iOS (if you have a Mac) or Android
3. Register app with package name: `com.pubstagram.app`
4. Download config file:
   - iOS: `GoogleService-Info.plist`
   - Android: `google-services.json`
5. Place this file in `D:\Documents\pubs-tagram\`

#### Enable Firebase Services:
1. **Authentication:**
   - Left menu > Authentication > Get started
   - Sign-in method tab > Email/Password > Enable > Save

2. **Firestore Database:**
   - Left menu > Firestore Database > Create database
   - Start in test mode > Next
   - Choose a location > Enable

3. **Storage:**
   - Left menu > Storage > Get started
   - Start in test mode > Next > Done

### 4. Run the App
In Command Prompt (still in project folder):
```
npm start
```

This will open Expo DevTools in your browser.

**To test on phone:**
- Install "Expo Go" app on your iPhone or Android
- Scan the QR code shown in terminal/browser

**To test on computer:**
- Press `i` for iOS Simulator (Mac only)
- Press `a` for Android Emulator (need Android Studio)
- Press `w` for web browser

### 5. Test Authentication
Once the app is running:
1. You should see the Auth screen with the beer emoji 🍺
2. Try creating an account with any email/password
3. You should be taken to the Feed screen (currently empty)

## What Works Right Now

✅ Authentication (Sign Up / Sign In / Sign Out)
✅ Basic navigation between screens
✅ Empty Feed screen with + button
✅ Placeholder Add Pub and Detail screens

## What's Next

Once you confirm everything is running, we'll build:
1. The Add Pub screen (photo picker, form)
2. The Feed display (showing actual pub entries)
3. The Detail view
4. Delete functionality

## Troubleshooting

**If npm install fails:**
- Make sure you have Node.js installed
- Try running Command Prompt as Administrator

**If Firebase isn't working:**
- Make sure you placed the config file in the right location
- Check that all Firebase services are enabled in console

**If app won't start:**
- Make sure no other apps are using port 19000
- Try `npm start -- --clear` to clear cache

## Ready?

Let me know when you've:
1. Installed dependencies (`npm install`)
2. Set up Firebase
3. Run the app (`npm start`)

Then we'll move on to building the actual features! 🚀
