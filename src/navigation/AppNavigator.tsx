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
        <>
          <Stack.Screen 
            name="Feed" 
            component={FeedScreen}
            options={{ animationEnabled: false }}
          />
          <Stack.Screen
            name="AddPub"
            component={AddPubScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen name="PubDetail" component={PubDetailScreen} />
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
