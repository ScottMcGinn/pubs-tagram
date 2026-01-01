import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
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
        headerShown: true,
        headerTintColor: '#007AFF',
      }}
    >
      {!user ? (
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen}
          options={{ headerShown: false, animationEnabled: false }}
        />
      ) : (
        <>
          <Stack.Screen 
            name="Feed" 
            component={FeedScreen}
            options={{ headerTitle: 'My Pubs' }}
          />
          <Stack.Screen 
            name="PubDetail" 
            component={PubDetailScreen}
            options={{ headerTitle: 'Pub Details' }}
          />
          <Stack.Screen 
            name="AddPub" 
            component={AddPubScreen}
            options={{ headerTitle: 'Add Pub' }}
          />
          <Stack.Screen 
            name="ProfileScreen" 
            component={ProfileScreen}
            options={{ headerTitle: 'Profile' }}
          />
          <Stack.Screen 
            name="UserProfile" 
            component={UserProfileScreen}
            options={{ headerTitle: 'User Profile' }}
          />
        </>
      )}
    </Stack.Navigator>
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
