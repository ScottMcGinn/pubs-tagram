# Build and Deploy Instructions

## Pre-Build Checklist

- [x] All TypeScript compiles without errors
- [x] React Native Firebase packages installed
- [x] google-services.json created with Android credentials
- [x] app.json updated with Firebase plugins
- [x] eas.json has correct env mappings
- [x] .env.local has correct Firebase credentials
- [x] EAS secrets are set in EAS Dashboard

## Step 1: Verify EAS Setup

Ensure your EAS build profile is configured correctly:

```bash
eas build --platform android --profile preview --dry-run
```

This will show you the configuration that will be used without actually building.

## Step 2: Build APK

```bash
eas build --platform android --profile preview
```

The build will:
1. Install npm dependencies
2. Run EAS build system
3. Inject environment variables from EAS secrets
4. Copy google-services.json to android/app/
5. Add Firebase plugin to Gradle configuration
6. Compile Java/Kotlin code
7. Generate APK file

**Build time**: Usually 5-10 minutes

## Step 3: Download APK

After the build succeeds:
1. Check the EAS Build dashboard
2. Download the APK file to your local machine
3. Or directly install to device via adb:

```bash
adb install path/to/app-release.apk
```

## Step 4: Install on Device

### Option A: USB Cable (Recommended)
```bash
# If adb is in your PATH
adb install app-release.apk

# Or with absolute path
"C:\Android\Sdk\platform-tools\adb.exe" install app-release.apk
```

### Option B: Manual Installation
1. Transfer APK to device (email, cloud storage, etc.)
2. Open file manager on device
3. Tap APK to install
4. Grant permissions

## Step 5: Launch App and Test

1. **Allow permissions** when prompted
2. **Sign up** with email (creates Firestore user document)
3. **Navigate to Add Pub** screen
4. **Take a photo** (tests camera access)
5. **Fill out form** and **submit**
6. **Check Feed** to see the pub appears (Firestore read)
7. **Try liking/disliking** (Firestore subcollection write)
8. **Delete a pub** (Firestore delete + Storage delete)

## Expected Behavior

✅ **If working**:
- App loads without crashes
- Can log in/sign up
- Can create pubs with photos
- Photos are visible in feed
- Can navigate between screens
- Can like/dislike pubs
- Can delete pubs

❌ **If issues occur**:

### Issue: App crashes on startup
- Check: Logcat output with `adb logcat | grep Firebase`
- Look for: `FirebaseError`, `auth/invalid-api-key`, etc.
- Solution: Verify google-services.json was included in APK

### Issue: "Invalid API Key" error
- Check: Android API key restrictions in Firebase Console
- Check: SHA-1 fingerprint matches (57:8C:5A:2D:A6:7C:7D:62:2F:BE:32:D6:93:C2:A2:CD:48:AD:1E:12)
- Check: Android app is registered in Firebase Console

### Issue: Cannot write to Firestore
- Check: Firestore rules allow authenticated users to write
- Check: User is actually authenticated (check Auth tab)
- Solution: Temporarily open Firestore to all for testing:
  ```
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /{document=**} {
        allow read, write: if request.auth != null;
      }
    }
  }
  ```

### Issue: Photo upload fails
- Check: Storage rules allow authenticated users to write
- Check: Storage rules allow `.jpg` files
- Check: Device has internet access

## Debugging with ADB

### View real-time logs
```bash
adb logcat | grep -i firebase
```

### View all logs
```bash
adb logcat
```

### Get device shell
```bash
adb shell
```

### View app data
```bash
adb shell am dump-heap com.pubstagram.app /data/local/tmp/heap.bin
```

## Rollback If Needed

If the APK has critical issues:

1. Uninstall the problematic APK:
```bash
adb uninstall com.pubstagram.app
```

2. The user's Firestore data is safe (it's in the cloud)

3. Deploy a new APK after fixing:
```bash
eas build --platform android --profile preview
```

## Success Indicators

After building and testing, you should see:

1. **User document in Firestore** under `users/{uid}` with:
   - displayName
   - email
   - createdAt timestamp
   - isPublic: true

2. **Pub documents in Firestore** under `pubs/{pubId}` with:
   - userId, pubName, location
   - Photos and thumbnails as array URLs
   - Rating values (beerQuality, valueForMoney, etc.)
   - createdAt/updatedAt timestamps

3. **Images in Cloud Storage** at:
   - `users/{userId}/pubs/{pubId}/photo0.jpg`
   - `users/{userId}/pubs/{pubId}/thumb0.jpg`
   - etc. for multiple photos

4. **Firestore subcollections** for likes/dislikes:
   - `pubs/{pubId}/likes/{userId}`
   - `pubs/{pubId}/dislikes/{userId}`

## Performance Notes

- First load may take 10-15 seconds while Firebase initializes
- Photo uploads depend on network speed
- Firestore queries are cached locally by React Native Firebase SDK
- Offline mode will be supported automatically by RN Firebase

## Next Steps After Successful Build

1. **Test all core features** as listed above
2. **Gather user feedback** from beta testers
3. **Monitor Firestore usage** in Firebase Console
4. **Check error logs** in Firebase Console for any issues
5. **Deploy to Play Store** when ready for public release
