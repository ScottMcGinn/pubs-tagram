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
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile } from '../services/userProfiles';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { ProfilePictureUpload } from '../components/Profile/ProfilePictureUpload';
import { ProfileEditForm } from '../components/Profile/ProfileEditForm';

type ProfileScreenMode = 'view' | 'edit';

export const ProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const { currentUserProfile, loading, error, updateProfile, uploadPicture, deletePicture, loadCurrentUserProfile } = useUser();
  const [mode, setMode] = useState<ProfileScreenMode>('view');
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize profile on mount
  useEffect(() => {
    const initializeProfile = async () => {
      if (!user?.uid) return;

      try {
        setIsInitializing(true);
        
        // Check if profile exists, if not create one
        if (!currentUserProfile) {
          const displayName = user.displayName || user.email?.split('@')[0] || 'User';
          await createUserProfile(user.uid, displayName, user.email || '');
          await loadCurrentUserProfile();
        }
      } catch (err) {
        console.error('Error initializing profile:', err);
        Alert.alert('Error', 'Failed to initialize profile');
      } finally {
        setIsInitializing(false);
      }
    };

    initializeProfile();
  }, [user?.uid]);

  if (isInitializing || loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* View Mode */}
        {mode === 'view' && (
          <>
            <ProfileHeader
              profile={currentUserProfile}
              editingMode={false}
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
                  Alert.alert(
                    'Logout',
                    'Are you sure you want to log out?',
                    [
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
                    ]
                  );
                }}
              >
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Edit Mode */}
        {mode === 'edit' && (
          <>
            <ProfileHeader profile={currentUserProfile} editingMode={true} />

            <View style={styles.editContent}>
              <ProfilePictureUpload
                currentImageUrl={currentUserProfile?.profilePictureUrl}
                onUpload={uploadPicture}
                onDelete={deletePicture}
                loading={loading}
              />

              <ProfileEditForm
                profile={currentUserProfile!}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  editButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  editContent: {
    padding: 16,
  },
  cancelButton: {
    backgroundColor: '#999',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
