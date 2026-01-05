# Development Builds Guide

## Development Builds vs Expo Go

This project supports both **Expo Go** (quick prototyping) and **Development Builds** (production-ready development).

### Quick Comparison

| Feature | Expo Go | Dev Build |
|---------|---------|-----------|
| **Setup** | 5 minutes | 15-20 minutes |
| **Native Modules** | Fixed set only | Full SDK access |
| **Custom Code** | Limited | Full support |
| **Deep Linking** | Limited | Full support |
| **Permissions** | App permissions | Project-specific |
| **Production Ready** | ❌ No | ✅ Yes |
| **Build Time** | Instant | ~5-10 min |

### Which Should I Use?

**Use Expo Go if:**
- Just getting started with React Native
- Prototyping quick features
- All features work within Expo's sandbox

**Use Development Builds if:**
- Building production app (recommended)
- Need deep linking
- Using custom native modules
- Need app-specific permissions
- Multiple developers (different bundle IDs)

---

## Getting Started with Development Builds

### Prerequisites

- Node.js 16+ with npm/yarn
- EAS CLI: `npm install -g eas-cli`
- Expo account: https://expo.dev/ (free)
- iOS: Mac with Xcode, or Apple Developer account
- Android: Android Studio or SDK

### Step 1: Authenticate with EAS

```bash
eas login
# Follow prompts to log in with Expo account
```

### Step 2: Create Development Build Locally

This installs the Expo dev client and generates native code:

```bash
# For iOS (requires Mac with Xcode)
eas build --platform ios --profile development --local

# For Android
eas build --platform android --profile development --local
```

**What this does:**
- Generates native folders (`ios/` and `android/`)
- Installs Expo dev client
- Creates debug build for your simulator/emulator
- Skips sending to EAS servers (stays local)

### Step 3: Run on Device/Emulator

```bash
# Start dev server
npm start

# Then scan QR code or select from menu
# i - iOS simulator
# a - Android emulator
```

---

## Development Build Variants

This project uses **variant bundle IDs** to support multiple builds:

### Bundle ID Convention

```
com.pubstagram.app       # Production release build
com.pubstagram.app.dev   # Development/test builds
```

### Why Variants?

You can install **both** production and development versions on the same device:
- Production: Live version from app store
- Development: Local development version
- No conflicts or overwrites

### Switching Variants

Development and production are configured in `eas.json`:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
      // Uses: com.pubstagram.app.dev
    },
    "production": {
      "autoIncrement": true
      // Uses: com.pubstagram.app
    }
  }
}
```

---

## Building for Different Scenarios

### Local Development (Recommended for Dev)

Build and test locally on your machine:

```bash
# Generate native files and install dev client
eas build --platform android --profile development --local

# Or preview the local build
eas build --platform android --profile preview --local
```

**Benefits:**
- Fast iteration (5-10 min builds)
- No uploading to EAS servers
- Stays on your machine
- Perfect for day-to-day development

### Internal Testing (Team Testing)

Build on EAS servers for team testing:

```bash
# Create shareable internal build
eas build --platform ios --profile development
eas build --platform android --profile development

# Share link: eas build list
# Send QR code to team members
```

**Benefits:**
- Share builds without sharing code
- Works on any machine
- Automatic distribution
- Full build configuration

### Production Build

For app store releases:

```bash
# iOS App Store
eas build --platform ios --profile production

# Google Play Store
eas build --platform android --profile production
```

---

## Workflow: Transitioning from Expo Go

### Current State (Expo Go)

If you're currently using Expo Go:

```bash
# Running on Expo Go
npm start
# Scan QR code with Expo Go app
```

### Step 1: Create Dev Build

```bash
# Create development build with dev client
eas build --platform android --profile development --local
```

### Step 2: Install Dev Client

The build will generate native code and install automatically:
- Android: Creates APK/AAB with Expo dev client
- iOS: Creates IPA with Expo dev client

### Step 3: Run Development Server

```bash
# Start dev server (same as before)
npm start

# This time, open in dev client instead of Expo Go
```

### Key Difference

| Step | Expo Go | Dev Build |
|------|---------|-----------|
| 1 | `npm start` | `npm start` |
| 2 | Launch Expo Go app | Launch Dev Client app |
| 3 | Scan QR code | Scan QR code |
| 4 | Limited features | Full SDK access |

---

## Local Development Client Setup

### One-Time Setup

```bash
# 1. Install dev client npm package
npx expo install expo-dev-client

# 2. Prebuild to generate native files
npx expo prebuild --clean

# 3. Build native app with dev client
# iOS (Mac only)
npx expo run:ios

