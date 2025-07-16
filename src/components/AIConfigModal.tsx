import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aiHighlightingService } from '../utils/aiHighlightingService';

interface AIConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

const THEME_COLOR = '#008080';
const BLACK = '#111111';
const GRAY = '#6B6B6B';

export default function AIConfigModal({ visible, onClose }: AIConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [visible]);

  const loadSettings = async () => {
    try {
      const savedApiKey = await AsyncStorage.getItem('openai_api_key');
      const savedUseAI = await AsyncStorage.getItem('use_ai_highlighting');
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
      }
      
      if (savedUseAI !== null) {
        setUseAI(JSON.parse(savedUseAI));
      }
    } catch (error) {
      console.error('Failed to load AI settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Save API key
      if (apiKey.trim()) {
        await AsyncStorage.setItem('openai_api_key', apiKey.trim());
        aiHighlightingService.setApiKey(apiKey.trim());
      } else {
        await AsyncStorage.removeItem('openai_api_key');
      }
      
      // Save AI preference
      await AsyncStorage.setItem('use_ai_highlighting', JSON.stringify(useAI));
      
      Alert.alert(
        'Settings Saved',
        'AI highlighting and context generation settings have been updated successfully.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('Failed to save AI settings:', error);
      Alert.alert(
        'Error',
        'Failed to save settings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const testAPIKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key first.');
      return;
    }

    setIsLoading(true);
    try {
      // Test with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`
        }
      });

      if (response.ok) {
        Alert.alert(
          'Success',
          'API key is valid and working!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Invalid API Key',
          'The API key appears to be invalid. Please check and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to test API key. Please check your internet connection.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    aiHighlightingService.clearCache();
    Alert.alert(
      'Cache Cleared',
      'AI highlighting cache has been cleared.',
      [{ text: 'OK' }]
    );
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
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={BLACK} />
            </TouchableOpacity>
            <Text style={styles.title}>AI Highlighting Settings</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AI-Powered Highlighting</Text>
              <Text style={styles.sectionDescription}>
                Use artificial intelligence to intelligently identify the most important political terms in articles and generate comprehensive context explanations when you tap on highlighted terms.
              </Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Enable AI Highlighting</Text>
                <Switch
                  value={useAI}
                  onValueChange={setUseAI}
                  trackColor={{ false: '#f4f3f4', true: THEME_COLOR }}
                  thumbColor={useAI ? '#fff' : '#f4f3f4'}
                />
              </View>
            </View>

            {useAI && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>OpenAI Configuration</Text>
                <Text style={styles.sectionDescription}>
                  Provide your OpenAI API key for the most accurate AI highlighting and detailed context explanations. Without an API key, the app will use enhanced local intelligent patterns and comprehensive fallback context generation.
                </Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>OpenAI API Key</Text>
                  <TextInput
                    style={styles.input}
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder="sk-..."
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="openai-api-key-input"
                  />
                  <Text style={styles.inputHelp}>
                    Get your API key from platform.openai.com
                  </Text>
                </View>
                {/* Fallback message if input is not rendering */}
                {!TextInput && (
                  <Text style={{ color: 'red', marginTop: 8 }}>API key input failed to render. Please update your app or contact support.</Text>
                )}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.testButton]}
                    onPress={testAPIKey}
                    disabled={isLoading}
                  >
                    <Ionicons name="checkmark-circle-outline" size={16} color={THEME_COLOR} />
                    <Text style={[styles.buttonText, styles.testButtonText]}>Test API Key</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={clearCache}
                    disabled={isLoading}
                  >
                    <Ionicons name="trash-outline" size={16} color={GRAY} />
                    <Text style={[styles.buttonText, styles.clearButtonText]}>Clear Cache</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How It Works</Text>
              <View style={styles.featureList}>
                <View style={styles.feature}>
                  <Ionicons name="bulb-outline" size={20} color={THEME_COLOR} />
                  <Text style={styles.featureText}>
                    AI analyzes context to identify the most relevant political terms
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="star-outline" size={20} color={THEME_COLOR} />
                  <Text style={styles.featureText}>
                    Terms are scored by relevance and importance
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="filter-outline" size={20} color={THEME_COLOR} />
                  <Text style={styles.featureText}>
                    Generic words and common phrases are automatically filtered out
                  </Text>
                </View>
                <View style={styles.feature}>
                  <Ionicons name="flash-outline" size={20} color={THEME_COLOR} />
                  <Text style={styles.featureText}>
                    Fast local fallback when API is unavailable
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={saveSettings}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Text>
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
    width: '95%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 20,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_500Medium',
    color: BLACK,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
  },
  inputHelp: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  testButton: {
    backgroundColor: 'rgba(0, 128, 128, 0.1)',
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  clearButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
  },
  testButtonText: {
    color: THEME_COLOR,
  },
  clearButtonText: {
    color: GRAY,
  },
  featureList: {
    gap: 12,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
});