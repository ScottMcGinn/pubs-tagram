import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, UserProfile } from '../types';
import { searchUsers, getFollowersCount } from '../services/userProfiles';
import { useAuth } from '../contexts/AuthContext';

type SearchNavigationProp = StackNavigationProp<RootStackParamList, 'Feed'>;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchNavigationProp>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<
    (UserProfile & { followersCount?: number })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (searchTerm.trim().length === 0) {
      setResults([]);
      setSearched(false);
      return;
    }

    const delaySearch = setTimeout(async () => {
      await performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  // Refresh results when screen comes into focus (after following someone)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (searchTerm.trim().length > 0) {
        performSearch();
      }
    });

    return unsubscribe;
  }, [navigation, searchTerm]);

  const performSearch = async () => {
    try {
      setLoading(true);
      setSearched(true);
      const searchResults = await searchUsers(searchTerm, 50);
      // Filter out current user
      const filtered = searchResults.filter(u => u.uid !== user?.uid);

      // Fetch follower counts for all results
      const counts: Record<string, number> = {};
      for (const user of filtered) {
        counts[user.uid] = await getFollowersCount(user.uid);
      }

      // Add follower counts to results
      const resultsWithCounts = filtered.map(u => ({
        ...u,
        followersCount: counts[u.uid],
      }));
      setResults(resultsWithCounts);
    } catch (error) {
      console.error('Error searching users:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const renderUserCard = ({ item }: { item: UserProfile }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => navigation.navigate('UserProfile', { userId: item.uid })}
      activeOpacity={0.7}
    >
      <View style={styles.userCardContent}>
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
          <Text style={styles.followersCount}>
            {(item as any).followersCount || 0} followers
          </Text>
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

  const emptyMessage = searched ? (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {loading ? 'Searching...' : 'No users found'}
      </Text>
    </View>
  ) : (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>🔍</Text>
      <Text style={styles.emptySubtext}>Search for users to follow</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#8E8E8E"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {results.length === 0 ? (
        emptyMessage
      ) : (
        <FlatList
          data={results}
          renderItem={renderUserCard}
          keyExtractor={item => item.uid}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bio: {
    color: '#666',
    fontSize: 12,
  },
  chevron: {
    color: '#DBDBDB',
    fontSize: 24,
    marginLeft: 8,
  },
  clearButton: {
    color: '#8E8E8E',
    fontSize: 18,
    paddingLeft: 8,
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  displayName: {
    color: '#262626',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptySubtext: {
    color: '#8E8E8E',
    fontSize: 14,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  followersCount: {
    color: '#8E8E8E',
    fontSize: 12,
    marginBottom: 4,
  },
  header: {
    borderBottomColor: '#DBDBDB',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profilePicture: {
    backgroundColor: '#E5E5EA',
    borderRadius: 25,
    height: 50,
    width: 50,
  },
  profilePictureEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePictureText: {
    color: '#666',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    color: '#262626',
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  userCard: {
    alignItems: 'center',
    borderBottomColor: '#F0F0F0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userCardContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
});
