import React from 'react';
console.log('[App] Import 1: React loaded');

import { NavigationContainer } from '@react-navigation/native';
console.log('[App] Import 2: NavigationContainer loaded');

import { StatusBar } from 'expo-status-bar';
console.log('[App] Import 3: StatusBar loaded');

import { AuthProvider } from './src/contexts/AuthContext';
console.log('[App] Import 4: AuthProvider loaded');

import { UserProvider } from './src/contexts/UserContext';
console.log('[App] Import 5: UserProvider loaded');

import AppNavigator from './src/navigation/AppNavigator';
console.log('[App] Import 6: AppNavigator loaded');

import { View, Text, ScrollView } from 'react-native';
console.log('[App] Import 7: React Native components loaded');

// Catch errors at module import time
console.log('[App] App.tsx module loading');

try {
  console.log('[App] Importing services...');
  require('./src/services/firebase');
  console.log('[App] Firebase service imported');
} catch (error: any) {
  console.error('[App] FAILED to import Firebase:', error?.message);
}

class ErrorBoundary extends React.Component<any, { hasError: boolean; error: Error | null; errorInfo: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error Info:', errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack || '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
          <ScrollView style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 10 }}>
              Crash Error:
            </Text>
            <Text style={{ fontSize: 14, color: '#333', marginBottom: 20 }}>
              {this.state.error?.message || 'Unknown error'}
            </Text>
            <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>
              {this.state.error?.toString()}
            </Text>
            <Text style={{ fontSize: 12, color: '#999' }}>
              {this.state.errorInfo}
            </Text>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  console.log('[App] AppContent rendering');
  
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  console.log('[App] App component rendering');
  
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error: any) {
    console.error('[App] Top-level render error:', error);
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: 50 }}>
        <ScrollView style={{ padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'red' }}>
            App Failed to Initialize
          </Text>
          <Text style={{ fontSize: 14, marginTop: 10 }}>
            {error?.message}
          </Text>
        </ScrollView>
      </View>
    );
  }
}
