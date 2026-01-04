import * as ImageManipulator from 'expo-image-manipulator';

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
}

// Lazy load ImagePicker to prevent app crash at startup
let ImagePicker: typeof import('expo-image-picker') | null = null;

const loadImagePicker = async () => {
  if (!ImagePicker) {
    try {
      ImagePicker = await import('expo-image-picker');
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library was denied');
      }
    } catch (error) {
      console.warn('Failed to load ImagePicker:', error);
      throw new Error('Image picker not available');
    }
  }
  return ImagePicker;
};

// Pick image from camera
export const pickImageFromCamera = async (): Promise<ImageResult | null> => {
  const picker = await loadImagePicker();
  const result = await picker!.launchCameraAsync({
    mediaTypes: picker!.MediaTypeOptions.Images,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets?.[0]) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
    };
  }

  return null;
};

// Pick image from gallery
export const pickImageFromGallery = async (): Promise<ImageResult | null> => {
  const picker = await loadImagePicker();
  const result = await picker!.launchImageLibraryAsync({
    mediaTypes: picker!.MediaTypeOptions.Images,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets?.[0]) {
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
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
