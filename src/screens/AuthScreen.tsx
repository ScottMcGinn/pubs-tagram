import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const AuthScreen = () => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    if (isSignUp && !displayName) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={styles.icon}>🍺</Text>
          <Text style={styles.title}>Pubs-tagram</Text>
          <Text style={styles.subtitle}>Track Your Perfect Pints</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#B0B0B0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#B0B0B0"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="none"
                editable={!loading}
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? 'Already have an account? Sign In'
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#0095F6',
    borderRadius: 8,
    marginBottom: 16,
    marginTop: 8,
    padding: 15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    maxWidth: 400,
    width: '100%',
  },
  icon: {
    fontSize: 64,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FAFAFA',
    borderColor: '#DBDBDB',
    borderRadius: 8,
    borderWidth: 1,
    color: '#262626',
    fontSize: 16,
    marginBottom: 12,
    padding: 15,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  subtitle: {
    color: '#8E8E8E',
    fontSize: 16,
    marginBottom: 40,
  },
  switchText: {
    color: '#0095F6',
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    color: '#262626',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default AuthScreen;
