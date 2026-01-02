# Firestore Security Rules - Technical Details

## Rules Structure

The production rules follow a principle of **least privilege**: users have only the minimum permissions needed to use the app.

### Authentication Check
```firestore
function isAuth() {
  return request.auth.uid != null;
}
```
Every operation requires the user to be authenticated.

### Ownership Check
```firestore
function isOwner(userId) {
  return isAuth() && request.auth.uid == userId;
}
```
Used to verify user owns the resource they're trying to modify.

---

## Collection-by-Collection Rules

### 1. Users Collection

**Path**: `/users/{userId}`

**Reads**:
```firestore
allow read: if isAuth();
```

- ✅ All authenticated users can read any profile
- ✅ Users can read their own profile
- ✅ Users can read other users' profiles

**Writes**:
```firestore
allow create, update, delete: if isOwner(userId);
```

- ✅ Users can create their own profile on signup
- ✅ Users can update their own profile
- ✅ Users can delete their own profile
- ❌ Cannot modify other users' profiles

**Scenarios**:
| Scenario | Allowed? | Reason |
|----------|----------|--------|
| User A reads User B's profile | ✅ | Authenticated |
| User A reads their own profile | ✅ | Authenticated |
| User A updates User B's profile | ❌ | Not owner |
| User A deletes User B's profile | ❌ | Not owner |

---

### 2. Pubs Collection

**Path**: `/pubs/{pubId}`

**Reads**:
```firestore
allow read: if isAuth();
```

- ✅ All authenticated users can see all pubs
- ❌ Unauthenticated users cannot access

**Writes**:
```firestore
allow create: if isAuth();
allow update, delete: if isAuth() && resource.data.userId == request.auth.uid;
```

- ✅ Authenticated users can create pubs
- ✅ Pub creator can update/delete their own pub
- ❌ Cannot modify other users' pubs

**Scenarios**:
| Scenario | Allowed? | Reason |
|----------|----------|--------|
| User creates a pub | ✅ | Has auth |
| User updates their own pub | ✅ | `userId` matches |
| User A updates User B's pub | ❌ | `userId` doesn't match |
| Unauthenticated user reads pub | ❌ | Not authenticated |

---

### 3. Likes Subcollection

**Path**: `/pubs/{pubId}/likes/{userId}`

**Reads**:
```firestore
allow read: if isAuth();
```

- ✅ All authenticated users can see who liked a pub
- ❌ Unauthenticated users cannot see likes

**Writes**:
```firestore
allow create, update, delete: if isOwner(userId);
```

- ✅ User can add/remove their own like
- ❌ Cannot modify other users' likes

**Data Structure**:
```typescript
{
  userId: "user123",      // Document ID is also the userId
  likedAt: Timestamp      // When they liked it
}
```

**Scenarios**:
| Scenario | Allowed? | Reason |
|----------|----------|--------|
| User A likes a pub | ✅ | `userId` = auth.uid |
| User A removes their like | ✅ | `userId` = auth.uid |
| User A adds a like as User B | ❌ | `userId` != auth.uid |
| Unauthenticated user likes pub | ❌ | Not authenticated |

---

### 4. Dislikes Subcollection

**Path**: `/pubs/{pubId}/dislikes/{userId}`

Same rules as Likes:
```firestore
allow read: if isAuth();
allow create, update, delete: if isOwner(userId);
```

- ✅ All authenticated users can see who disliked
- ✅ User can dislike/remove their own dislike
- ❌ Cannot modify other users' dislikes

---

### 5. Follows Collection

**Path**: `/follows/{followId}`

**Reads**:
```firestore
allow read: if isAuth();
```

- ✅ All authenticated users can see follow relationships
- ❌ Unauthenticated users cannot see follows

**Writes**:
```firestore
allow create, update, delete: if isAuth() && request.auth.uid == request.resource.data.follower;
```

- ✅ User can create/remove their own follow
- ❌ Cannot modify other users' follows

**Data Structure**:
```typescript
{
  follower: "userId123",      // Person doing the following
  following: "userId456",     // Person being followed
  followedAt: Timestamp       // When they followed
}
```

**Scenarios**:
| Scenario | Allowed? | Reason |
|----------|----------|--------|
| User A follows User B | ✅ | `follower` = auth.uid |
| User A unfollows User B | ✅ | `follower` = auth.uid |
| User A modifies User B's follow | ❌ | `follower` != auth.uid |
| User A adds follow as User C | ❌ | Can only create their own |

---

## Testing the Rules

### Using Rules Simulator

1. Open Firebase Console
2. Go to Firestore Database → Rules
3. Click "Rules Simulator" button (bottom)
4. Test cases:

#### Test 1: Unauthenticated Read
- **Operation**: `get`
- **Path**: `users/user123`
- **Authentication**: None
- **Expected**: ❌ DENIED

#### Test 2: Read Public Profile
- **Operation**: `get`
- **Path**: `users/user456`
- **Authentication**: `uid: user123`
- **Request**: Document with `isPublic: true`
- **Expected**: ✅ ALLOWED

#### Test 3: Update Own Profile
- **Operation**: `update`
- **Path**: `users/user123`
- **Authentication**: `uid: user123`
- **Expected**: ✅ ALLOWED

#### Test 4: Like Own Pub
- **Operation**: `create`
- **Path**: `pubs/pub1/likes/user123`
- **Authentication**: `uid: user123`
- **Expected**: ✅ ALLOWED

#### Test 5: Like as Another User
- **Operation**: `create`
- **Path**: `pubs/pub1/likes/user456`
- **Authentication**: `uid: user123`
- **Expected**: ❌ DENIED (userId mismatch)

---

## Common Mistakes & Solutions

### ❌ Mistake: Allowing writes to all authenticated users
```firestore
// BAD - Anyone can modify any pub
allow write: if isAuth();
```

### ✅ Solution: Check resource ownership
```firestore
// GOOD - Only creator can modify
allow write: if isAuth() && resource.data.userId == request.auth.uid;
```

---

### ❌ Mistake: No read restrictions
```firestore
// BAD - Exposes private data
allow read: if true;
```

### ✅ Solution: Check if public or owner
```firestore
// GOOD - Respects privacy
allow read: if isAuth() && (resource.data.isPublic || isOwner());
```

---

## Performance Considerations

1. **Index Creation**: Firestore will automatically create needed indexes
2. **Query Limits**: Rules don't limit query size; use app logic for pagination
3. **Batch Operations**: Each document in a batch is checked against rules
4. **Subcollections**: Rules for subcollections are independent of parent rules

---

## Debugging Failed Operations

If operations fail in production:

1. **Check Cloud Logging**:
   ```
   resource.type="cloud_firestore_database"
   operation_name=~".*denied"
   ```

2. **Common Failure Reasons**:
   - User not authenticated
   - Document doesn't match expected structure
   - User ID doesn't match
   - Timestamp validation failed

3. **Enable Rules Debug Mode** (temporary):
   ```firestore
   match /pubs/{pubId} {
     allow read, write: if true; // TEMPORARY - for debugging
   }
   ```

---

## Migration from Development to Production

When switching from development rules:

**Before**:
```firestore
match /{document=**} {
  allow read, write: if request.auth.uid != null;
}
```

**After**: Deploy `firestore.rules` file

**Testing**:
1. Deploy to staging first
2. Run full E2E tests
3. Monitor for errors in Cloud Logging
4. Verify no legitimate operations fail
5. Then deploy to production

---

## Rules Version

- **Firestore Rules Version**: `2`
- **Last Updated**: 2026-01-02
- **Status**: Production Ready
