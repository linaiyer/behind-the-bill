import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator
} from 'react-native';
import { authService } from '../services/authService';
import { NewsSubscription } from '../types/auth';

const BLACK = '#111111';
const GRAY = '#6B6B6B';
const THEME_COLOR = '#008080';

const NEWS_PROVIDERS = [
  { id: 'nytimes', name: 'The New York Times', requiresAuth: true },
  { id: 'washingtonpost', name: 'The Washington Post', requiresAuth: true },
  { id: 'wsj', name: 'The Wall Street Journal', requiresAuth: true },
  { id: 'cnn', name: 'CNN', requiresAuth: false },
  { id: 'bbc', name: 'BBC News', requiresAuth: false },
  { id: 'reuters', name: 'Reuters', requiresAuth: false },
];

export default function NewsSubscriptionsScreen() {
  const [subscriptions, setSubscriptions] = useState<NewsSubscription[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setSubscriptions(user.newsSubscriptions || []);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  const handleAddSubscription = async () => {
    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a news provider');
      return;
    }

    const provider = NEWS_PROVIDERS.find(p => p.id === selectedProvider);
    if (!provider) return;

    if (provider.requiresAuth && !apiKey && !username) {
      Alert.alert('Error', 'Please provide authentication credentials');
      return;
    }

    setIsLoading(true);
    try {
      await authService.addNewsSubscription({
        provider: selectedProvider,
        apiKey: apiKey || undefined,
        username: username || undefined,
        isActive: true,
      });

      await loadSubscriptions();
      setShowAddModal(false);
      resetForm();
      Alert.alert('Success', 'News subscription added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add subscription. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveSubscription = async (subscriptionId: string) => {
    Alert.alert(
      'Remove Subscription',
      'Are you sure you want to remove this subscription?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.removeNewsSubscription(subscriptionId);
              await loadSubscriptions();
            } catch (error) {
              Alert.alert('Error', 'Failed to remove subscription');
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setSelectedProvider('');
    setApiKey('');
    setUsername('');
  };

  const getProviderName = (providerId: string) => {
    const provider = NEWS_PROVIDERS.find(p => p.id === providerId);
    return provider?.name || providerId;
  };

  const renderSubscriptionItem = (subscription: NewsSubscription) => (
    <View key={subscription.id} style={styles.subscriptionItem}>
      <View style={styles.subscriptionInfo}>
        <Text style={styles.subscriptionName}>
          {getProviderName(subscription.provider)}
        </Text>
        <Text style={styles.subscriptionDate}>
          Added {subscription.addedAt.toLocaleDateString()}
        </Text>
        <View style={styles.subscriptionStatus}>
          <View style={[
            styles.statusDot,
            { backgroundColor: subscription.isActive ? '#22c55e' : '#ef4444' }
          ]} />
          <Text style={styles.statusText}>
            {subscription.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveSubscription(subscription.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAddModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add News Subscription</Text>
          
          <Text style={styles.fieldLabel}>Select News Provider</Text>
          <ScrollView style={styles.providerList} showsVerticalScrollIndicator={false}>
            {NEWS_PROVIDERS.map(provider => (
              <TouchableOpacity
                key={provider.id}
                style={[
                  styles.providerItem,
                  selectedProvider === provider.id && styles.selectedProvider
                ]}
                onPress={() => setSelectedProvider(provider.id)}
              >
                <Text style={[
                  styles.providerName,
                  selectedProvider === provider.id && styles.selectedProviderText
                ]}>
                  {provider.name}
                </Text>
                {provider.requiresAuth && (
                  <Text style={styles.authRequired}>Requires Authentication</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedProvider && NEWS_PROVIDERS.find(p => p.id === selectedProvider)?.requiresAuth && (
            <View style={styles.authFields}>
              <Text style={styles.fieldLabel}>API Key or Username</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter API key or username"
                value={apiKey || username}
                onChangeText={(text) => {
                  if (text.includes('key') || text.length > 20) {
                    setApiKey(text);
                    setUsername('');
                  } else {
                    setUsername(text);
                    setApiKey('');
                  }
                }}
                secureTextEntry={true}
              />
              <Text style={styles.helpText}>
                This will be used to access your subscription content
              </Text>
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddSubscription}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>News Subscriptions</Text>
        <Text style={styles.subtitle}>
          Connect your news subscriptions to see more personalized content
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No subscriptions yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your news subscriptions to get articles from your favorite sources
            </Text>
          </View>
        ) : (
          <View style={styles.subscriptionsList}>
            {subscriptions.map(renderSubscriptionItem)}
          </View>
        )}

        <TouchableOpacity
          style={styles.addSubscriptionButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addSubscriptionButtonText}>+ Add Subscription</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderAddModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 64,
    paddingHorizontal: 28,
    paddingBottom: 20,
  },
  title: {
    fontSize: 36,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: GRAY,
    fontFamily: 'WorkSans_400Regular',
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  subscriptionsList: {
    paddingVertical: 20,
  },
  subscriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 4,
  },
  subscriptionDate: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginBottom: 8,
  },
  subscriptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'WorkSans_500Medium',
    color: GRAY,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  removeButtonText: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
  addSubscriptionButton: {
    backgroundColor: THEME_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 100,
  },
  addSubscriptionButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
  modalOverlay: {
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    marginBottom: 24,
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 12,
  },
  providerList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  providerItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  selectedProvider: {
    borderColor: THEME_COLOR,
    backgroundColor: '#f0f9ff',
  },
  providerName: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 4,
  },
  selectedProviderText: {
    color: THEME_COLOR,
  },
  authRequired: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  authFields: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GRAY,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: GRAY,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
});