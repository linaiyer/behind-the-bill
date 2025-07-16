import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserPreferences {
  interests: string[];
  privacy: {
    analytics: boolean;
    personalization: boolean;
  };
  display: {
    darkMode: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  privacy: {
    analytics: true,
    personalization: true
  },
  display: {
    darkMode: false,
    fontSize: 'medium'
  }
};

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('user_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem('user_preferences', JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }, []);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...updates };
    return await savePreferences(updated);
  }, [preferences, savePreferences]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    updatePreferences,
    savePreferences,
    loadPreferences
  };
};

// Font size scaling based on user preference
export const getFontScale = (fontSize: 'small' | 'medium' | 'large'): number => {
  switch (fontSize) {
    case 'small': return 0.9;
    case 'medium': return 1.0;
    case 'large': return 1.2;
    default: return 1.0;
  }
};

// Theme colors based on dark mode preference
export const getThemeColors = (darkMode: boolean) => {
  if (darkMode) {
    return {
      background: '#1a1a1a',
      text: '#ffffff',
      secondaryText: '#cccccc',
      border: '#333333',
      card: '#2a2a2a',
      primary: '#008080'
    };
  }
  
  return {
    background: '#ffffff',
    text: '#111111',
    secondaryText: '#6B6B6B',
    border: '#f0f0f0',
    card: '#f8f9fa',
    primary: '#008080'
  };
};