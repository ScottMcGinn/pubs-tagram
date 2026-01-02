import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { deletePub, likePub, unlikePub, hasLikedPub, getLikeCount, dislikePub, undislikePub, hasDislikedPub, getDislikeCount } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ref, deleteObject } from 'firebase/storage';
import { storage } from '../services/firebase';

type PubDetailRouteProp = RouteProp<RootStackParamList, 'PubDetail'>;
type PubDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PubDetail'
>;

const { width } = Dimensions.get('window');

const PubDetailScreen = () => {
  const route = useRoute<PubDetailRouteProp>();
  const navigation = useNavigation<PubDetailNavigationProp>();
  const { pub } = route.params;
  const { user } = useAuth();
  
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadLikeData();
    }, [pub.pubId, user?.uid])
  );

  const loadLikeData = async () => {
    try {
      const count = await getLikeCount(pub.pubId);
      setLikeCount(count);
      
      const discount = await getDislikeCount(pub.pubId);
      setDislikeCount(discount);
      
      if (user?.uid) {
        const liked = await hasLikedPub(user.uid, pub.pubId);
        setHasLiked(liked);
        
        const disliked = await hasDislikedPub(user.uid, pub.pubId);
        setHasDisliked(disliked);
      }
    } catch (error) {
      console.error('Error loading like data:', error);
    }
  };

  const handleToggleLike = async () => {
    if (!user?.uid) return;
    
    try {
      if (hasLiked) {
        await unlikePub(user.uid, pub.pubId);
        setHasLiked(false);
        setLikeCount(Math.max(0, likeCount - 1));
      } else {
        // Remove dislike if present
        if (hasDisliked) {
          await undislikePub(user.uid, pub.pubId);
          setHasDisliked(false);
          setDislikeCount(Math.max(0, dislikeCount - 1));
        }
        await likePub(user.uid, pub.pubId);
        setHasLiked(true);
        setLikeCount(likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleDislike = async () => {
    if (!user?.uid) return;
    
    try {
      if (hasDisliked) {
        await undislikePub(user.uid, pub.pubId);
        setHasDisliked(false);
        setDislikeCount(Math.max(0, dislikeCount - 1));
      } else {
        // Remove like if present
        if (hasLiked) {
          await unlikePub(user.uid, pub.pubId);
          setHasLiked(false);
          setLikeCount(Math.max(0, likeCount - 1));
        }
        await dislikePub(user.uid, pub.pubId);
        setHasDisliked(true);
        setDislikeCount(dislikeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  const goToPreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const goToNextPhoto = () => {
    if (currentPhotoIndex < pub.photoUrls.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const handleDeletePress = () => {
    console.log('Delete pressed');
    setShowMenu(false);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    console.log('Confirmed delete');
    setShowDeleteConfirm(false);
    setDeleting(true);
    
    try {
      console.log('Starting delete for pub:', pub.pubId);
      
      // Delete photos from Storage
      const deletePhotoPromises = pub.photoUrls.map(async (url) => {
        try {
          const urlObj = new URL(url);
          const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
          console.log('Deleting photo:', path);
          const photoRef = ref(storage, path);
          await deleteObject(photoRef);
        } catch (error) {
          console.error('Error deleting photo:', error);
        }
      });

      const deleteThumbnailPromises = pub.thumbnailUrls.map(async (url) => {
        try {
          const urlObj = new URL(url);
          const path = decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
          console.log('Deleting thumbnail:', path);
          const thumbRef = ref(storage, path);
          await deleteObject(thumbRef);
        } catch (error) {
          console.error('Error deleting thumbnail:', error);
        }
      });

      await Promise.all([...deletePhotoPromises, ...deleteThumbnailPromises]);
      console.log('Photos deleted');

      // Delete Firestore document
      await deletePub(pub.pubId);
      console.log('Firestore document deleted');

      // Navigate back to feed
      navigation.goBack();
    } catch (error: any) {
      console.error('Error deleting pub:', error);
      alert('Failed to delete pub: ' + error.message);
      setDeleting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (deleting) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.deletingContainer}>
          <ActivityIndicator size="large" color="#FF3B30" />
          <Text style={styles.deletingText}>Deleting pub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
          console.log('Menu button clicked');
          setShowMenu(true);
        }}>
          <Text style={styles.menuButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            console.log('Overlay clicked');
            setShowMenu(false);
          }}
        >
          <TouchableOpacity
            style={styles.menuContainer}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeletePress}
            >
              <Text style={styles.menuItemTextDelete}>Delete Pub</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuItemText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Delete Pub</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete "{pub.pubName}"? This cannot be undone.
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonCancel]}
                onPress={() => setShowDeleteConfirm(false)}
              >
                <Text style={styles.confirmButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmButtonDelete]}
                onPress={handleDelete}
              >
                <Text style={[styles.confirmButtonText, styles.confirmButtonTextDelete]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Header */}
        {pub.userProfile && (
          <TouchableOpacity
            style={styles.userHeader}
            onPress={() => navigation.navigate('UserProfile', { userId: pub.userId })}
            activeOpacity={0.7}
          >
            {pub.userProfile.profilePictureUrl ? (
              <Image
                source={{ uri: pub.userProfile.profilePictureUrl }}
                style={styles.userProfilePicture}
              />
            ) : (
              <View style={[styles.userProfilePicture, styles.userProfilePictureEmpty]}>
                <Text style={styles.userProfilePictureText}>👤</Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{pub.userProfile.displayName}</Text>
              <Text style={styles.visitedLabel}>Shared this pub</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        {/* Photo Gallery */}
        <View style={styles.photoGalleryContainer}>
          <Image
            source={{ uri: pub.photoUrls[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />
          
          {/* Navigation Arrows */}
          {pub.photoUrls.length > 1 && (
            <>
              {currentPhotoIndex > 0 && (
                <TouchableOpacity
                  style={[styles.photoNavButton, styles.photoNavButtonLeft]}
                  onPress={goToPreviousPhoto}
                >
                  <Text style={styles.photoNavButtonText}>‹</Text>
                </TouchableOpacity>
              )}
              
              {currentPhotoIndex < pub.photoUrls.length - 1 && (
                <TouchableOpacity
                  style={[styles.photoNavButton, styles.photoNavButtonRight]}
                  onPress={goToNextPhoto}
                >
                  <Text style={styles.photoNavButtonText}>›</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Photo Indicator Dots */}
        {pub.photoUrls.length > 1 && (
          <View style={styles.dotsContainer}>
            {pub.photoUrls.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentPhotoIndex(index)}
              >
                <View
                  style={[
                    styles.dot,
                    index === currentPhotoIndex && styles.dotActive,
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pub Info */}
        <View style={styles.infoSection}>
          <Text style={styles.pubName}>{pub.pubName}</Text>
          <Text style={styles.location}>{pub.location}</Text>
        </View>

        <View style={styles.divider} />

        {/* What You Had */}
        {pub.whatYouHad && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What You Had</Text>
              <Text style={styles.sectionContent}>🍺 {pub.whatYouHad}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings</Text>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Value for Money:</Text>
            <View style={styles.ratingIcons}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={styles.ratingIcon}>
                  {i <= pub.valueForMoney ? '£' : '○'}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Beer Quality:</Text>
            <View style={styles.ratingIcons}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={styles.ratingIcon}>
                  {i <= pub.beerQuality ? '🍺' : '○'}
                </Text>
              ))}
            </View>
          </View>

          {pub.foodQuality && pub.foodQuality > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingLabel}>Food Quality:</Text>
              <View style={styles.ratingIcons}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Text key={i} style={styles.ratingIcon}>
                    {i <= pub.foodQuality! ? '🥧' : '○'}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Like/Dislike Section */}
        <View style={styles.section}>
          <View style={styles.likesContainer}>
            <TouchableOpacity
              style={styles.likeButton}
              onPress={handleToggleLike}
            >
              <Text style={styles.thumbIcon}>👍</Text>
              <Text style={styles.likeText}>{likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dislikeButton}
              onPress={handleToggleDislike}
            >
              <Text style={styles.thumbIcon}>👎</Text>
              <Text style={styles.likeText}>{dislikeCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Date Added */}
        <View style={styles.section}>
          <Text style={styles.metadata}>
            Added: {formatDate(pub.createdAt)}
          </Text>
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
  backButton: {
    fontSize: 28,
    color: '#262626',
  },
  menuButton: {
    fontSize: 28,
    color: '#262626',
  },
  deletingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deletingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E8E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    paddingBottom: 50,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  menuItemText: {
    fontSize: 16,
    color: '#262626',
    textAlign: 'center',
  },
  menuItemTextDelete: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmDialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    maxWidth: 400,
    width: '100%',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    color: '#8E8E8E',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonCancel: {
    backgroundColor: '#F0F0F0',
  },
  confirmButtonDelete: {
    backgroundColor: '#FF3B30',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  confirmButtonTextDelete: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  userProfilePicture: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBDBDB',
    marginRight: 12,
  },
  userProfilePictureEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfilePictureText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  visitedLabel: {
    fontSize: 13,
    color: '#8E8E8E',
  },
  chevron: {
    fontSize: 20,
    color: '#DBDBDB',
  },
  photoGalleryContainer: {
    height: 400,
    position: 'relative',
    backgroundColor: '#FAFAFA',
  },
  photo: {
    width: '100%',
    height: 400,
  },
  photoNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  photoNavButtonLeft: {
    left: 16,
  },
  photoNavButtonRight: {
    right: 16,
  },
  photoNavButtonText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DBDBDB',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#0095F6',
  },
  infoSection: {
    padding: 16,
  },
  pubName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#8E8E8E',
  },
  divider: {
    height: 1,
    backgroundColor: '#DBDBDB',
    marginHorizontal: 16,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    color: '#262626',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#262626',
    marginRight: 8,
    minWidth: 140,
  },
  ratingIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingIcon: {
    fontSize: 20,
  },
  metadata: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  dislikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  thumbIcon: {
    fontSize: 24,
  },
  likeText: {
    fontSize: 16,
    color: '#262626',
    fontWeight: '500',
  },
});

export default PubDetailScreen;
