import * as ImagePicker from 'expo-image-picker';

export interface ImageResult {
  uri: string;
  width: number;
  height: number;
}

// Pick image from camera
export const pickImageFromCamera = async (): Promise<ImageResult | null> => {
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
