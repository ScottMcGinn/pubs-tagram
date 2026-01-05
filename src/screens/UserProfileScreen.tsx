import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  Image,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Pub } from '../types';
import { useUser } from '../contexts/UserContext';
import { ProfileHeader } from '../components/Profile/ProfileHeader';
import { getUserPubs } from '../services/firestore';
import { getFollowersCount, getFollowingCount } from '../services/userProfiles';

type UserProfileScreenRouteProp = any;
type UserProfileNavigationProp = StackNavigationProp<
  RootStackParamList,
  'UserProfile'
>;

type TabType = 'grid' | 'feed';

export const UserProfileScreen: React.FC = () => {
  const route = useRoute<UserProfileScreenRouteProp>();
  const navigation = useNavigation<UserProfileNavigationProp>();
  const { userId } = route.params || {};
  const { width } = useWindowDimensions();

  const {
    otherUserProfile,
    loading,
    loadUserProfile,
    loadCurrentUserProfile,
    isFollowingUser,
    toggleFollowUser,
  } = useUser();
  const [pubs, setPubs] = useState<Pub[]>([]);
  const [pubsLoading, setPubsLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('grid');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (userId) {
      loadUserProfile(userId);
      loadUserPubs();
      loadFollowCounts();
    }
  }, [userId]);

  const loadFollowCounts = async () => {
    if (!userId) return;
    try {
      const followers = await getFollowersCount(userId);
      const following = await getFollowingCount(userId);
      setFollowersCount(followers);
      setFollowingCount(following);
    } catch (error) {
      console.error('Error loading follow counts:', error);
    }
  };

  const handleFollowersPress = () => {
    if (userId) {
      navigation.navigate('FollowersList', { userId });
    }
  };

  const handleFollowingPress = () => {
    if (userId) {
      navigation.navigate('FollowingList', { userId });
    }
  };

  const loadUserPubs = async () => {
    if (!userId) return;
    try {
      setPubsLoading(true);
      const userPubs = await getUserPubs(userId);
      setPubs(userPubs);
    } catch (error) {
      console.error('Error loading user pubs:', error);
    } finally {
      setPubsLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!otherUserProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>User not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <ProfileHeader
          profile={otherUserProfile}
          editingMode={false}
          followersCount={followersCount}
          followingCount={followingCount}
          onFollowersPress={handleFollowersPress}
          onFollowingPress={handleFollowingPress}
        />

        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.followButton,
              isFollowingUser && styles.followingButton,
            ]}
            onPress={async () => {
              try {
                setFollowLoading(true);
                await toggleFollowUser(userId);
                // Reload follow counts after action
                await loadFollowCounts();
                // Also reload current user profile to update their following count
                await loadCurrentUserProfile();
              } catch (error) {
                console.error('Error toggling follow:', error);
              } finally {
                setFollowLoading(false);
              }
            }}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator
                size="small"
                color={isFollowingUser ? '#262626' : '#FFFFFF'}
              />
            ) : (
              <Text
                style={[
                  styles.followButtonText,
                  isFollowingUser && styles.followingButtonText,
                ]}
              >
                {isFollowingUser ? 'Following' : 'Follow'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.blockButton}>
            <Text style={styles.blockButtonText}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'grid' && styles.tabActive]}
            onPress={() => setActiveTab('grid')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'grid' && styles.tabTextActive,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'feed' && styles.tabActive]}
            onPress={() => setActiveTab('feed')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'feed' && styles.tabTextActive,
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </View>

        {/* Grid View */}
        {activeTab === 'grid' && (
          <View style={styles.gridContainer}>
            {pubsLoading ? (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={styles.loader}
              />
            ) : pubs.length === 0 ? (
              <Text style={styles.emptyMessage}>No pubs yet</Text>
            ) : (
              <View style={styles.grid}>
                {pubs.map(pub => (
                  <TouchableOpacity
                    key={pub.pubId}
                    style={styles.gridItem}
                    onPress={() => navigation.navigate('PubDetail', { pub })}
                  >
                    <Image
                      source={{ uri: pub.thumbnailUrls[0] }}
                      style={styles.gridImage}
                    />
                    {pub.thumbnailUrls.length > 1 && (
                      <View style={styles.multiPhotoIndicator}>
                        <Text style={styles.multiPhotoIcon}>📸</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Feed View */}
        {activeTab === 'feed' && (
          <View style={styles.feedContainer}>
            {pubsLoading ? (
              <ActivityIndicator
                size="large"
                color="#007AFF"
                style={styles.loader}
              />
            ) : pubs.length === 0 ? (
              <Text style={styles.emptyMessage}>No pubs yet</Text>
            ) : (
              <View style={{ paddingBottom: 20 }}>
                {pubs.map(pub => (
                  <TouchableOpacity
                    key={pub.pubId}
                    style={styles.feedCard}
                    onPress={() => navigation.navigate('PubDetail', { pub })}
                    activeOpacity={0.9}
                  >
                    <View style={styles.feedCardContent}>
                      <Image
                        source={{ uri: pub.thumbnailUrls[0] }}
                        style={styles.feedCardImage}
                      />
                      <View style={styles.feedCardInfo}>
                        <Text style={styles.feedCardTitle}>{pub.pubName}</Text>
                        <Text style={styles.feedCardLocation}>
                          {pub.location}
                        </Text>
                        {pub.whatYouHad && (
                          <Text style={styles.feedCardHad}>
                            🍺 {pub.whatYouHad}
                          </Text>
                        )}
                        <View style={styles.feedCardRatings}>
                          <Text style={styles.rating}>
                            🍻 {pub.beerQuality}/5
                          </Text>
                          <Text style={styles.rating}>
                            💷 {pub.valueForMoney}/5
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  blockButton: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    flex: 0.4,
    paddingVertical: 12,
  },
  blockButtonText: {
    color: '#262626',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  emptyMessage: {
    color: '#8E8E8E',
    fontSize: 14,
    paddingVertical: 40,
    textAlign: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginBottom: 16,
  },
  feedCard: {
    borderColor: '#DBDBDB',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  feedCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  feedCardHad: {
    color: '#262626',
    fontSize: 13,
    marginBottom: 6,
  },
  feedCardImage: {
    backgroundColor: '#FAFAFA',
    height: 100,
    width: 100,
  },
  feedCardInfo: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  feedCardLocation: {
    color: '#8E8E8E',
    fontSize: 13,
    marginBottom: 6,
  },
  feedCardRatings: {
    gap: 4,
  },
  feedCardTitle: {
    color: '#262626',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  feedContainer: {
    padding: 0,
  },
  followButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  followingButton: {
    backgroundColor: '#F0F0F0',
  },
  followingButtonText: {
    color: '#262626',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridContainer: {
    padding: 4,
  },
  gridImage: {
    backgroundColor: '#FAFAFA',
    height: '100%',
    width: '100%',
  },
  gridItem: {
    aspectRatio: 1,
    padding: 2,
    position: 'relative',
    width: '33.33%',
  },
  loader: {
    marginVertical: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  multiPhotoIcon: {
    fontSize: 12,
  },
  multiPhotoIndicator: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 6,
    top: 6,
    width: 24,
  },
  rating: {
    color: '#8E8E8E',
    fontSize: 12,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 3,
    flex: 1,
    paddingVertical: 12,
  },
  tabActive: {
    borderBottomColor: '#262626',
  },
  tabContainer: {
    borderBottomColor: '#DBDBDB',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabText: {
    color: '#8E8E8E',
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#262626',
  },
});
