import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import * as Updates from 'expo-updates';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import {
  createUserProfile,
  getFollowersCount,
  getFollowingCount,
} from '../services/userProfiles';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { ProfilePictureUpload } from '../components/Profile/ProfilePictureUpload';
import { ProfileEditForm } from '../components/Profile/ProfileEditForm';
import { AppVersionInfo } from '../components/app-version-info';
import { UpdatePrompt } from '../components/update-prompt';
import { UserProfile, RootStackParamList } from '../types';

type ProfileScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProfileScreen'
>;

type ProfileScreenMode = 'view' | 'edit';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user } = useAuth();
  const {
    currentUserProfile,
    loading,
    error,
    updateProfile,
    uploadPicture,
    deletePicture,
    loadCurrentUserProfile,
  } = useUser();
  const [mode, setMode] = useState<ProfileScreenMode>('view');
  const [isInitializing, setIsInitializing] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | undefined>();

  const loadFollowCounts = async () => {
    if (!user?.uid) return;
    try {
      const followers = await getFollowersCount(user.uid);
      const following = await getFollowingCount(user.uid);
      setFollowersCount(followers);
      setFollowingCount(following);
    } catch (error) {
      console.error('Error loading follow counts:', error);
    }
  };

  const checkForUpdates = async () => {
    setIsCheckingUpdates(true);
    try {
      const update = await Updates.checkForUpdateAsync();
      setLastChecked(new Date());

      if (update.isAvailable) {
        setUpdateAvailable(true);
        setShowUpdatePrompt(true);
      } else {
        Alert.alert('No Updates', 'Your app is up to date!');
      }
    } catch (error) {
      console.error('[ProfileScreen] Error checking for updates:', error);
      Alert.alert(
        'Update Check Failed',
        'Unable to check for updates at this time.'
      );
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  const handleApplyUpdate = async () => {
    try {
      setIsCheckingUpdates(true);
      await Updates.reloadAsync();
    } catch (error) {
      console.error('[ProfileScreen] Error applying update:', error);
      Alert.alert(
        'Update Failed',
        'Unable to apply update. Please try again later.'
      );
    } finally {
      setIsCheckingUpdates(false);
      setShowUpdatePrompt(false);
    }
  };

  // Initialize profile on mount - load profile when user navigates here
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) {
        console.log('No user UID');
        return;
      }

      setIsInitializing(true);
      try {
        console.log('Attempting to load profile for user:', user.uid);
        await loadCurrentUserProfile();
        console.log('Profile loaded successfully');
        // Load follower/following counts
        await loadFollowCounts();
      } catch (err) {
        // Profile might not exist yet, create it
        console.log('Profile load failed, attempting to create:', err);
        try {
          const displayName =
            user.displayName || user.email?.split('@')[0] || 'User';
          console.log('Creating profile with name:', displayName);
          await createUserProfile(user.uid, displayName, user.email || '');
          console.log('Profile created, attempting to load again');
          await loadCurrentUserProfile();
          console.log('Profile loaded after creation');
          // Load follower/following counts
          await loadFollowCounts();
        } catch (createErr) {
          console.error('Error creating or loading profile:', createErr);
        }
      } finally {
        setIsInitializing(false);
      }
    };

    loadProfile();
  }, []);

  // Refresh counts when screen comes into focus (after following someone)
  useFocusEffect(
    React.useCallback(() => {
      loadFollowCounts();
    }, [user?.uid])
  );

  const handleFollowersPress = () => {
    if (user?.uid) {
      navigation.navigate('FollowersList', { userId: user.uid });
    }
  };

  const handleFollowingPress = () => {
    if (user?.uid) {
      navigation.navigate('FollowingList', { userId: user.uid });
    }
  };

  if (isInitializing || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // If no profile exists, show empty profile with edit button to create it
  const displayProfile = currentUserProfile || {
    uid: user?.uid || '',
    email: user?.email || '',
    displayName: user?.displayName || user?.email?.split('@')[0] || 'User',
    bio: '',
    profilePictureUrl: undefined,
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* View Mode */}
        {mode === 'view' && (
          <>
            <ProfileHeader
              profile={displayProfile}
              editingMode={false}
              followersCount={followersCount}
              followingCount={followingCount}
              onFollowersPress={handleFollowersPress}
              onFollowingPress={handleFollowingPress}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error.message}</Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setMode('edit')}
              >
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  Alert.alert('Logout', 'Are you sure you want to log out?', [
                    { text: 'Cancel', onPress: () => {} },
                    {
                      text: 'Logout',
                      onPress: async () => {
                        // This will be handled by AuthContext
                        // For now, just show a placeholder
                        Alert.alert('Logout functionality coming soon');
                      },
                      style: 'destructive',
                    },
                  ]);
                }}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingHorizontal: 16 }}>
              <AppVersionInfo
                updateAvailable={updateAvailable}
                isCheckingUpdates={isCheckingUpdates}
                onCheckUpdates={checkForUpdates}
                lastChecked={lastChecked}
              />
            </View>
          </>
        )}

        {/* Edit Mode */}
        {mode === 'edit' && (
          <>
            <ProfileHeader profile={displayProfile} editingMode={true} />

            <View style={styles.editContent}>
              <ProfilePictureUpload
                currentImageUrl={displayProfile?.profilePictureUrl}
                onUpload={uploadPicture}
                onDelete={deletePicture}
                loading={loading}
              />

              <ProfileEditForm
                profile={displayProfile as UserProfile}
                onSave={updateProfile}
                loading={loading}
                error={error}
              />

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setMode('view')}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      <UpdatePrompt
        visible={showUpdatePrompt}
        onDismiss={() => setShowUpdatePrompt(false)}
        onUpdate={handleApplyUpdate}
        isLoading={isCheckingUpdates}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    gap: 12,
    padding: 16,
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: '#999',
    borderRadius: 8,
    marginTop: 16,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editContent: {
    padding: 16,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 50,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
