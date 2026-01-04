import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Pub } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserPubs,
  likePub,
  unlikePub,
  hasLikedPub,
  getLikeCount,
  dislikePub,
  undislikePub,
  hasDislikedPub,
  getDislikeCount,
} from '../services/firestore';

type FeedScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Feed'>;

type ViewMode = 'feed' | 'grid';

const FeedScreen = () => {
  const navigation = useNavigation<FeedScreenNavigationProp>();
  const { signOut, user } = useAuth();
  const { width } = useWindowDimensions();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [cardPhotoIndices, setCardPhotoIndices] = useState<{
    [key: string]: number;
  }>({});
  const [likedPubs, setLikedPubs] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [dislikedPubs, setDislikedPubs] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [dislikeCounts, setDislikeCounts] = useState<{ [key: string]: number }>(
    {}
  );

  const isDesktop = width >= 768;
  const maxWidth = isDesktop ? 1000 : width;

  const loadPubs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userPubs = await getUserPubs(user.uid);
      setPubs(userPubs);

      // Load like and dislike counts and status for each pub
      const newLikeCounts: { [key: string]: number } = {};
      const newLikedPubs: { [key: string]: boolean } = {};
      const newDislikeCounts: { [key: string]: number } = {};
      const newDislikedPubs: { [key: string]: boolean } = {};

      for (const pub of userPubs) {
        const likeCount = await getLikeCount(pub.pubId);
        const hasLiked = await hasLikedPub(user.uid, pub.pubId);
        const dislikeCount = await getDislikeCount(pub.pubId);
        const hasDisliked = await hasDislikedPub(user.uid, pub.pubId);

        newLikeCounts[pub.pubId] = likeCount;
        newLikedPubs[pub.pubId] = hasLiked;
        newDislikeCounts[pub.pubId] = dislikeCount;
        newDislikedPubs[pub.pubId] = hasDisliked;
      }

      setLikeCounts(newLikeCounts);
      setLikedPubs(newLikedPubs);
      setDislikeCounts(newDislikeCounts);
      setDislikedPubs(newDislikedPubs);
    } catch (error) {
      console.error('Error loading pubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (pubId: string, userId: string) => {
    if (!userId || !pubId) {
      console.error('Invalid userId or pubId:', { userId, pubId });
      return;
    }

    try {
      const currentlyLiked = likedPubs[pubId] || false;

      if (currentlyLiked) {
        // Unlike
        console.log('Unliking pub:', pubId);
        await unlikePub(userId, pubId);
        setLikedPubs(prev => ({ ...prev, [pubId]: false }));
        setLikeCounts(prev => ({
          ...prev,
          [pubId]: Math.max(0, (prev[pubId] || 1) - 1),
        }));
      } else {
        // Like
        console.log('Liking pub:', pubId);
        await likePub(userId, pubId);
        setLikedPubs(prev => ({ ...prev, [pubId]: true }));
        setLikeCounts(prev => ({ ...prev, [pubId]: (prev[pubId] || 0) + 1 }));
        // Remove dislike if it was disliked
        if (dislikedPubs[pubId]) {
          await undislikePub(userId, pubId);
          setDislikedPubs(prev => ({ ...prev, [pubId]: false }));
          setDislikeCounts(prev => ({
            ...prev,
            [pubId]: Math.max(0, (prev[pubId] || 1) - 1),
          }));
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleDislike = async (pubId: string, userId: string) => {
    if (!userId || !pubId) {
      console.error('Invalid userId or pubId:', { userId, pubId });
      return;
    }

    try {
      const currentlyDisliked = dislikedPubs[pubId] || false;

      if (currentlyDisliked) {
        // Remove dislike
        console.log('Removing dislike from pub:', pubId);
        await undislikePub(userId, pubId);
        setDislikedPubs(prev => ({ ...prev, [pubId]: false }));
        setDislikeCounts(prev => ({
          ...prev,
          [pubId]: Math.max(0, (prev[pubId] || 1) - 1),
        }));
      } else {
        // Dislike
        console.log('Disliking pub:', pubId);
        await dislikePub(userId, pubId);
        setDislikedPubs(prev => ({ ...prev, [pubId]: true }));
        setDislikeCounts(prev => ({
          ...prev,
          [pubId]: (prev[pubId] || 0) + 1,
        }));
        // Remove like if it was liked
        if (likedPubs[pubId]) {
          await unlikePub(userId, pubId);
          setLikedPubs(prev => ({ ...prev, [pubId]: false }));
          setLikeCounts(prev => ({
            ...prev,
            [pubId]: Math.max(0, (prev[pubId] || 1) - 1),
          }));
        }
      }
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPubs();
    }, [user])
  );

  // Calculate grid columns
  const getGridColumns = () => {
    if (viewMode === 'feed') {
      return isDesktop ? 2 : 1;
    }
    // Grid view
    if (isDesktop) return 4;
    return 3;
  };

  const numColumns = getGridColumns();
  const cardWidth =
    viewMode === 'feed'
      ? maxWidth / numColumns - 24
      : maxWidth / numColumns - 8;

  const renderFeedCard = ({ item }: { item: Pub }) => {
    const currentPhotoIndex = cardPhotoIndices[item.pubId] || 0;
    const hasMultiplePhotos = item.thumbnailUrls.length > 1;

    const handlePrevPhoto = () => {
      setCardPhotoIndices(prev => ({
        ...prev,
        [item.pubId]: Math.max(0, (prev[item.pubId] || 0) - 1),
      }));
    };

    const handleNextPhoto = () => {
      setCardPhotoIndices(prev => ({
        ...prev,
        [item.pubId]: Math.min(
          item.thumbnailUrls.length - 1,
          (prev[item.pubId] || 0) + 1
        ),
      }));
    };

    return (
      <TouchableOpacity
        style={[styles.feedCard, { width: cardWidth }]}
        onPress={() => navigation.navigate('PubDetail', { pub: item })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTextContainer}>
              {item.userProfile?.displayName && (
                <Text style={styles.displayName}>
                  {item.userProfile.displayName}
                </Text>
              )}
              <Text style={styles.pubName}>{item.pubName}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
            {item.userProfile?.profilePictureUrl ? (
              <Image
                source={{ uri: item.userProfile.profilePictureUrl }}
                style={styles.profilePicture}
              />
            ) : (
              <View style={[styles.profilePicture, styles.profilePictureEmpty]}>
                <Text style={styles.profilePictureText}>👤</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.photoContainer}>
          <Image
            source={{ uri: item.thumbnailUrls[currentPhotoIndex] }}
            style={styles.feedPhoto}
            resizeMode="cover"
          />

          {hasMultiplePhotos && (
            <>
              <TouchableOpacity
                style={[styles.photoNavButton, styles.photoNavLeft]}
                onPress={handlePrevPhoto}
                disabled={currentPhotoIndex === 0}
              >
                <Text style={styles.photoNavText}>‹</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.photoNavButton, styles.photoNavRight]}
                onPress={handleNextPhoto}
                disabled={currentPhotoIndex === item.thumbnailUrls.length - 1}
              >
                <Text style={styles.photoNavText}>›</Text>
              </TouchableOpacity>

              <View style={styles.photoDots}>
                {item.thumbnailUrls.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      index === currentPhotoIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            </>
          )}
        </View>

        {item.whatYouHad && (
          <Text style={styles.whatYouHad}>🍺 {item.whatYouHad}</Text>
        )}

        {item.visitDate && (
          <Text style={styles.visitDate}>
            📅{' '}
            {new Date(item.visitDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        )}

        <View style={styles.ratingsContainer}>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabelBold}>Value:</Text>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={styles.ratingIcon}>
                {i <= item.valueForMoney ? '£' : '○'}
              </Text>
            ))}
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabelBold}>Beer:</Text>
            {[1, 2, 3, 4, 5].map(i => (
              <Text key={i} style={styles.ratingIcon}>
                {i <= item.beerQuality ? '🍺' : '○'}
              </Text>
            ))}
          </View>
          {item.foodQuality && item.foodQuality > 0 && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingLabelBold}>Food:</Text>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={styles.ratingIcon}>
                  {i <= item.foodQuality! ? '🥧' : '○'}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.likesContainer}>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => {
              if (user?.uid) {
                handleToggleLike(item.pubId, user.uid);
              }
            }}
          >
            <Text style={styles.thumbIcon}>👍</Text>
            <Text style={styles.likeCount}>{likeCounts[item.pubId] || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dislikeButton}
            onPress={() => {
              if (user?.uid) {
                handleToggleDislike(item.pubId, user.uid);
              }
            }}
          >
            <Text style={styles.thumbIcon}>👎</Text>
            <Text style={styles.likeCount}>
              {dislikeCounts[item.pubId] || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderGridCard = ({ item }: { item: Pub }) => (
    <TouchableOpacity
      style={[styles.gridCard, { width: cardWidth, height: cardWidth }]}
      onPress={() => navigation.navigate('PubDetail', { pub: item })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.thumbnailUrls[0] }}
        style={styles.gridPhoto}
        resizeMode="cover"
      />
      {item.photoUrls.length > 1 && (
        <View style={styles.multiPhotoIndicator}>
          <Text style={styles.multiPhotoIcon}>⋮⋮</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pubs-tagram</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPub')}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0095F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {pubs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pubs yet!</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to add your first pub
          </Text>
        </View>
      ) : (
        <View style={[styles.contentContainer, { maxWidth }]}>
          <FlatList
            data={pubs}
            renderItem={viewMode === 'feed' ? renderFeedCard : renderGridCard}
            keyExtractor={item => item.pubId}
            key={viewMode + numColumns} // Force re-render on view change
            numColumns={numColumns}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={
              numColumns > 1 ? styles.columnWrapper : undefined
            }
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => (navigation as any).navigate('ProfileScreen')}
        >
          <Text style={styles.profileButtonText}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#262626',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggleText: {
    fontSize: 24,
    color: '#262626',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0095F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E8E',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  feedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  displayName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBDBDB',
    marginLeft: 12,
  },
  profilePictureEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 24,
  },
  pubName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#262626',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#8E8E8E',
  },
  feedPhoto: {
    width: '100%',
    height: 300,
    backgroundColor: '#FAFAFA',
  },
  photoContainer: {
    position: 'relative',
    width: '100%',
    height: 300,
  },
  photoNavButton: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  photoNavLeft: {
    left: 0,
  },
  photoNavRight: {
    right: 0,
  },
  photoNavText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  photoDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
  },
  whatYouHad: {
    fontSize: 14,
    color: '#262626',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  visitDate: {
    fontSize: 14,
    color: '#8E8E8E',
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
  },
  ratingsContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingLabelBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#262626',
    minWidth: 50,
  },
  ratingLabel: {
    fontSize: 16,
    width: 24,
  },
  ratingIcon: {
    fontSize: 16,
  },
  gridCard: {
    position: 'relative',
    backgroundColor: '#FAFAFA',
    margin: 2,
  },
  gridPhoto: {
    width: '100%',
    height: '100%',
  },
  multiPhotoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  multiPhotoIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  profileButton: {
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBDBDB',
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  signOutText: {
    color: '#262626',
    fontSize: 16,
  },
  likesContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    flexDirection: 'row',
    gap: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dislikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  thumbIcon: {
    fontSize: 20,
  },
  likeCount: {
    fontSize: 16,
    color: '#262626',
    fontWeight: '500',
  },
});

export default FeedScreen;
