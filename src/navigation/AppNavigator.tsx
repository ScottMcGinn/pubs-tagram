import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList } from '../types';
import { ActivityIndicator, View, StyleSheet, SafeAreaView } from 'react-native';

// Screens
import AuthScreen from '../screens/AuthScreen';
import FeedScreen from '../screens/FeedScreen';
import AddPubScreen from '../screens/AddPubScreen';
import PubDetailScreen from '../screens/PubDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Feed Stack Navigator
const FeedStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'My Pubs',
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen 
        name="PubDetail" 
        component={PubDetailScreen}
        options={{ headerTitle: 'Pub Details' }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: 'Profile',
        headerTintColor: '#007AFF',
      }}
    >
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen 
        name="UserProfile" 
        component={UserProfileScreen}
        options={{ headerTitle: 'User Profile' }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
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

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ animationEnabled: false }}
        />
      ) : (
        <Stack.Screen 
          name="Main" 
          component={MainTabNavigator}
          options={{ animationEnabled: false }}
        />
      )}
    </Stack.Navigator>
  );
};

// Main Tab Navigator (bottom tabs)
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="FeedTab" 
        component={FeedStackNavigator}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
          ),
        }}
      />
      <Tab.Screen 
        name="AddPubTab" 
        component={AddPubScreen}
        options={{
          tabBarLabel: 'Add Pub',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 50 }} />
          ),
        }}
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size / 2 }} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

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
