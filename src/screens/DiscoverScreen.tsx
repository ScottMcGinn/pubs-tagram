import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserProfile } from '../types';
import { getSuggestedUsers, followUser, unfollowUser, isFollowing } from '../services/userProfiles';
import { useAuth } from '../contexts/AuthContext';

type DiscoverNavigationProp = StackNavigationProp<RootStackParamList, 'Discover'>;

interface UserWithFollowState extends UserProfile {
  isFollowing?: boolean;
}

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<DiscoverNavigationProp>();
  const { user } = useAuth();

  const [suggestedUsers, setSuggestedUsers] = useState<UserWithFollowState[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSuggestedUsers();
  }, []);

  const loadSuggestedUsers = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const users = await getSuggestedUsers(user.uid, 30);
      
      // Check follow status for each user
      const followMap: Record<string, boolean> = {};
      for (const u of users) {
        followMap[u.uid] = await isFollowing(user.uid, u.uid);
      }
      setFollowingMap(followMap);
      setSuggestedUsers(users);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSuggestedUsers();
    setRefreshing(false);
  };

  const handleFollowToggle = async (userId: string) => {
    if (!user?.uid) return;

    try {
      const isCurrentlyFollowing = followingMap[userId];
      
      if (isCurrentlyFollowing) {
        await unfollowUser(user.uid, userId);
      } else {
        await followUser(user.uid, userId);
      }

      // Update local state
      setFollowingMap(prev => ({
        ...prev,
        [userId]: !isCurrentlyFollowing,
      }));
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const renderUserCard = ({ item }: { item: UserWithFollowState }) => {
    const isCurrentlyFollowing = followingMap[item.uid] || false;

    return (
      <View style={styles.userCard}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
          activeOpacity={0.7}
        >
          {item.profilePictureUrl ? (
            <Image
              source={{ uri: item.profilePictureUrl }}
              style={styles.profilePicture}
            />
          ) : (
            <View style={[styles.profilePicture, styles.profilePictureEmpty]}>
              <Text style={styles.profilePictureText}>
                {item.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.displayName}>{item.displayName}</Text>
            {item.bio && <Text style={styles.bio} numberOfLines={2}>{item.bio}</Text>}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.followButton,
            isCurrentlyFollowing && styles.unfollowButton,
          ]}
          onPress={() => handleFollowToggle(item.uid)}
        >
          <Text
            style={[
              styles.followButtonText,
              isCurrentlyFollowing && styles.unfollowButtonText,
            ]}
          >
            {isCurrentlyFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
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

  return (
    <SafeAreaView style={styles.container}>
      {suggestedUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No more suggestions right now</Text>
        </View>
      ) : (
        <FlatList
          data={suggestedUsers}
          renderItem={renderUserCard}
          keyExtractor={item => item.uid}
          scrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 12,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF',
  },
  headerContent: {
    flex: 1,
    paddingLeft: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  profilePictureEmpty: {
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: '#666',
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#0095F6',
    borderRadius: 8,
    marginLeft: 12,
  },
  unfollowButton: {
    backgroundColor: '#E5E5EA',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  unfollowButtonText: {
    color: '#262626',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