# Android
npx expo run:android
```

### Day-to-Day Development

Once set up, just use the normal dev server:

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Or scan QR code on physical device

### File Structure After Prebuild

```
pubs-tagram/
├── ios/                    # Native iOS code (generated)
├── android/                # Native Android code (generated)
├── app/                    # Expo Router
├── src/                    # TypeScript source
└── app.json               # Config (dont edit native folders!)
```

**Important:** Don't commit `ios/` and `android/` folders (they're in `.gitignore`)

---

## Troubleshooting

### Build Fails Locally

```bash
# Clear cache and rebuild
eas build --platform android --profile development --local --clear-cache

# Or clean and prebuild manually
npx expo prebuild --clean
```

### Device/Emulator Not Showing in Menu

```bash
# Restart development server
npm start

# If still not showing, check:
# - USB debugging enabled (Android)
# - Device on same Wi-Fi as computer
# - Device can reach development server (firewall)
```

### Deep Linking Not Working

```bash
# Ensure configured in App.tsx linking object
# Test with URI scheme:
# iOS: xcrun simctl openurl booted "pubstagram://feed"
# Android: adb shell am start -a android.intent.action.VIEW -d "pubstagram://feed"
```

### App Won't Update Code Changes

```bash
# Clear Metro bundler cache
npm start --reset-cache

# Or full reset
watchman watch-del-all
rm -rf node_modules
npm install
npm start
```

### Can't Connect to Dev Server

```bash
# Check firewall - dev server needs port 8081
# On Windows:
netstat -ano | findstr :8081

# Get computer IP and manually type in dev menu:
# Settings > Dev server URL > [your-ip]:8081
```

---

## Advanced: Custom Native Code

If you need native modules beyond Expo's SDK:

### Option 1: Expo Modules API (Recommended)

Create local Expo modules without ejecting:

```bash
npx create-expo-module modules/my-module
```

Then use in app.json:

```json
{
  "plugins": [
    "./modules/my-module"
  ]
}
```

### Option 2: Config Plugins

Extend existing plugins to customize native build:

```json
{
  "plugins": [
    [
      "expo-image-picker",
      {
        "photosPermission": "Allow custom message"
      }
    ]
  ]
}
```

### Option 3: Custom Native Code

Modify native files after prebuild:

```bash
# Generate native code
npx expo prebuild --clean

# Edit native files directly:
# ios/ - Xcode projects
# android/ - Android Studio projects

# Rebuild
eas build --platform ios --profile development
```

---

## Best Practices

### 1. Use Variants for Different Environments

```bash
# Development on your machine
eas build --profile development

# Testing/staging for team
eas build --profile preview

# Production for app stores
eas build --profile production
```

### 2. Keep Dependencies Updated

```bash
# Regularly check for updates
npx expo-cli@latest

# Update Expo SDK when ready
npx expo@latest upgrade

# Update all packages
npx expo install
```

### 3. Use Prebuild Strategically

```bash
# Full clean rebuild when:
# - Updating major SDK version
# - Adding native plugins
# - Modifying app.json config
npx expo prebuild --clean

# Quick rebuild during dev:
# - Code changes only
npx expo run:android
```

### 4. CI/CD Integration

Configure GitHub Actions to build automatically:

```yaml
# .github/workflows/build.yml
- name: Build APK
  run: eas build --platform android --profile development
```

### 5. Testing Updates

Always test development builds before production:

```bash
# Test dev variant first
eas build --platform android --profile development

# After testing, build production
eas build --platform android --profile production
```

---

## Development Build vs Continuous Native Generation

**Development Builds** (this guide):
- You build native apps with dev client
- Local or cloud builds via EAS
- Run app on device like normal app
- Full SDK access and native modules

**Continuous Native Generation** (See BUILD_PROCESS.md):
- Native folders auto-generated from config
- Not tracked in git
- Configuration-driven
- All changes via app.json and plugins

**They work together:**
- CNG generates native folders from config ✓
- Dev builds use those native folders ✓
- You never manually edit native code ✓

---

## Related Documentation

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [App Configuration](https://docs.expo.dev/workflow/configuration/)
- [Development Client](https://docs.expo.dev/clients/introduction/)

## Quick Reference Commands

```bash
# Initial setup
npm install
eas login

# Create dev build locally
eas build --platform android --profile development --local

# Daily development
npm start

# Building for different environments
eas build --profile development   # Dev
eas build --profile preview       # Testing
eas build --profile production    # Release

# Cleanup and rebuild
npx expo prebuild --clean
npx expo install
```
