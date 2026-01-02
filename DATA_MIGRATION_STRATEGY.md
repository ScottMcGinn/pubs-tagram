# Data Migration Strategy - User Profiles

## Problem Statement
Code deployed that expects user profiles to exist, but existing users in database don't have profiles. This creates:
- Broken display on feed (no names/pictures)
- Poor user experience on deployments
- CI/CD reliability issues

## Solution: Lazy Migration Pattern

We've implemented **automatic profile creation on-demand** (lazy migration):

### How It Works
When `getUserPubs()` is called:
1. Attempts to fetch user's profile from Firestore
2. If profile doesn't exist, automatically creates one:
   ```typescript
   // Migration: if user has no profile but is trying to view pubs, create one
   if (!userProfile) {
     console.log(`Profile missing for user ${userId}, creating...`);
     await createUserProfile(userId, displayName, userId);
     userProfile = await getUserProfile(userId);
   }
   ```
3. User sees their username immediately (profile created on first app load)
4. No manual intervention or admin scripts needed

### Benefits
✅ Backward compatible - existing users aren't broken  
✅ Transparent - happens automatically without user action  
✅ Safe - profile creation is idempotent (won't duplicate)  
✅ Traceable - logs when migration occurs  
✅ No data loss - works with existing pubs  

## For CI/CD Pipeline

### Before Deployment
Add a health check that verifies:
```bash
# Check that profile creation works
- Verify getUserProfile returns profile after migration
- Verify display name is set correctly
```

### During Deployment
- No data migration scripts needed
- No downtime required
- Users are migrated on first access

### Monitoring
Watch logs for: `Profile missing for user...` messages
- High frequency = many pre-existing accounts (expected for first deploy)
- Should decrease to zero after all users access app

## Example Scenario

**Before:**
- User signs up on old code (no profile created)
- New code deployed
- User opens app
- Feed shows: `undefined` or missing username
- ❌ Bad experience

**After (with lazy migration):**
- User signs up on old code (no profile created)
- New code deployed
- User opens app
- System detects missing profile and creates one
- User sees: `scott` (username) on feed
- ✅ Seamless experience

## Code Changes

### [src/services/firestore.ts](src/services/firestore.ts)
- Added `createUserProfile` and `getUserProfile` imports
- Enhanced `getUserPubs()` to detect and create missing profiles
- Logs profile creation for monitoring

### [src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx)
- New signups now create profiles immediately (no migration needed)
- Uses email prefix as default display name

## Future Considerations

If you add more required user profile fields:
1. Add them to migration logic in `getUserPubs()`
2. Default values should be user-friendly
3. Consider adding explicit migration UI for user data collection

## Testing

Test the migration:
1. **Without migration:** Comment out migration code in `getUserPubs()`
2. Create test user (no profile)
3. Add a pub
4. Verify feed shows "undefined" for username
5. **With migration:** Uncomment migration code
6. Reload app
7. Feed should show username automatically

This pattern is production-ready and handles data schema evolution gracefully.
