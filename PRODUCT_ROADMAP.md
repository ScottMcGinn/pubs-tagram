# User Profiles & Social Features - Product Roadmap

## Overview

Expand Pubs-tagram from a personal pub tracker to a social platform where users can:
- Build public profiles with bio and profile picture
- Follow/connect with other users
- See pubs added by users they follow
- Block problematic users
- Discover new pubs through their network

---

## Feature Breakdown

### Phase 1: User Profiles (Sprint 1)
**Duration:** 1-2 weeks  
**Priority:** High  
**Dependencies:** None (builds on existing auth)

#### Acceptance Criteria
- [ ] User profile screen with editable bio and profile picture
- [ ] Profile picture upload to Firebase Storage
- [ ] User details stored in Firestore
- [ ] View other users' public profiles
- [ ] Profile data persists across app sessions

#### Components Needed
- `ProfileScreen.tsx` - Current user's profile editor
- `UserProfileScreen.tsx` - View other users' profiles
- `ProfileEditModal.tsx` - Edit bio/picture in modal
- `ProfilePictureUpload.tsx` - Image upload component

#### Database Schema (New Collections)

**Collection: `users`**
```typescript
{
  uid: string;              // Firebase Auth UID (document ID)
  email: string;
  displayName: string;
  bio: string;              // User-written bio
  profilePicturePath: string; // Path in Firebase Storage
  profilePictureUrl: string;  // Download URL
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;        // Profile visibility
}
```

#### Firestore Rules Update
```
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId;
}
```

---

### Phase 2: User Connections (Sprint 2)
**Duration:** 1-2 weeks  
**Priority:** High  
**Dependencies:** Phase 1 (User Profiles)

#### Acceptance Criteria
- [ ] Follow/connect button on user profiles
- [ ] Unfollow functionality
- [ ] View list of followers and following
- [ ] Connection status indicator on profiles
- [ ] Real-time connection updates

#### Components Needed
- `ConnectionButton.tsx` - Follow/unfollow button
- `FollowersListScreen.tsx` - Show followers
- `FollowingListScreen.tsx` - Show users following
- `ConnectionStatusIndicator.tsx` - Visual indicator

#### Database Schema (New Collections)

**Collection: `connections`**
```typescript
{
  // Document ID: ${follower_uid}_${following_uid}
  followerUid: string;
  followingUid: string;
  createdAt: Timestamp;
  status: 'active' | 'blocked' | 'pending'; // For future approval flows
}
```

Alternative (denormalized, faster reads):
**Subcollection: `users/{uid}/following`**
```typescript
{
  uid: string;
  displayName: string;
  connectedAt: Timestamp;
}
```

**Subcollection: `users/{uid}/followers`**
```typescript
{
  uid: string;
  displayName: string;
  connectedAt: Timestamp;
}
```

#### Firestore Rules Update
```
match /connections/{doc=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == resource.data.followerUid;
}

match /users/{uid}/following/{doc=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == uid;
}
```

---

### Phase 3: Social Feed (Sprint 3)
**Duration:** 1-2 weeks  
**Priority:** High  
**Dependencies:** Phase 1 (Profiles) + Phase 2 (Connections)

#### Acceptance Criteria
- [ ] New "Social Feed" tab showing pubs from followed users
- [ ] Chronologically ordered by date added
- [ ] Show poster's profile info on each card
- [ ] Load more / pagination support
- [ ] Real-time updates using Firestore listeners

#### Components Needed
- `SocialFeedScreen.tsx` - Main social feed
- `SocialFeedCard.tsx` - Card showing pub + poster info
- `PosterProfilePreview.tsx` - Mini profile preview on card

#### Database Query Strategy

**Query:** Get pubs from all followed users (efficiently)

```typescript
// Pseudo-code for efficient querying
const followingList = await getUserFollowing(currentUserUid);
const followingUids = followingList.map(f => f.uid);

// Query pubs where createdBy in followingUids, ordered by createdAt
const query = query(
  collection(db, 'pubs'),
  where('createdBy', 'in', followingUids),
  orderBy('createdAt', 'desc'),
  limit(20)
);
```

**Note:** Firestore's `where` clause has a limit of 10 items in `in` array. For larger following lists, may need pagination or Cloud Functions.

#### Schema Changes (Existing Collections)

**Modify `pubs` collection - Add fields:**
```typescript
{
  // ... existing fields
  createdBy: string;      // UID of user who added pub
  createdAt: Timestamp;   // When pub was added
  posterDisplayName: string; // Cache poster name for fast display
  posterProfilePicture: string; // Cache poster picture for fast display
}
```

---

### Phase 4: User Blocking (Sprint 4)
**Duration:** 1 week  
**Priority:** Medium  
**Dependencies:** Phase 1 (Profiles) + Phase 2 (Connections)

#### Acceptance Criteria
- [ ] Block user button on other users' profiles
- [ ] Blocked users' pubs don't appear in social feed
- [ ] Can view and manage blocked users list
- [ ] Unblock functionality
- [ ] Blocked user cannot see blocker's profile

#### Components Needed
- `BlockUserButton.tsx` - Block/unblock button
- `BlockedUsersListScreen.tsx` - Manage blocked users
- `BlockConfirmationModal.tsx` - Confirmation dialog

#### Database Schema (New Collections)

**Collection: `blocks`**
```typescript
{
  // Document ID: ${blocker_uid}_${blocked_uid}
  blockerUid: string;
  blockedUid: string;
  reason?: string;        // Optional block reason
  createdAt: Timestamp;
}
```

Or Subcollection: `users/{uid}/blocked`
```typescript
{
  uid: string;
  displayName: string;
  blockedAt: Timestamp;
}
```

