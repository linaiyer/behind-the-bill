import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import { authService } from '../services/authService';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const THEME_COLOR = '#008080';
const BLACK = '#111111';
const GRAY = '#6B6B6B';

export default function AuthModal({ visible, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.signInWithEmail(email.trim(), password, isSignUp);
      if (user) {
        onAuthSuccess();
        onClose();
        // Reset form
        setEmail('');
        setPassword('');
        setIsSignUp(false);
      }
    } catch (error: any) {
      console.error('Auth modal error:', error);
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message && error.message.includes('offline')) {
        errorMessage = 'You appear to be offline. Please check your internet connection.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      Alert.alert(
        isSignUp ? 'Sign Up Error' : 'Sign In Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome to Behind the Bill</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create an account to get started' : 'Sign in to access your personalized settings'}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.benefitsList}>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>📰</Text>
                <Text style={styles.benefitText}>Connect your news subscriptions</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>⚙️</Text>
                <Text style={styles.benefitText}>Customize your preferences</Text>
              </View>
              <View style={styles.benefit}>
                <Text style={styles.benefitIcon}>🔄</Text>
                <Text style={styles.benefitText}>Sync across devices</Text>
              </View>
            </View>

            <View style={styles.formContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={styles.authButton}
              onPress={handleEmailAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={toggleMode}
              disabled={isLoading}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  content: {
    alignItems: 'center',
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    flex: 1,
  },
  formContainer: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 16,
    color: BLACK,
  },
  authButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  authButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
  switchButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: THEME_COLOR,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
});