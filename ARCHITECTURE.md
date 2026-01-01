# User Profiles & Social Features - Technical Architecture

## Database Schema Design

### Complete Firestore Structure

```
Firestore Database
├── users/
│   └── {uid}
│       ├── displayName: string
│       ├── email: string
│       ├── bio: string
│       ├── profilePictureUrl: string
│       ├── createdAt: Timestamp
│       ├── updatedAt: Timestamp
│       ├── isPublic: boolean
│       │
│       ├── following/        [Subcollection]
│       │   └── {following_uid}
│       │       ├── uid: string
│       │       ├── displayName: string
│       │       ├── profilePictureUrl: string
│       │       └── connectedAt: Timestamp
│       │
│       ├── followers/        [Subcollection]
│       │   └── {follower_uid}
│       │       ├── uid: string
│       │       ├── displayName: string
│       │       ├── profilePictureUrl: string
│       │       └── connectedAt: Timestamp
│       │
│       └── blocked/          [Subcollection]
│           └── {blocked_uid}
│               ├── uid: string
│               ├── displayName: string
│               └── blockedAt: Timestamp
│
├── pubs/
│   └── {pub_id}
│       ├── ... existing fields
│       ├── createdBy: string           [NEW]
│       ├── createdAt: Timestamp        [NEW]
│       ├── posterDisplayName: string   [NEW - denormalized]
│       └── posterProfilePicture: string [NEW - denormalized]
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read all user profiles (public)
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // Subcollections: following, followers, blocked
      match /{document=**} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid == userId;
      }
    }
    
    // Pubs collection
    match /pubs/{pubId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                      request.resource.data.createdBy == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.createdBy;
    }
  }
}
```

---

## Service Layer Structure

### New Services to Create

#### 1. `services/userProfiles.ts`
```typescript
// User Profile Operations
export const createUserProfile = async (uid: string, data: UserProfile) => {};
export const getUserProfile = async (uid: string) => {};
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {};
export const getCurrentUserProfile = async () => {};
export const searchUsers = async (searchTerm: string) => {};
export const uploadProfilePicture = async (uid: string, uri: string) => {};
```

#### 2. `services/connections.ts`
```typescript
// User Connections (Follow/Unfollow)
export const followUser = async (targetUid: string) => {};
export const unfollowUser = async (targetUid: string) => {};
export const getFollowing = async (uid: string) => {};
export const getFollowers = async (uid: string) => {};
export const isFollowing = async (targetUid: string) => {};
export const getConnectionStatus = async (targetUid: string) => {};
```

#### 3. `services/socialFeed.ts`
```typescript
// Social Feed Operations
export const getSocialFeed = async (limit: number = 20) => {};
export const getSocialFeedPaginated = async (pageSize: number, lastDoc?: any) => {};
export const subscribeSocialFeed = async (callback: (pubs: Pub[]) => void) => {};
export const getFollowingPubs = async (limit: number = 20) => {};
```

#### 4. `services/blocking.ts`
```typescript
// User Blocking
export const blockUser = async (targetUid: string, reason?: string) => {};
export const unblockUser = async (targetUid: string) => {};
export const getBlockedUsers = async () => {};
export const isUserBlocked = async (targetUid: string) => {};
export const getBlockers = async (uid: string) => {};
```

#### 5. `services/storage.ts` (Enhancement)
```typescript
// Update existing storage service for profile pictures
export const uploadProfilePicture = async (uid: string, uri: string) => {};
export const deleteProfilePicture = async (uid: string) => {};
export const getProfilePictureUrl = async (uid: string) => {};
```

---

## Context & State Management

### New Contexts to Create

#### 1. `contexts/UserContext.tsx`
```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

interface UserContextType {
  currentUserProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  uploadProfilePicture: (uri: string) => Promise<void>;
}
```