#### Firestore Rules Update
```
match /blocks/{doc=**} {
  allow read: if request.auth.uid == resource.data.blockerUid;
  allow create: if request.auth.uid == request.resource.data.blockerUid;
  allow delete: if request.auth.uid == resource.data.blockerUid;
}
```

#### Query Impact

Social feed query needs to filter out blocked users:
```typescript
// Get blocked user IDs
const blockedUsers = await getUserBlocked(currentUserUid);
const blockedUids = blockedUsers.map(b => b.uid);

// Query excludes blocked users
const pubsFromFollowing = pubs.filter(p => !blockedUids.includes(p.createdBy));
```

---

## Implementation Phases & Timeline

```
Timeline:
│
├─ Phase 1: User Profiles ────── Week 1-2 ────────┐
│                                                  │
├─ Phase 2: Connections ─────────── Week 3-4 ─────┤
│                                                  ├──> Sprint 1-2
├─ Phase 3: Social Feed ────────── Week 5-6 ──────┤
│                                                  │
└─ Phase 4: Blocking ───────────── Week 7 ────────┘

Total Estimated Time: 6-8 weeks for MVP
```

---

## Technical Decisions & Architecture

### Storage Strategy

**Option A: Denormalized (Recommended for this app)**
- Store connection lists as subcollections under users
- Faster reads, denormalize user data on pubs
- Trade-off: Some data duplication on updates

**Option B: Normalized (More complex)**
- Separate collections for relationships
- Single source of truth
- More complex queries, potential N+1 problems

**Recommendation:** Start with Option A (denormalized) for performance. Can optimize later.

### Query Optimization

1. **Pagination:** Implement cursor-based pagination for feeds
2. **Caching:** Use Redux/Context to cache user profile data
3. **Batch Queries:** Group queries where possible
4. **Indexes:** Create Firestore composite indexes for efficient queries

### Image Handling

- Profile pictures stored in Firebase Storage at: `/profiles/{uid}/profile.jpg`
- Generate download URL on profile load, cache in context
- Resize images client-side before upload (using `expo-image-manipulator`)
- Lazy load images in feeds

---

## Navigation & Screens

### New Screens

```
App Navigation
├── Feed Tab (existing, modify)
│   ├── FeedScreen (personal pubs - rename to "MyPubs")
│   └── SocialFeedScreen (new - pubs from followers)
│
├── Social Tab (new)
│   ├── UsersDiscoveryScreen (find users to follow)
│   ├── FollowersScreen
│   ├── FollowingScreen
│   └── BlockedUsersScreen
│
└── Profile Tab (new)
    ├── ProfileScreen (view own profile, edit)
    ├── UserProfileScreen (view other users)
    └── ProfileEditScreen (edit modal)
```

---

## Data Migration Strategy

1. **Backfill existing pubs:** Add `createdBy` and `createdAt` fields to current pubs
2. **Create user documents:** Generate user doc for currently authenticated user
3. **No breaking changes:** Old pubs work alongside new fields

---

## Testing Strategy

### Unit Tests to Add
- User profile validation (bio length, email format)
- Connection logic (follow/unfollow state)
- Block logic (blocked users excluded from queries)
- Image upload and sizing

### Integration Tests
- Full follow/unfollow flow
- Social feed filtering with blocks
- Profile picture upload and retrieval

### Firebase Security Rules Testing
- User can only edit own profile
- Users can only manage own connections/blocks
- Proper permission checks

---

## Performance Considerations

### Potential Bottlenecks
1. **Large following lists** → Firestore `in` query limit (10 items max)
   - **Solution:** Paginate followers or use Cloud Functions
   
2. **Real-time sync** → Too many listeners on large datasets
   - **Solution:** Use pagination + manual refresh, not real-time for social feed
   
3. **Image loading** → Network bandwidth
   - **Solution:** Lazy load, compression, caching

### Optimization Checklist
- [ ] Implement image caching and lazy loading
- [ ] Add pagination to all lists
- [ ] Create Firestore indexes for common queries
- [ ] Monitor read/write quota usage
- [ ] Compress profile pictures

---

## Security Considerations

### Privacy
- Allow users to make profiles private (phase 1 future enhancement)
- Only show non-private profiles to non-followers
- Respect block relationships (blocked user can't view profile)

### Data Protection
- Validate all user inputs (bio length, display name format)
- Sanitize user content to prevent injection
- Rate limit follow/block operations to prevent spam

### Firestore Rules
- Deny by default, allow specific operations
- Check authentication for all reads/writes
- Validate data structure matches schema

---

## Future Enhancements (Phase 5+)

- [ ] Friend approval flow (optional pending connections)
- [ ] Private profiles
- [ ] User search functionality
- [ ] Connection recommendations
- [ ] Follow notifications
- [ ] Comment on other users' pub entries
- [ ] Like/favorite pubs from other users
- [ ] Pub ratings aggregated from network
- [ ] User badges/achievements

---

## Success Metrics

- Active social connections per user (avg)
- Social feed engagement rate
- Growth in multi-user interactions
- Performance metrics (query latency, storage size)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Firestore query limits on large following lists | High | Implement pagination, use Cloud Functions |
| Image upload failures | Medium | Add retry logic, fallback avatars |
| Privacy violations | High | Implement proper Firestore rules, testing |
| Real-time sync costs | Medium | Use pagination, manual refresh instead of listeners |
| User spam/harassment | High | Block functionality, content moderation |

---

## Definition of Done (Per Phase)

- [ ] All features implemented and tested locally
- [ ] Unit tests written (70%+ coverage)
- [ ] Firestore rules tested and secure
- [ ] UI matches design system
- [ ] Performance benchmarks met
- [ ] Code reviewed and merged to main
- [ ] GitHub Actions CI/CD passes
- [ ] Documentation updated
