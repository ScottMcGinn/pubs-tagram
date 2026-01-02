# Firestore Security Rules - Production Deployment Guide

## Overview

The `firestore.rules` file contains production-ready security rules for the Pubs-tagram application. These rules enforce:

- **Authentication**: All operations require user authentication
- **Authorization**: Users can only modify their own data
- **Privacy**: User profiles can be set to private (only viewable by the user)
- **Access Control**: Proper read/write restrictions on all collections

## Rule Summary

### Users Collection (`/users/{userId}`)
- **Read**: Public profiles readable by all authenticated users; private profiles only by the owner
- **Write**: Only the user can create/update/delete their own profile

### Pubs Collection (`/pubs/{pubId}`)
- **Read**: All authenticated users can view pubs
- **Write**: Only the pub creator can update/delete their pub
- **Likes Subcollection** (`/pubs/{pubId}/likes/{userId}`):
  - **Read**: All authenticated users can see likes
  - **Write**: Only the user can add/remove their own like
- **Dislikes Subcollection** (`/pubs/{pubId}/dislikes/{userId}`):
  - **Read**: All authenticated users can see dislikes
  - **Write**: Only the user can add/remove their own dislike

### Follows Collection (`/follows/{followId}`)
- **Read**: All authenticated users can see follow relationships
- **Write**: Only the follower can create/delete their follow relationship

## Deployment Steps

### Option 1: Firebase Console (Web UI)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "pubs-tagram" project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the entire content from `firestore.rules`
5. Replace the current rules with the copied content
6. Click **Publish**

### Option 2: Firebase CLI (Recommended for CI/CD)

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project (if not already done):
   ```bash
   firebase init firestore
   ```

4. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Testing Rules

Before deploying to production, test the rules in the Firebase Console:

1. Go to **Firestore Database** → **Rules** tab
2. Click **Rules Simulator** (bottom of page)
3. Test scenarios:
   - **Unauthenticated user** trying to read pubs → ❌ Should fail
   - **Authenticated user A** trying to update **User B's** profile → ❌ Should fail
   - **Authenticated user** reading public user profiles → ✅ Should succeed
   - **User** creating a pub with their own `userId` → ✅ Should succeed

## Rollback Plan

If issues occur after deployment:

1. In Firebase Console, go back to **Firestore Database** → **Rules**
2. Restore the previous version using the **Revisions** tab
3. Or temporarily use development rules:
   ```
   match /{document=**} {
     allow read, write: if request.auth.uid != null;
   }
   ```

## Future Improvements

- Add rate limiting for writes
- Implement custom claims for admin users
- Add timestamp validation for created_at/updated_at
- Implement soft deletes instead of hard deletes
- Add audit logging for sensitive operations

## Security Checklist

Before production deployment:

- [ ] Test all rule scenarios with Rules Simulator
- [ ] Verify user cannot access other users' private profiles
- [ ] Verify user cannot delete other users' pubs
- [ ] Verify authentication is required for all operations
- [ ] Review follow relationship security
- [ ] Backup current rules (take screenshot of revisions)
- [ ] Schedule monitoring and logging setup
- [ ] Have rollback plan ready

## Monitoring

After deployment, monitor:

1. **Firestore Console** → **Stats** for unusual read/write patterns
2. **Cloud Logging** for denied requests
3. **Real-time Database** for performance issues

Alert conditions:
- Spike in denied requests (potential attack)
- Unusual read/write ratios
- Large batch operations failing
