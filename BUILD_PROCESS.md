# Build Process & Development Workflow

## Continuous Native Generation (CNG)

This project uses **Continuous Native Generation** for streamlined development and builds.

### What is CNG?

CNG means the `android/` and `ios/` native folders are **not tracked in git** and are automatically generated when needed. This keeps the repository clean and ensures consistency across environments.

### How It Works

1. **Native folders are gitignored** - `android/` and `ios/` are in `.gitignore`
2. **Configuration via files** - All native settings are configured through:
   - `app.json` - App metadata, plugins, permissions
   - `eas.json` - EAS build configuration
   - Config plugins - Defined in `app.json` plugins array
3. **Regeneration on build** - Native folders regenerate automatically when you:
   - Run `eas build`
   - Run `npx expo prebuild`

### Benefits

✅ Cleaner git history - No massive native build files  
✅ Easier collaboration - Fewer merge conflicts  
✅ Consistent environment - Everyone regenerates from same config  
✅ Future-proof - Native code generated from current Expo SDK  

### Configuration

All native customization is done through:

#### EAS Build Configuration (eas.json)
Each build profile explicitly runs `npx expo prebuild --clean` to ensure native folders are always freshly generated:
```json
{
  "build": {
    "development": {
      "prebuildCommand": "npx expo prebuild --clean"
    }
  }
}
```

#### Plugins (app.json)
```json
{
  "expo": {
    "plugins": [
      ["expo-image-picker", { /* config */ }],
      ["expo-updates"],
      ["expo-router"]
    ]
  }
}
```

#### Build Configuration (eas.json)
```json
{
  "build": {
    "development": { /* dev build settings */ },
    "production": { /* prod build settings */ }
  }
}
```

### Regenerating Native Folders

If you ever need to regenerate or inspect the native code:

```bash
# Prebuild native folders locally
npx expo prebuild

# Prebuild and clean first
npx expo prebuild --clean
```

### What NOT to Do

❌ Don't manually modify `android/` or `ios/` files in git  
❌ Don't commit native folders to git  
❌ Don't edit native code outside of:
   - Config plugins in `app.json`
   - Custom Expo modules
   - EAS build configuration

### Custom Native Code

If you need to add custom native code:

1. **Use Expo Modules API** - Create local modules under `modules/`
2. **Use Config Plugins** - Extend existing plugins via plugins in `app.json`
3. **Use EAS** - Submit native code through EAS for building

See [Expo Modules Documentation](https://docs.expo.dev/modules/overview/) for details.

---

## Installing Dependencies

### Using `npx expo install`

Always install Expo packages using `npx expo install` instead of `npm install`:

```bash
# ✅ CORRECT - Uses SDK-compatible versions
npx expo install expo-image-picker

# ❌ WRONG - May install incompatible latest version
npm install expo-image-picker
```

### Why?

- `npx expo install` checks your SDK version and installs compatible packages
- Prevents version conflicts that break at runtime
- Ensures all packages work together

### Examples

```bash
# Install a new Expo package
npx expo install expo-av

# Install an update
npx expo install expo-image-picker@latest

# Install multiple
npx expo install expo-file-system expo-document-picker
```

### Dependency Audit

All dependencies in this project are installed with compatible versions for SDK 54.

**Current dependencies** compatible with Expo SDK 54:
- `@react-navigation/*` - Tab and Stack navigation
- `expo-image-picker` - Image selection
- `expo-image-manipulator` - Image editing
- `expo-router` - File-based routing
- `expo-updates` - Over-the-air updates
- And more...

---

## Development Workflow

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Run on device/emulator**
   ```bash
   # iOS
   npm run ios
   
   # Android
   npm run android
   ```

### Building

#### Development Build (with dev client)
```bash
eas build --platform ios --profile development
eas build --platform android --profile development
```

#### Production Build (for app stores)
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
```

#### Preview Build
```bash
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

### Update Management

#### Check for Updates
- Manual button in Profile screen
- Automatic checks on app startup and every 60 minutes
- Updates are fetched but not applied until user confirms

#### Apply Updates
- Users see "Update Available" prompt
- Can skip or update immediately
- App reloads with new version

---

## Tips & Best Practices

### 1. Keep Configuration Updated
- Update plugins in `app.json` when dependencies change
- Keep `eas.json` sync'd with build requirements
- Document any custom config in comments

### 2. Use Proper Commands
- `npx expo install` for Expo packages
- `npm install` for non-Expo packages
- Always use same package manager (`npm` or `yarn`)

### 3. Prebuild When Needed
- Prebuild locally to test native changes
- Always clean prebuild when updating major SDK versions
- Commit `eas.json` and `app.json`, not native folders

### 4. Version Management
- App version in `app.json` (semantic versioning)
- Build version auto-increments in production
- Development builds use separate bundle IDs (`.dev` suffix)

### 5. Deep Linking
- Configured in `App.tsx` with Expo Router
- Routes automatically created from file structure
- URIs: `pubstagram://` or `exp://` schemes

---

## Troubleshooting

### Native Folder Out of Sync
```bash
# Regenerate native folders
npx expo prebuild --clean
```

### Package Not Found
```bash
# Remove and reinstall with correct version
npm uninstall expo-package-name
npx expo install expo-package-name
```

### Build Fails Due to Permissions
- Ensure all permissions in `app.json` match actual usage
- Run `npx expo prebuild --clean` and rebuild

### Deep Linking Not Working
- Verify URL scheme in `app.json`
- Check `App.tsx` linking configuration
- Test with: `xcrun simctl openurl booted "pubstagram://feed"`

---

## Related Documentation

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [App Configuration Reference](https://docs.expo.dev/workflow/configuration/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
