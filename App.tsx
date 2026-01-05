import React from 'react';
console.log('[App] Import 1: React loaded');

import { View, Text, ScrollView } from 'react-native';
console.log('[App] Import 2: React Native components loaded');

import * as Updates from 'expo-updates';
console.log('[App] Import 3: Expo Updates loaded');

import { StatusBar } from 'expo-status-bar';
console.log('[App] Import 4: StatusBar loaded');

import { GestureHandlerRootView } from 'react-native-gesture-handler';
console.log('[App] Import 5: GestureHandlerRootView loaded');

import * as Linking from 'expo-linking';
console.log('[App] Import 6: Linking loaded');

import { NavigationContainer } from '@react-navigation/native';
console.log('[App] Import 7: NavigationContainer loaded');

import * as SplashScreen from 'expo-splash-screen';
console.log('[App] Import 8: SplashScreen loaded');

const linking = {
  prefixes: [Linking.createURL('/'), 'pubstagram://', 'exp://'],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: 'feed',
          profile: 'profile',
        },
      },
      '(stack)': {
        screens: {
          'add-pub': 'add-pub',
          'pub-detail': 'pub-detail/:pubId',
          search: 'search',
          'user-profile': 'user/:userId',
          'followers-list': 'followers/:userId',
          'following-list': 'following/:userId',
          discover: 'discover',
          explore: 'explore',
        },
      },
    },
  },
};

// Catch errors at module import time
console.log('[App] App.tsx module loading');

try {
  console.log('[App] Importing services...');
  require('./src/services/firebase');
  console.log('[App] Firebase service imported');
} catch (error: any) {
  console.error('[App] FAILED to import Firebase:', error?.message);
}

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
    <NavigationContainer linking={linking} fallback={<View />}>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

// Component to handle Expo Updates initialization and periodic checks
function UpdatesWrapper({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const checkForUpdates = async () => {
      try {
        console.log('[Updates] Checking for updates...');
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          console.log('[Updates] Update available, fetching...');
          await Updates.fetchUpdateAsync();

          // Notify the app that an update is available
          // This can be accessed via a context or event listener
          console.log('[Updates] Update fetched successfully');
        } else {
          console.log('[Updates] App is up to date');
        }
      } catch (error) {
        console.error('[Updates] Error checking for updates:', error);
      }
    };

    // Check for updates on app startup
    checkForUpdates();

    // Optionally set up periodic checks (every 60 minutes)
    const checkInterval = setInterval(checkForUpdates, 60 * 60 * 1000);

    return () => clearInterval(checkInterval);
  }, []);

  return <>{children}</>;
}

export default function App() {
  console.log('[App] App component rendering');

  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ErrorBoundary>
          <UpdatesWrapper>
            <AppContent />
          </UpdatesWrapper>
        </ErrorBoundary>
      </GestureHandlerRootView>
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
