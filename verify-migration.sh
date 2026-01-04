#!/bin/bash
# Verification script for React Native Firebase migration

echo "=== React Native Firebase Migration Verification ==="
echo ""

echo "1. Checking TypeScript compilation..."
npx tsc --noEmit 2>&1 | grep -c "error" > /tmp/ts_errors.txt
ts_errors=$(cat /tmp/ts_errors.txt)
if [ "$ts_errors" -eq "0" ]; then
    echo "   ✅ TypeScript compiles without errors"
else
    echo "   ❌ TypeScript has $ts_errors errors - please fix before building"
    npx tsc --noEmit
fi
echo ""

echo "2. Checking for React Native Firebase imports..."
if grep -q "@react-native-firebase" src/services/firebase.ts; then
    echo "   ✅ firebase.ts imports React Native Firebase"
else
    echo "   ❌ firebase.ts missing React Native Firebase imports"
fi

if grep -q "@react-native-firebase/auth" src/contexts/AuthContext.tsx; then
    echo "   ✅ AuthContext.tsx imports React Native Firebase auth"
else
    echo "   ❌ AuthContext.tsx missing React Native Firebase imports"
fi

if grep -q "@react-native-firebase/firestore" src/services/firestore.ts; then
    echo "   ✅ firestore.ts imports React Native Firebase firestore"
else
    echo "   ❌ firestore.ts missing React Native Firebase imports"
fi

if grep -q "@react-native-firebase/storage" src/services/storage.ts; then
    echo "   ✅ storage.ts imports React Native Firebase storage"
else
    echo "   ❌ storage.ts missing React Native Firebase imports"
fi
echo ""

echo "3. Checking package.json..."
if grep -q "@react-native-firebase/app" package.json; then
    echo "   ✅ @react-native-firebase/app installed"
else
    echo "   ❌ @react-native-firebase/app not found in package.json"
fi

if grep -q "@react-native-firebase/auth" package.json; then
    echo "   ✅ @react-native-firebase/auth installed"
else
    echo "   ❌ @react-native-firebase/auth not found in package.json"
fi

if grep -q "@react-native-firebase/firestore" package.json; then
    echo "   ✅ @react-native-firebase/firestore installed"
else
    echo "   ❌ @react-native-firebase/firestore not found in package.json"
fi

if grep -q "@react-native-firebase/storage" package.json; then
    echo "   ✅ @react-native-firebase/storage installed"
else
    echo "   ❌ @react-native-firebase/storage not found in package.json"
fi
echo ""

echo "4. Checking app.json for Firebase plugins..."
if grep -q "@react-native-firebase/app" app.json; then
    echo "   ✅ Firebase plugins added to app.json"
else
    echo "   ❌ Firebase plugins not found in app.json"
fi
echo ""

echo "5. Checking google-services.json..."
if [ -f "google-services.json" ]; then
    echo "   ✅ google-services.json exists"
    if grep -q "com.pubstagram.app" google-services.json; then
        echo "   ✅ google-services.json contains correct package name"
    else
        echo "   ⚠️  google-services.json package name should be com.pubstagram.app"
    fi
else
    echo "   ❌ google-services.json not found"
fi
echo ""

echo "6. Checking .env.local..."
if [ -f ".env.local" ]; then
    echo "   ✅ .env.local exists"
    if grep -q "EXPO_PUBLIC_FIREBASE_API_KEY" .env.local; then
        echo "   ✅ .env.local has EXPO_PUBLIC_FIREBASE_API_KEY"
    else
        echo "   ❌ .env.local missing EXPO_PUBLIC_FIREBASE_API_KEY"
    fi
else
    echo "   ❌ .env.local not found"
fi
echo ""

echo "7. Checking eas.json..."
if [ -f "eas.json" ]; then
    echo "   ✅ eas.json exists"
    if grep -q "EXPO_PUBLIC_FIREBASE" eas.json; then
        echo "   ✅ eas.json has Firebase environment variable mappings"
    else
        echo "   ⚠️  eas.json may be missing Firebase environment variable mappings"
    fi
else
    echo "   ❌ eas.json not found"
fi
echo ""

echo "=== Verification Complete ==="
echo ""
echo "Ready to build? Run:"
echo "  eas build --platform android --profile preview"
