import React from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { UserProfile } from '../../types';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  loading?: boolean;
  editingMode?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  loading = false,
  editingMode = false,
}) => {
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
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
  container: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  pictureContainer: {
    marginBottom: 16,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderPicture: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#666',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 16,
    lineHeight: 20,
  },
  emptyBio: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginHorizontal: 16,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
  },
});
