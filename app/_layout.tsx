import React from 'react';
import { Stack } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { useUser } from '../src/contexts/UserContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { UserProvider } from '../src/contexts/UserContext';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';

// This is the inner layout that requires auth context
function RootLayoutNav() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0095F6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // App routes - authenticated user
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      ) : (
        // Auth routes - unauthenticated user
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}

// Root layout with context providers
export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </AuthProvider>
  );
}
