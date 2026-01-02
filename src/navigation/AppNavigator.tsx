import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { ActivityIndicator, View, StyleSheet, Text, SafeAreaView, TouchableOpacity } from 'react-native';

// Screens
import AuthScreen from '../screens/AuthScreen';
import FeedScreen from '../screens/FeedScreen';
import AddPubScreen from '../screens/AddPubScreen';
import PubDetailScreen from '../screens/PubDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { FollowersListScreen } from '../screens/FollowersListScreen';
import { FollowingListScreen } from '../screens/FollowingListScreen';
import { ExploreScreen } from '../screens/ExploreScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e5ea',
          borderTopWidth: 1,
        },
      })}
    >
      <Tab.Screen
        name="FeedTab"
        component={FeedScreen}
        options={({ navigation }) => ({
          title: 'Pubs-tagram',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⊞</Text>,
          headerRight: () => (
            <View style={{ flexDirection: 'row', marginRight: 16, gap: 12, alignItems: 'center' }}>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Text style={{ fontSize: 20 }}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddPub')}
                style={{
                  backgroundColor: '#007AFF',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>Add Pub</Text>
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverScreen}
        options={{
          title: 'Discover',
          headerShown: true,
          tabBarLabel: 'Discover',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>⭐</Text>,
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreScreen}
        options={{
          title: 'Explore',
          headerShown: true,
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="Auth" 
        component={AuthScreen}
        options={{ animationEnabled: false }}
      />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={AppTabs} />
      <Stack.Screen name="AddPub" component={AddPubScreen} options={{ title: 'Add Pub', headerShown: true }} />
      <Stack.Screen name="PubDetail" component={PubDetailScreen} options={{ title: 'Pub Details', headerShown: true }} />
      <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Users', headerShown: true }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'User Profile', headerShown: true }} />
      <Stack.Screen name="FollowersList" component={FollowersListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="FollowingList" component={FollowingListScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Discover" component={DiscoverScreen} options={{ title: 'Discover', headerShown: true }} />
      <Stack.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore', headerShown: true }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile', headerShown: true }} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#0095F6" />
        </View>
      </SafeAreaView>
    );
  }

  return user ? <AppStack /> : <AuthStack />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;
