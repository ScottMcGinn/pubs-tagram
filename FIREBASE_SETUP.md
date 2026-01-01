# Firebase Setup Guide

## Step 1: Get Your Firebase Config

1. Go to https://console.firebase.google.com/
2. Click on your "Pubs-tagram" project (or create it if you haven't)
3. Click the gear icon ⚙️ next to "Project Overview" > Project settings
4. Scroll down to "Your apps" section
5. Click the **Web app** button `</>`
6. Register app with nickname "Pubs-tagram Web"
7. **COPY the firebaseConfig object** - it looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "pubs-tagram-xxxxx.firebaseapp.com",
  projectId: "pubs-tagram-xxxxx",
  storageBucket: "pubs-tagram-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef..."
};
```

## Step 2: Update Firebase Config File

1. Open `D:\Documents\pubs-tagram\src\services\firebase.ts`
2. Replace the placeholder config with YOUR actual config values
3. Save the file

## Step 3: Enable Firebase Services

### Authentication:
1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Click "Sign-in method" tab
4. Click "Email/Password"
5. Enable it and click "Save"

### Firestore:
1. Go to Firestore Database
2. Click "Create database"
3. Select "Start in test mode"
4. Choose your location (closest to you)
5. Click "Enable"

### Storage:
1. Go to Storage
2. Click "Get started"
3. Select "Start in test mode"
4. Click "Next" then "Done"

## Step 4: Reinstall Dependencies

In Command Prompt:

```bash
cd D:\Documents\pubs-tagram
npm install
```

## Step 5: Start the App

```bash
npx expo start --clear
```

Then scan the QR code with Expo Go app on your phone.

## Troubleshooting

**Still getting 500 error?**
- Make sure you updated the firebase.ts file with YOUR config
- Make sure you enabled Authentication in Firebase Console
- Try stopping the app (Ctrl+C) and running `npx expo start --clear` again

**Can't find firebase.ts?**
- It's in `D:\Documents\pubs-tagram\src\services\firebase.ts`
- Open it in VS Code

Let me know when you've updated the Firebase config and we'll test it!
