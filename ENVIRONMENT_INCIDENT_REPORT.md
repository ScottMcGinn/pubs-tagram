# Environment Stability Analysis - January 2, 2026

## Issue Summary
Working dev environment from January 1 stopped functioning on January 2 without user intervention. Two separate problems appeared:
1. Global `expo-cli` disappeared from system
2. Phone could not connect to dev server via WiFi

## Root Cause Analysis

### Problem 1: Missing expo-cli
**What happened:**
- User had `expo start --clear` working on Jan 1
- On Jan 2, command returned: `expo : The term 'expo' is not recognized`
- Investigation revealed global npm package was removed

**Why it happened:**
- **Most likely:** Windows system cleanup (Disk Cleanup tool, antivirus scan, or system maintenance)
- **Secondary possibility:** npm cache/package directory corruption
- **Not user action:** User confirmed no intentional changes

**Contributing factor:**
- Reliance on global `expo-cli` package is fragile with Node 17+
- Expo itself recommends deprecating global install in favor of `npx expo`

### Problem 2: Phone connectivity failure
**What happened:**
- Metro bundler started successfully
- QR code generated and phone scanned it
- App showed blue spinner indefinitely (no connection to dev server)
- Terminal showed: `No apps connected. Sending "reload" to all React Native apps failed.`

**Why it happened:**
- Network connectivity between phone and computer broken
- Could be: Firewall rules, network configuration, router issue, or WiFi adapter reset

**Impact:** Development workflow completely blocked

## Recommendations

### 1. Use npx Instead of Global expo-cli
**Current (fragile):**
```bash
expo start --clear
```
**Recommended (robust):**
```bash
npx expo start --clear
```

**Benefits:**
- No global package to lose
- Always uses project's local Expo version
- Works with Node 17+ reliably
- Aligns with Expo's official recommendation (SDK 46+)

### 2. Document Network Troubleshooting
Added to QUICK_START.md:
- Same WiFi requirement
- Firewall disabling test
- LAN mode fallback
- Connection mode selection

### 3. Add Environment Validation Script
Created `verify-environment.ps1` to detect issues before attempting to start:
- Checks Node.js version
- Verifies npm and npx
- Confirms node_modules/expo installed
- Validates Firebase config presence

### 4. Version Pinning
Consider adding to future setup:
```json
{
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 5. CI/CD Setup
For team reliability, implement:
- Automated environment validation on pull requests
- Docker container for consistent dev environment
- GitHub Actions to test on multiple Node versions

## Files Updated
- [QUICK_START.md](QUICK_START.md) - Added comprehensive troubleshooting section
- [verify-environment.ps1](verify-environment.ps1) - New environment validation script

## Timeline
- **Jan 1**: Dev environment working (expo start --clear)
- **Jan 2 morning**: Expo CLI missing, phone connectivity broken
- **Resolution**: Switched to `npx expo start --clear`, identified network issue

## Quality Engineering Observations
From a QA perspective, this incident reveals:
1. **Environmental brittleness** - Dependencies disappeared without cause
2. **Single point of failure** - Reliance on global package
3. **Network fragility** - No documented fallback for connectivity issues
4. **Lack of validation** - No way to verify environment state before development
5. **Reproducibility risk** - If this happens to one developer, it will happen to others during onboarding

This is why proper environment documentation and validation is critical for team projects.
