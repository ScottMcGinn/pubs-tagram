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
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Pub } from '../types';
import { getExplorePubs } from '../services/firestore';
import { useAuth } from '../contexts/AuthContext';

type ExploreNavigationProp = StackNavigationProp<RootStackParamList, 'Explore'>;

const NUM_COLUMNS = 3;

export const ExploreScreen: React.FC = () => {
  const navigation = useNavigation<ExploreNavigationProp>();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [pubs, setPubs] = useState<Pub[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const itemWidth = (width - 2) / NUM_COLUMNS; // Account for small gap

  useEffect(() => {
    loadExplorePubs();
  }, []);

  const loadExplorePubs = async () => {
    if (!user?.uid) return;
    try {
      setLoading(true);
      const explorePubs = await getExplorePubs(user.uid, 100);
      setPubs(explorePubs);
    } catch (error) {
      console.error('Error loading explore pubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExplorePubs();
    setRefreshing(false);
  };

  const renderPubCard = ({ item }: { item: Pub }) => (
    <TouchableOpacity
      style={[styles.pubCard, { width: itemWidth }]}
      onPress={() => navigation.navigate('PubDetail', { pub: item })}
      activeOpacity={0.8}
    >
      {item.photoUrls && item.photoUrls.length > 0 ? (
        <Image source={{ uri: item.photoUrls[0] }} style={styles.pubImage} />
      ) : (
        <View style={[styles.pubImage, styles.pubImageEmpty]}>
          <Text style={styles.pubImageEmptyText}>🍺</Text>
        </View>
      )}
      <View style={styles.pubInfo}>
        <Text style={styles.pubName} numberOfLines={1}>
          {item.pubName}
        </Text>
        {item.userProfile && (
          <Text style={styles.userName} numberOfLines={1}>
            {item.userProfile.displayName}
          </Text>
        )}
      </View>
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
      {pubs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pubs to explore</Text>
        </View>
      ) : (
        <FlatList
          data={pubs}
          renderItem={renderPubCard}
          keyExtractor={item => item.pubId}
          numColumns={NUM_COLUMNS}
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
  pubCard: {
    margin: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  pubImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F0F0F0',
  },
  pubImageEmpty: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pubImageEmptyText: {
    fontSize: 32,
  },
  pubInfo: {
    padding: 8,
  },
  pubName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userName: {
    fontSize: 11,
    color: '#666',
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
