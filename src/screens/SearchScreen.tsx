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
  const [results, setResults] = useState<(UserProfile & { followersCount?: number })[]>([]);
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
            {item.followersCount || 0} followers
          </Text>
          {item.bio && <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text>}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DBDBDB',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#262626',
    paddingVertical: 4,
  },
  clearButton: {
    fontSize: 18,
    color: '#8E8E8E',
    paddingLeft: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E5EA',
  },
  profilePictureEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePictureText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  followersCount: {
    fontSize: 12,
    color: '#8E8E8E',
    marginBottom: 4,
  },
  bio: {
    fontSize: 12,
    color: '#666',
  },
  chevron: {
    fontSize: 24,
    color: '#DBDBDB',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E8E',
  },
});
