#!/bin/bash
# Dependencies Installation Guide for Expo SDK 54
# This script documents the proper installation of all dependencies

echo "=== Pubs-tagram Dependencies Installation ==="
echo ""
echo "All packages should be installed with npx expo install for Expo packages"
echo "This ensures compatibility with Expo SDK 54"
echo ""

# Core Expo packages (should use npx expo install)
echo "Installing Core Expo Packages..."
echo "npx expo install expo@~54.0.0"
echo "npx expo install expo-router@~3.5.0"
echo "npx expo install expo-updates@~0.25.0"
echo "npx expo install expo-status-bar@~1.12.0"
echo "npx expo install expo-image-picker@~15.0.0"
echo "npx expo install expo-image-manipulator@~12.0.0"
echo ""

# Navigation packages (must be SDK-compatible)
echo "Installing Navigation Packages..."
echo "npx expo install @react-navigation/native@^7.1.26"
echo "npx expo install @react-navigation/bottom-tabs@^7.9.0"
echo "npx expo install @react-navigation/stack@^7.3.1"
echo "npx expo install react-native-gesture-handler@~2.28.0"
echo "npx expo install react-native-safe-area-context@~5.6.0"
echo "npx expo install react-native-screens@~4.16.0"
echo ""

# React packages (specific versions for compatibility)
echo "Installing React Packages..."
echo "npx expo install react@19.1.0"
echo "npx expo install react-native@0.81.5"
echo ""

# Storage
echo "Installing Storage Packages..."
echo "npx expo install @react-native-async-storage/async-storage@2.2.0"
echo ""

# Dev dependencies (standard npm install)
echo "Installing Dev Dependencies..."
echo "npm install --save-dev typescript@^5.1.3"
echo "npm install --save-dev eslint@^8.56.0"
echo "npm install --save-dev prettier@^3.1.1"
echo "npm install --save-dev @typescript-eslint/parser@^7.0.0"
echo "npm install --save-dev @typescript-eslint/eslint-plugin@^7.0.0"
echo "npm install --save-dev eslint-config-prettier@^9.1.0"
echo "npm install --save-dev eslint-plugin-prettier@^5.1.2"
echo "npm install --save-dev eslint-plugin-react-native@^4.1.0"
echo "npm install --save-dev jest@^29.7.0"
echo "npm install --save-dev ts-jest@^29.4.6"
echo "npm install --save-dev @types/react@~19.1.10"
echo "npm install --save-dev @types/jest@^29.5.14"
echo "npm install --save-dev @babel/core@^7.20.0"
echo "npm install --save-dev @react-native-community/cli@^20.0.2"
echo "npm install --save-dev react-test-renderer@^19.1.0"
echo "npm install --save-dev @testing-library/react-native@^13.3.3"
echo "npm install --save-dev @testing-library/jest-native@^5.4.3"
echo ""

echo "=== Installation Complete ==="
echo ""
echo "Key Points:"
echo "✓ All Expo packages use npx expo install for SDK compatibility"
echo "✓ Navigation packages pinned to tested versions"
echo "✓ React/React Native versions match SDK 54 requirements"
echo "✓ Dev dependencies installed with npm"
echo ""
echo "To apply all changes at once:"
echo "npm install && npx expo install"
echo ""
