import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </UserProvider>
    </AuthProvider>
  );
}
