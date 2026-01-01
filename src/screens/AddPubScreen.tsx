import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import RatingComponent from '../components/RatingComponent';
import { pickImageFromGallery } from '../utils/imageHelpers';
import { uploadPubPhoto } from '../services/storage';
import { createPub } from '../services/firestore';

type AddPubScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddPub'
>;

interface PhotoData {
  uri: string;
}

const AddPubScreen = () => {
  const navigation = useNavigation<AddPubScreenNavigationProp>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const [pubName, setPubName] = useState('');
  const [location, setLocation] = useState('');
  const [whatYouHad, setWhatYouHad] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [valueForMoney, setValueForMoney] = useState(3);
  const [beerQuality, setBeerQuality] = useState(3);
  const [foodQuality, setFoodQuality] = useState(0); // 0 means not rated
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && dropZoneRef.current) {
      const dropZone = dropZoneRef.current;

      const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };

      const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
      };

      const handleDragLeave = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      };

      const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (loading) return;

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
          handleFilesAdded(files);
        }
      };

      dropZone.addEventListener('dragenter', handleDragEnter);
      dropZone.addEventListener('dragover', handleDragOver);
      dropZone.addEventListener('dragleave', handleDragLeave);
      dropZone.addEventListener('drop', handleDrop);

      return () => {
        dropZone.removeEventListener('dragenter', handleDragEnter);
        dropZone.removeEventListener('dragover', handleDragOver);
        dropZone.removeEventListener('dragleave', handleDragLeave);
        dropZone.removeEventListener('drop', handleDrop);
      };
    }
  }, [loading, photos]);

  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));
    
    const remainingSlots = 5 - photos.length;
    const filesToAdd = imageFiles.slice(0, remainingSlots);

    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prev => [...prev, { uri: e.target!.result as string }]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (imageFiles.length > remainingSlots) {
      alert(`Only ${remainingSlots} more photos can be added (maximum 5 total)`);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  const handlePickImage = async () => {
    if (photos.length >= 5) {
      alert('Maximum Photos: You can only add up to 5 photos');
      return;
    }

    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      try {
        const result = await pickImageFromGallery();
        if (result) {
          setPhotos([...photos, { uri: result.uri }]);
        }
      } catch (error) {
        console.error('Error picking image:', error);
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!pubName.trim()) {
      alert('Please enter a pub name');
      return;
    }

    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    if (photos.length === 0) {
      alert('Please add at least one photo');
      return;
    }

    if (!user) return;

    setLoading(true);

    try {
      const tempPubId = `pub_${Date.now()}`;

      const uploadPromises = photos.map(async (photo, index) => {
        return uploadPubPhoto(
          user.uid,
          tempPubId,
          photo.uri,
          photo.uri,
          index
        );
      });

      const uploadResults = await Promise.all(uploadPromises);
      const photoUrls = uploadResults.map(r => r.fullUrl);
      const thumbnailUrls = uploadResults.map(r => r.thumbnailUrl);

      let visitDateObj: Date | undefined;
      if (visitDate.trim()) {
        visitDateObj = new Date(visitDate);
        if (isNaN(visitDateObj.getTime())) {
          visitDateObj = undefined;
        }
      }

      await createPub(user.uid, {
        pubName: pubName.trim(),
        location: location.trim(),
        whatYouHad: whatYouHad.trim(),
        visitDate: visitDateObj,
        valueForMoney,
        beerQuality,
        foodQuality: foodQuality > 0 ? foodQuality : undefined,
        photoUrls,
        thumbnailUrls,
      });

      navigation.goBack();
    } catch (error: any) {
      console.error('Full error:', error);
      alert('Error: ' + (error.message || 'Failed to save pub'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButton}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Pub</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#0095F6" />
          ) : (
            <Text style={styles.saveButton}>✓</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Photos (1-5 required) *</Text>
          
          {Platform.OS === 'web' && (
            <input
              ref={fileInputRef as any}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileInputChange as any}
            />
          )}

          <div
            ref={dropZoneRef as any}
            style={{
              minHeight: 112,
              borderRadius: 8,
              border: isDragging ? '2px dashed #0095F6' : '2px dashed transparent',
              backgroundColor: isDragging ? '#F0F8FF' : 'transparent',
              padding: 8,
              transition: 'all 0.2s',
            }}
          >
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePhoto(index)}
                    disabled={loading}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {photos.length < 5 && (
                <TouchableOpacity
                  style={[styles.addPhotoButton, isDragging && styles.addPhotoButtonDragging]}
                  onPress={handlePickImage}
                  disabled={loading}
                >
                  <Text style={styles.addPhotoText}>+</Text>
                  <Text style={styles.addPhotoHint}>
                    {Platform.OS === 'web' ? 'Click or drag images' : 'Tap to add'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {isDragging && (
              <View style={styles.dragOverlay}>
                <Text style={styles.dragOverlayText}>📷 Drop images here</Text>
              </View>
            )}
          </div>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Pub Name *</Text>
          <TextInput
            style={styles.input}
            value={pubName}
            onChangeText={setPubName}
            placeholder="e.g. The Red Lion"
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. City Centre"
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Visit Date (optional)</Text>
          <TextInput
            style={styles.input}
            value={visitDate}
            onChangeText={setVisitDate}
            placeholder="YYYY-MM-DD (e.g. 2025-12-31)"
            editable={!loading}
          />
          <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>What You Had (optional)</Text>
          <TextInput
            style={styles.input}
            value={whatYouHad}
            onChangeText={setWhatYouHad}
            placeholder="e.g. Guinness, Fish & Chips"
            editable={!loading}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Value for Money *</Text>
          <RatingComponent
            rating={valueForMoney}
            onRatingChange={setValueForMoney}
            icon="£"
          />
          <Text style={styles.ratingHint}>
            {valueForMoney === 1 && 'Super Cheap'}
            {valueForMoney === 2 && 'Good Value'}
            {valueForMoney === 3 && 'Fair Price'}
            {valueForMoney === 4 && 'Bit Pricey'}
            {valueForMoney === 5 && 'Quite Expensive'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Beer Quality *</Text>
          <RatingComponent
            rating={beerQuality}
            onRatingChange={setBeerQuality}
            icon="🍺"
          />
          <Text style={styles.ratingHint}>
            {beerQuality === 1 && 'Poor'}
            {beerQuality === 2 && 'Average'}
            {beerQuality === 3 && 'Good'}
            {beerQuality === 4 && 'Great'}
            {beerQuality === 5 && 'Excellent'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Food Quality (optional)</Text>
          <RatingComponent
            rating={foodQuality}
            onRatingChange={setFoodQuality}
            icon="🥧"
          />
          {foodQuality > 0 && (
            <Text style={styles.ratingHint}>
              {foodQuality === 1 && 'Poor'}
              {foodQuality === 2 && 'Average'}
              {foodQuality === 3 && 'Good'}
              {foodQuality === 4 && 'Great'}
              {foodQuality === 5 && 'Excellent'}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
  },
  cancelButton: {
    fontSize: 24,
    color: '#262626',
    width: 30,
  },
  saveButton: {
    fontSize: 24,
    color: '#0095F6',
    fontWeight: 'bold',
    width: 30,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#262626',
  },
  hint: {
    fontSize: 12,
    color: '#8E8E8E',
    marginTop: 4,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DBDBDB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addPhotoButtonDragging: {
    borderColor: '#0095F6',
    backgroundColor: '#F0F8FF',
  },
  addPhotoText: {
    fontSize: 32,
    color: '#8E8E8E',
  },
  addPhotoHint: {
    fontSize: 10,
    color: '#8E8E8E',
    marginTop: 4,
    textAlign: 'center',
  },
  dragOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  dragOverlayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0095F6',
  },
  ratingHint: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#8E8E8E',
  },
});

export default AddPubScreen;
