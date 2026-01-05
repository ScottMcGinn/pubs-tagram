import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { UserProfile } from '../../types';
import { colors } from '../../constants/colors';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  loading?: boolean;
  editingMode?: boolean;
  followersCount?: number;
  followingCount?: number;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  loading = false,
  editingMode = false,
  followersCount = 0,
  followingCount = 0,
  onFollowersPress,
  onFollowingPress,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.pictureContainer}>
        {profile.profilePictureUrl ? (
          <Image
            source={{ uri: profile.profilePictureUrl }}
            style={styles.profilePicture}
          />
        ) : (
          <View style={[styles.profilePicture, styles.placeholderPicture]}>
            <Text style={styles.placeholderText}>
              {profile.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>

      {/* Name and Email */}
      <Text style={styles.displayName}>{profile.displayName}</Text>
      <Text style={styles.email}>{profile.email}</Text>

      {/* Followers/Following Stats */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={onFollowersPress}
          disabled={!onFollowersPress}
        >
          <Text style={styles.statNumber}>{followersCount}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={onFollowingPress}
          disabled={!onFollowingPress}
        >
          <Text style={styles.statNumber}>{followingCount}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </TouchableOpacity>
      </View>

      {/* Bio */}
      {profile.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : (
        editingMode && <Text style={styles.emptyBio}>Add a bio...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bio: {
    color: colors.darkGray,
    fontSize: 14,
    lineHeight: 20,
    marginHorizontal: 16,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: colors.mediumGray,
    fontSize: 14,
    marginBottom: 16,
  },
  emptyBio: {
    color: colors.gray,
    fontSize: 14,
    fontStyle: 'italic',
    marginHorizontal: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
  },
  pictureContainer: {
    marginBottom: 16,
  },
  placeholderPicture: {
    alignItems: 'center',
    backgroundColor: colors.borderGray,
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.mediumGray,
    fontSize: 48,
    fontWeight: 'bold',
  },
  profilePicture: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  statDivider: {
    backgroundColor: colors.placeholderGray,
    height: 30,
    width: 1,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statLabel: {
    color: colors.mutedGray,
    fontSize: 12,
    marginTop: 4,
  },
  statNumber: {
    color: colors.darkCharcoal,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
});
