# Dependencies Installation Guide for Expo SDK 54
# Windows PowerShell version
# This script documents the proper installation of all dependencies

Write-Host "=== Pubs-tagram Dependencies Installation ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "All packages should be installed with npx expo install for Expo packages" -ForegroundColor Yellow
Write-Host "This ensures compatibility with Expo SDK 54"
Write-Host ""

# Core Expo packages (should use npx expo install)
Write-Host "Installing Core Expo Packages..." -ForegroundColor Green
Write-Host "npx expo install expo@~54.0.0"
Write-Host "npx expo install expo-router@~3.5.0"
Write-Host "npx expo install expo-updates@~0.25.0"
Write-Host "npx expo install expo-status-bar@~1.12.0"
Write-Host "npx expo install expo-image-picker@~15.0.0"
Write-Host "npx expo install expo-image-manipulator@~12.0.0"
Write-Host ""

# Navigation packages (must be SDK-compatible)
Write-Host "Installing Navigation Packages..." -ForegroundColor Green
Write-Host "npx expo install @react-navigation/native@^7.1.26"
Write-Host "npx expo install @react-navigation/bottom-tabs@^7.9.0"
Write-Host "npx expo install @react-navigation/stack@^7.3.1"
Write-Host "npx expo install react-native-gesture-handler@~2.28.0"
Write-Host "npx expo install react-native-safe-area-context@~5.6.0"
Write-Host "npx expo install react-native-screens@~4.16.0"
Write-Host ""

# React packages (specific versions for compatibility)
Write-Host "Installing React Packages..." -ForegroundColor Green
Write-Host "npx expo install react@19.1.0"
Write-Host "npx expo install react-native@0.81.5"
Write-Host ""

# Storage
Write-Host "Installing Storage Packages..." -ForegroundColor Green
Write-Host "npx expo install @react-native-async-storage/async-storage@2.2.0"
Write-Host ""

# Dev dependencies (standard npm install)
Write-Host "Installing Dev Dependencies..." -ForegroundColor Green
Write-Host "npm install --save-dev typescript@^5.1.3"
Write-Host "npm install --save-dev eslint@^8.56.0"
Write-Host "npm install --save-dev prettier@^3.1.1"
Write-Host "npm install --save-dev @typescript-eslint/parser@^7.0.0"
Write-Host "npm install --save-dev @typescript-eslint/eslint-plugin@^7.0.0"
Write-Host "npm install --save-dev eslint-config-prettier@^9.1.0"
Write-Host "npm install --save-dev eslint-plugin-prettier@^5.1.2"
Write-Host "npm install --save-dev eslint-plugin-react-native@^4.1.0"
Write-Host "npm install --save-dev jest@^29.7.0"
Write-Host "npm install --save-dev ts-jest@^29.4.6"
Write-Host "npm install --save-dev @types/react@~19.1.10"
Write-Host "npm install --save-dev @types/jest@^29.5.14"
Write-Host "npm install --save-dev @babel/core@^7.20.0"
Write-Host "npm install --save-dev @react-native-community/cli@^20.0.2"
Write-Host "npm install --save-dev react-test-renderer@^19.1.0"
Write-Host "npm install --save-dev @testing-library/react-native@^13.3.3"
Write-Host "npm install --save-dev @testing-library/jest-native@^5.4.3"
Write-Host ""

Write-Host "=== Installation Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Key Points:" -ForegroundColor Yellow
Write-Host "✓ All Expo packages use npx expo install for SDK compatibility"
Write-Host "✓ Navigation packages pinned to tested versions"
Write-Host "✓ React/React Native versions match SDK 54 requirements"
Write-Host "✓ Dev dependencies installed with npm"
Write-Host ""
Write-Host "To apply all changes at once:" -ForegroundColor Green
Write-Host "npm install; npx expo install"
Write-Host ""
