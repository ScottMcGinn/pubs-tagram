import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { View, Text, ScrollView } from 'react-native';

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

export default function App() {
  console.log('[App] App component rendering');
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <AppNavigator />
          </NavigationContainer>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