#### 2. `contexts/ConnectionContext.tsx`
```typescript
interface ConnectionContextType {
  following: UserProfile[];
  followers: UserProfile[];
  blockedUsers: UserProfile[];
  followUser: (uid: string) => Promise<void>;
  unfollowUser: (uid: string) => Promise<void>;
  blockUser: (uid: string) => Promise<void>;
  unblockUser: (uid: string) => Promise<void>;
  isFollowing: (uid: string) => boolean;
  isBlocked: (uid: string) => boolean;
}
```

#### 3. `contexts/SocialFeedContext.tsx`
```typescript
interface SocialFeedContextType {
  pubs: PubWithPoster[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

---

## Component Structure

### Profile Components

```
src/components/Profile/
├── ProfileHeader.tsx          // Shows name, picture, bio
├── ProfileStats.tsx           # Shows following/followers count
├── ProfileEditForm.tsx        # Form for editing profile
├── ProfilePictureUpload.tsx   # Image picker & upload
├── ConnectionButton.tsx       # Follow/Unfollow button
├── BlockButton.tsx            # Block/Unblock button
└── BlockConfirmation.tsx      # Modal for confirmation
```

### Social Feed Components

```
src/components/SocialFeed/
├── SocialFeedCard.tsx         # Pub card with poster info
├── PosterPreview.tsx          # Mini profile on card
├── SocialFeedEmpty.tsx        # Empty state
└── ConnectionList.tsx         # Reusable list component
```

---

## Screens

### Profile Screens

```
src/screens/
├── ProfileScreen.tsx          # Current user's profile (editing)
├── UserProfileScreen.tsx      # Other user's profile (read-only)
├── ProfileEditScreen.tsx      # Edit profile details
├── FollowersScreen.tsx        # List of followers
├── FollowingScreen.tsx        # List of following
└── BlockedUsersScreen.tsx     # Manage blocked users
```

### Feed Screens

```
src/screens/
├── SocialFeedScreen.tsx       # New social feed tab
├── UserDiscoveryScreen.tsx    # Find users to follow
└── SearchScreen.tsx           # Search users
```

---

## Type Definitions

### `src/types/index.ts` (Update)

```typescript
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  bio: string;
  profilePictureUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPublic: boolean;
}

export interface Connection {
  uid: string;
  displayName: string;
  profilePictureUrl?: string;
  connectedAt: Timestamp;
}

export interface Block {
  uid: string;
  displayName: string;
  blockedAt: Timestamp;
  reason?: string;
}

export interface PubWithPoster extends Pub {
  createdBy: string;
  posterDisplayName: string;
  posterProfilePicture?: string;
  createdAt: Timestamp;
}

export interface FollowStatus {
  isFollowing: boolean;
  isFollowedBy: boolean;
  isBlocked: boolean;
  isBlockedBy: boolean;
}
```

---

## Navigation Flow

### Updated Navigation Structure

```
RootNavigator
├── AuthStack (if not logged in)
│   └── AuthScreen
│
└── AppStack (if logged in)
    └── BottomTabNavigator
        ├── MyPubsTab
        │   └── FeedStack
        │       ├── FeedScreen (personal pubs)
        │       └── PubDetailScreen
        │
        ├── SocialTab (NEW)
        │   └── SocialStack
        │       ├── SocialFeedScreen
        │       ├── UserProfileScreen
        │       └── BlockedUsersScreen
        │
        ├── ExploreTab (NEW)
        │   └── ExploreStack
        │       ├── UserDiscoveryScreen
        │       └── SearchScreen
        │
        └── ProfileTab (NEW)
            └── ProfileStack
                ├── ProfileScreen
                ├── FollowersScreen
                ├── FollowingScreen
                └── ProfileEditScreen
```

---

## Image Upload Workflow

```
User selects image
      ↓
expo-image-picker opens
      ↓
User takes/selects photo
      ↓
expo-image-manipulator resizes
      ↓
Upload to Firebase Storage
      ↓
Get download URL
      ↓
Save URL to Firestore user doc
      ↓
