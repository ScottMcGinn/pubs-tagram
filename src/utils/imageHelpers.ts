import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
}

// Request permissions (Android only)
const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ];

    const granted = await PermissionsAndroid.requestMultiple(permissions);
    return Object.values(granted).every(
      (permission) => permission === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (err) {
    console.error('Permission request failed:', err);
    return false;
  }
};

// Pick image from camera
export const pickImageFromCamera = async (): Promise<ImageResult | null> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return null;
  }

  return new Promise((resolve) => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response: any) => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
          const asset = response.assets[0];
          resolve({
            uri: asset.uri,
            width: asset.width || 100,
            height: asset.height || 100,
          });
        } else {
          resolve(null);
        }
      }
    );
  });
};

// Pick image from gallery
export const pickImageFromGallery = async (): Promise<ImageResult | null> => {
  const hasPermission = await requestPermissions();
  if (!hasPermission) {
    return null;
  }

  return new Promise((resolve) => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      (response: any) => {
        if (!response.didCancel && !response.errorCode && response.assets?.[0]) {
          const asset = response.assets[0];
          resolve({
            uri: asset.uri,
            width: asset.width || 100,
            height: asset.height || 100,
          });
        } else {
          resolve(null);
        }
      }
    );
  });
};
      uri: result.assets[0].uri,
      width: result.assets[0].width,
      height: result.assets[0].height,
    };
  }

  return null;
};

// Resize and compress image
export const resizeImage = async (
  uri: string,
  maxSize: number = 1920
): Promise<string> => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: maxSize } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
};

// Create thumbnail
export const createThumbnail = async (uri: string): Promise<string> => {
  const manipResult = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 400 } }],
    { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipResult.uri;
};
