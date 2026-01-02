# Firestore Security Rules - Quick Reference

## TL;DR - One Sentence Per Collection

| Collection | Rule |
|-----------|------|
| **users** | Read all authenticated users; Write own profile only |
| **pubs** | Read by all authenticated; Write by creator only |
| **likes** | Read by all authenticated; Write by user only |
| **dislikes** | Read by all authenticated; Write by user only |
| **follows** | Read by all authenticated; Write by follower only |

---

## Key Principles

1. **All operations require authentication**
2. **Users can only write their own data**
3. **All user profiles are visible to authenticated users**
4. **Creator/follower restrictions protect write operations**

---

## Deployment Checklist

- [ ] Copy `firestore.rules` file content
- [ ] Open Firebase Console → Firestore → Rules
- [ ] Replace current rules with new rules
- [ ] Click "Publish"
- [ ] Run Rules Simulator tests
- [ ] Monitor Cloud Logging for errors

**Estimated Time**: 5 minutes

---

## What Changed from Development?

| Operation | Development | Production |
|-----------|-------------|-----------|
| Read any user profile | ✅ Allowed | ✅ Allowed (all authenticated) |
| Update any pub | ✅ Allowed | ❌ Denied (only creator) |
| Delete any user | ✅ Allowed | ❌ Denied (only owner) |
| Create follow | ✅ Allowed | ⚠️ Must be follower in data |
| Like other users' likes | ✅ Allowed | ❌ Denied |

---

## If Something Breaks

1. **Check the error message** in app console
2. **Look at Cloud Logging** for denied requests
3. **Verify user is authenticated**
4. **Verify data matches rule requirements**
5. **Revert to development rules** (temporary fix):
   ```firestore
   match /{document=**} {
     allow read, write: if request.auth.uid != null;
   }
   ```

---

## Common Operations & Their Status

```
Create Pub (User A)           → ✅ ALLOWED
Update Pub (Creator)          → ✅ ALLOWED
Update Pub (Non-Creator)      → ❌ DENIED
Delete Pub (Creator)          → ✅ ALLOWED
Read Pub (Any Auth User)      → ✅ ALLOWED
Like Pub (User A their own)   → ✅ ALLOWED
Like Pub (User A as User B)   → ❌ DENIED
Follow User (Create own)      → ✅ ALLOWED
Unfollow (Remove own)         → ✅ ALLOWED
Read Any Profile (Any Auth)   → ✅ ALLOWED
Update Own Profile            → ✅ ALLOWED
Update Other Profile          → ❌ DENIED
```

---

## Files Provided

1. **firestore.rules** - The actual rules to deploy
2. **FIRESTORE_RULES_DEPLOYMENT.md** - Step-by-step deployment guide
3. **FIRESTORE_RULES_DETAILED.md** - Technical deep-dive with examples
4. **PRODUCTION_READINESS.md** - Full checklist for production launch

---

## Next Steps

1. Deploy the firestore.rules using one of the methods in FIRESTORE_RULES_DEPLOYMENT.md
2. Test using Rules Simulator in Firebase Console
3. Monitor Cloud Logging after deployment
4. Update your app's error handling if needed

**Questions?** Check FIRESTORE_RULES_DETAILED.md for examples and scenarios.
