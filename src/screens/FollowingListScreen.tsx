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
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserProfile } from '../types';
import { getFollowingList } from '../services/userProfiles';

type FollowingListScreenRouteProp = any;
type FollowingListNavigationProp = StackNavigationProp<
  RootStackParamList,
  'FollowingList'
>;

export const FollowingListScreen: React.FC = () => {
  const route = useRoute<FollowingListScreenRouteProp>();
  const navigation = useNavigation<FollowingListNavigationProp>();
  const { userId } = route.params || {};

  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFollowing();
  }, [userId]);

  const loadFollowing = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const list = await getFollowingList(userId);
      setFollowing(list);
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderFollowingCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.followingCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
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
          {item.bio && (
            <Text style={styles.bio} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

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
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Following</Text>
        <View style={{ width: 40 }} />
      </View>

      {following.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Not following anyone yet</Text>
        </View>
      ) : (
        <FlatList
          data={following}
          renderItem={renderFollowingCard}
          keyExtractor={item => item.uid}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: -8,
    width: 44,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 28,
  },
  bio: {
    color: '#666',
    fontSize: 13,
  },
  cardContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  chevron: {
    color: '#999',
    fontSize: 24,
    marginLeft: 8,
  },
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  displayName: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  },
  followingCard: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#E5E5EA',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  profilePicture: {
    borderRadius: 24,
    height: 48,
    marginRight: 12,
    width: 48,
  },
  profilePictureEmpty: {
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
  },
  profilePictureText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
});
