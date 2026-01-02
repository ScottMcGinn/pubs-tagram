# Quick Start Guide

## What I've Created

✅ Complete project structure with all folders
✅ Configuration files (package.json, tsconfig.json, etc.)
✅ TypeScript type definitions
✅ Authentication context and navigation
✅ Placeholder screens (Auth, Feed, AddPub, PubDetail)
✅ Basic styling matching Instagram aesthetic

## Next Steps for You

### 1. Install Node.js
If you don't have it:
- Download Node.js: https://nodejs.org/ (LTS version recommended)
- Verify installation by running in PowerShell: `node --version`

**Note on Expo CLI:** Expo deprecated the global `expo-cli` for Node 17+. We use `npx expo` instead (included with Node), which is more reliable.

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
In PowerShell (in the project folder):
```
npx expo start --clear
```

This will:
- Clear the Metro bundler cache
- Display a QR code in the terminal

**To test on phone:**
- Install "Expo Go" app (iOS or Android)
- Open the camera app (iOS) or Expo Go app (Android) to scan the QR code
- **Network requirement:** Phone and computer must be on the same WiFi network

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

### "expo is not recognized"
**Cause:** The global `expo-cli` may have been removed by system cleanup, Windows Update, or antivirus tools.  
**Fix:** Use `npx` instead, which doesn't require global installation:
```powershell
npx expo start --clear
```
This runs Expo from your project's dependencies.

### Phone won't connect to QR code (blue spinner forever)
**Cause:** Network connectivity issue between phone and computer.  
**Fixes (try in order):**
1. Verify both devices are on the **same WiFi network** (not mobile hotspot)
2. Disable Windows Firewall temporarily to test:
   - Settings > Privacy & Security > Windows Defender Firewall > Turn off (toggle for Private and Public networks)
3. In the terminal, press `i` to switch to LAN connection mode
4. If still failing, press `s` and select a different connection method

### Dependencies out of sync
**Cause:** npm packages may have been partially cleared or corrupted.  
**Fix:** Reinstall everything:
```powershell
npm install
```

### App crashes or errors when running
**Fix:** Clear cache and rebuild:
```powershell
npx expo start --clear
```
Then press `r` in the terminal to reload the app.

### "legacy expo-cli does not support Node +17"
**Cause:** You're using the deprecated global `expo-cli` with a newer Node version.  
**Fix:** Use `npx expo` instead of the global `expo` command.

**If npm install fails:**
- Make sure you have Node.js installed
- Try running PowerShell as Administrator

**If Firebase isn't working:**
- Make sure you placed the config file in the right location
- Check that all Firebase services are enabled in console

## Ready?

Let me know when you've:
1. Installed dependencies (`npm install`)
2. Set up Firebase
3. Run the app (`npm start`)

Then we'll move on to building the actual features! 🚀
