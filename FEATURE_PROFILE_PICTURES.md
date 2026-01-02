# Feature: Profile Picture on Pub Cards

## What Was Built
Added user profile pictures to pub cards in the feed, matching Instagram's design pattern. When a pub is shared, the person who shared it now has their profile picture displayed at the top-right of the card.

## Changes Made

### 1. **Updated Type Definitions** ([src/types/index.ts](src/types/index.ts))
- Extended the `Pub` interface to include optional `userProfile` data:
  ```typescript
  userProfile?: {
    displayName: string;
    profilePictureUrl?: string;
  };
  ```

### 2. **Enhanced Data Fetching** ([src/services/firestore.ts](src/services/firestore.ts))
- Updated `getUserPubs()` to fetch user profile data alongside pub data
- Now fetches the user's profile from the `users` collection in Firestore
- Includes `displayName` and `profilePictureUrl` in each pub's data

### 3. **Updated UI Component** ([src/screens/FeedScreen.tsx](src/screens/FeedScreen.tsx))
- Modified card header to display profile picture on the right side
- Profile picture is circular (40x40px, border-radius 20)
- Shows actual profile picture if available, otherwise shows a 👤 emoji placeholder
- Added `headerContent` layout to position text and image side-by-side
- Added `headerTextContainer` to keep pub name and location grouped

### 4. **Added New Styles**
```typescript
headerContent: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
}
headerTextContainer: {
  flex: 1,
}
profilePicture: {
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: '#DBDBDB',
  marginLeft: 12,
}
profilePictureEmpty: {
  justifyContent: 'center',
  alignItems: 'center',
}
profilePictureText: {
  fontSize: 24,
}
```

## How It Works
1. When a pub is loaded, `getUserPubs()` fetches both the pub data AND the user's profile
2. The profile picture URL from the user's profile is stored in the pub card
3. On the card, the profile picture displays next to the pub name and location
4. If no profile picture exists, a grey circle with a 👤 emoji appears instead

## Next Steps
- User profiles need profile pictures uploaded (via ProfilePictureUpload component)
- Could add user's display name under their picture (optional enhancement)
- Could add tap handler to navigate to user's profile

## Instagram Pattern Reference
This matches Instagram's feed where each post shows:
- User's profile picture (top-left of card)
- Username
- Post content/image
- Engagement actions

We've implemented the profile picture display. The profile data is already structured in your Firebase setup.
