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
import { colors } from '../../constants/colors';

// Lazy load ImagePicker to prevent app crash if native module is unavailable
let ImagePicker: typeof import('expo-image-picker') | null = null;

const loadImagePicker = async () => {
  if (!ImagePicker) {
    try {
      ImagePicker = await import('expo-image-picker');
    } catch (error) {
      console.warn('Failed to load ImagePicker:', error);
      throw new Error('Image picker not available');
    }
  }
  return ImagePicker;
};

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
    const picker = await loadImagePicker();
    const { status } = await picker!.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestMediaLibraryPermission = async () => {
    const picker = await loadImagePicker();
    const { status } = await picker!.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const handlePickFromCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required');
      return;
    }

    try {
      const picker = await loadImagePicker();
      const result = await picker!.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        await onUpload(result.assets[0].uri);
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
      const picker = await loadImagePicker();
      const result = await picker!.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setIsUploading(true);
        await onUpload(result.assets[0].uri);
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
        <ActivityIndicator size="large" color={colors.primary} />
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
  actionButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 20,
    bottom: 0,
    height: 40,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 40,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    color: colors.mediumGray,
    fontSize: 14,
    marginTop: 12,
  },
  placeholderImage: {
    backgroundColor: colors.backgroundGray,
  },
  placeholderText: {
    fontSize: 48,
  },
  previewContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  previewImage: {
    alignItems: 'center',
    backgroundColor: colors.borderGray,
    borderRadius: 75,
    height: 150,
    justifyContent: 'center',
    width: 150,
  },
});
