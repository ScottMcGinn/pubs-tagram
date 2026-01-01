import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ProfilePictureUploadProps {
  currentImageUrl?: string;
  onUpload: (uri: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  loading?: boolean;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentImageUrl,
  onUpload,
  onDelete,
  loading = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const handlePickFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setIsUploading(true);
        await onUpload(base64Uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture photo');
      console.error('Camera error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePickFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Media library permission is required');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setIsUploading(true);
        await onUpload(base64Uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select photo');
      console.error('Library error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (!onDelete) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to remove your profile picture?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            setIsUploading(true);
            try {
              await onDelete();
            } finally {
              setIsUploading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (isUploading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Uploading photo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Picture Preview */}
      <View style={styles.previewContainer}>
        {currentImageUrl ? (
          <>
            <Image
              source={{ uri: currentImageUrl }}
              style={styles.previewImage}
            />
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>✕</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={[styles.previewImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePickFromCamera}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handlePickFromLibrary}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Choose from Library</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#F0F0F0',
  },
  placeholderText: {
    fontSize: 48,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
