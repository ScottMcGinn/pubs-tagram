import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import FeedScreen from '../../src/screens/FeedScreen';
import { ProfileScreen } from '../../src/screens/ProfileScreen';
import AddPubScreen from '../../src/screens/AddPubScreen';
import PubDetailScreen from '../../src/screens/PubDetailScreen';
import { SearchScreen } from '../../src/screens/SearchScreen';
import { UserProfileScreen } from '../../src/screens/UserProfileScreen';
import { FollowersListScreen } from '../../src/screens/FollowersListScreen';
import { FollowingListScreen } from '../../src/screens/FollowingListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function FeedStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="feed-index"
        component={FeedScreen}
        options={{
          title: 'Pubs-tagram',
          headerShown: true,
          headerRight: ({ tintColor }: any) => (
            <View
              style={{
                flexDirection: 'row',
                marginRight: 16,
                gap: 12,
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() =>
                  // Using React Navigation for stack navigation within tabs
                  (null as any)
                }
              >
                <Text style={{ fontSize: 20, color: tintColor }}>🔍</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#007AFF',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}
                >
                  Add Pub
                </Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="add-pub"
        component={AddPubScreen}
        options={{
          title: 'Add Pub',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="pub-detail"
        component={PubDetailScreen}
        options={{
          title: 'Pub Details',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="search"
        component={SearchScreen}
        options={{
          title: 'Search Users',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="user-profile"
        component={UserProfileScreen}
        options={{
          title: 'User Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="followers-list"
        component={FollowersListScreen}
        options={{
          title: 'Followers',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="following-list"
        component={FollowingListScreen}
        options={{
          title: 'Following',
          headerShown: true,
        }}
      />
    </Stack.Navigator>
  );
}

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e5e5ea',
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="index"
        component={FeedStack}
        options={{
          title: 'Feed',
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color }: any) => (
            <Text style={{ fontSize: 20, color }}>⊞</Text>
          ),
        }}
      />
      <Tab.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }: any) => (
            <Text style={{ fontSize: 20, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