Update UI with new picture
```

### Image Optimization

```typescript
const resizedImage = await manipulateAsync(uri, 
  [{ resize: { width: 300, height: 300 } }],
  { compress: 0.8, format: 'jpeg' }
);
```

---

## Query Patterns

### Get Social Feed (with pagination)

```typescript
async function getSocialFeed(uid: string, pageSize = 20, lastDoc = null) {
  // 1. Get list of users being followed
  const followingSnapshot = await getDocs(
    collection(db, `users/${uid}/following`)
  );
  const followingUids = followingSnapshot.docs.map(doc => doc.id);
  
  // 2. Get list of blocked users
  const blockedSnapshot = await getDocs(
    collection(db, `users/${uid}/blocked`)
  );
  const blockedUids = blockedSnapshot.docs.map(doc => doc.id);
  
  // 3. Query pubs from following users (excluding blocked)
  const validFollowing = followingUids.filter(fuid => !blockedUids.includes(fuid));
  
  let q;
  if (lastDoc) {
    q = query(
      collection(db, 'pubs'),
      where('createdBy', 'in', validFollowing),
      orderBy('createdAt', 'desc'),
      startAfter(lastDoc),
      limit(pageSize)
    );
  } else {
    q = query(
      collection(db, 'pubs'),
      where('createdBy', 'in', validFollowing),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
  }
  
  return getDocs(q);
}
```

**Note:** This pattern works up to 10 following users. For larger lists, need Cloud Function.

---

## Implementation Checklist

### Phase 1: Profiles
- [ ] Create `users` Firestore collection
- [ ] Create `UserContext` and provider
- [ ] Create `userProfiles.ts` service
- [ ] Create profile components and screens
- [ ] Implement profile picture upload
- [ ] Add tests for user profile operations
- [ ] Update Firestore security rules

### Phase 2: Connections
- [ ] Create `following` and `followers` subcollections
- [ ] Create `ConnectionContext` and provider
- [ ] Create `connections.ts` service
- [ ] Create connection UI components
- [ ] Implement follow/unfollow logic
- [ ] Add tests for connection operations
- [ ] Update Firestore security rules

### Phase 3: Social Feed
- [ ] Add `createdBy`, `createdAt` to `pubs` collection
- [ ] Create `SocialFeedContext` and provider
- [ ] Create `socialFeed.ts` service
- [ ] Create social feed screens and components
- [ ] Implement pagination
- [ ] Add tests for feed queries
- [ ] Performance optimization

### Phase 4: Blocking
- [ ] Create `blocked` subcollection
- [ ] Create `blocking.ts` service
- [ ] Create block UI components
- [ ] Update social feed queries to respect blocks
- [ ] Add tests for blocking operations
- [ ] Update Firestore security rules

---

## Performance Metrics to Track

- Average query response time for social feed
- Firebase storage cost for images
- Firestore read/write quotas
- App startup time with new contexts
- Memory usage with large following lists

---

## Testing Strategy Details

### Unit Tests by Phase

**Phase 1:**
```typescript
// Test user profile creation, update, retrieval
// Test profile picture upload
// Test validation (bio length, etc.)
```

**Phase 2:**
```typescript
// Test follow/unfollow state changes
// Test following/followers list queries
// Test connection status checks
```

**Phase 3:**
```typescript
// Test social feed queries
// Test pagination
// Test filtering of blocked users
```

**Phase 4:**
```typescript
// Test block/unblock operations
// Test blocking effects on feed visibility
// Test mutual blocking scenarios
```

---

## Dependencies & Libraries

**Already Installed:**
- react-native
- firebase
- @react-navigation
- expo-image-picker
- expo-image-manipulator
- AsyncStorage

**May Need:**
- react-native-image-crop-picker (if better image handling needed)
- react-native-fast-image (for image caching)
- Cloud Functions (for advanced querying)

---

## Next Steps

1. Review this architecture document
2. Create database schema in Firestore
3. Implement Phase 1 (User Profiles)
4. Test locally
5. Add tests to CI/CD
6. Proceed to Phase 2

Start implementing Phase 1 when ready!
