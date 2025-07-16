import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserPreferences, UserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

const THEME_COLOR = '#008080';
const BLACK = '#111111';
const GRAY = '#6B6B6B';
const LIGHT_GRAY = '#f8f9fa';

interface PreferencesScreenProps {
  navigation: StackNavigationProp<any>;
}

const POLITICAL_INTERESTS = [
  'Federal Politics',
  'State Politics',
  'Local Government',
  'Supreme Court',
  'Congress',
  'Presidential News',
  'Elections',
  'Healthcare Policy',
  'Economic Policy',
  'Immigration',
  'Climate Policy',
  'Foreign Policy',
  'Defense & Security',
  'Education Policy',
  'Criminal Justice',
  'Civil Rights',
  'Technology Policy',
  'Trade Policy'
];

export default function PreferencesScreen({ navigation }: PreferencesScreenProps) {
  const { preferences, loading, updatePreferences } = useUserPreferences();

  // Get theme colors and font scale based on user preferences
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);

  const toggleInterest = async (interest: string) => {
    const newInterests = preferences.interests.includes(interest)
      ? preferences.interests.filter(i => i !== interest)
      : [...preferences.interests, interest];
    
    const success = await updatePreferences({
      interests: newInterests
    });
    
    if (!success) {
      Alert.alert('Error', 'Failed to update interests. Please try again.');
    }
  };


  const updatePrivacySetting = async (setting: keyof UserPreferences['privacy'], value: boolean) => {
    const success = await updatePreferences({
      privacy: {
        ...preferences.privacy,
        [setting]: value
      }
    });
    
    if (!success) {
      Alert.alert('Error', 'Failed to update privacy settings. Please try again.');
    }
  };

  const updateDisplaySetting = async (setting: keyof UserPreferences['display'], value: any) => {
    const success = await updatePreferences({
      display: {
        ...preferences.display,
        [setting]: value
      }
    });
    
    if (!success) {
      Alert.alert('Error', 'Failed to update display settings. Please try again.');
    }
  };

  const renderInterestItem = (interest: string) => {
    const isSelected = preferences.interests.includes(interest);
    
    return (
      <TouchableOpacity
        key={interest}
        style={[styles.interestItem, isSelected && styles.interestItemSelected]}
        onPress={() => toggleInterest(interest)}
      >
        <Text style={[dynamicStyles.interestText, isSelected && styles.interestTextSelected]}>
          {interest}
        </Text>
        {isSelected && (
          <Ionicons name="checkmark" size={16} color="#fff" />
        )}
      </TouchableOpacity>
    );
  };

  const renderSwitchSetting = (
    title: string,
    description: string,
    value: boolean,
    onValueChange: (value: boolean) => void,
    icon?: string
  ) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        {icon && <Ionicons name={icon as any} size={20} color={THEME_COLOR} />}
      </View>
      <View style={styles.settingContent}>
        <Text style={dynamicStyles.settingTitle}>{title}</Text>
        <Text style={dynamicStyles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#f4f3f4', true: THEME_COLOR }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: themeColors.background,
    },
    headerTitle: {
      ...styles.headerTitle,
      color: themeColors.text,
      fontSize: 18 * fontScale,
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: themeColors.text,
      fontSize: 20 * fontScale,
    },
    sectionDescription: {
      ...styles.sectionDescription,
      color: themeColors.secondaryText,
      fontSize: 14 * fontScale,
    },
    settingTitle: {
      ...styles.settingTitle,
      color: themeColors.text,
      fontSize: 16 * fontScale,
    },
    settingDescription: {
      ...styles.settingDescription,
      color: themeColors.secondaryText,
      fontSize: 14 * fontScale,
    },
    interestText: {
      ...styles.interestText,
      color: themeColors.text,
      fontSize: 14 * fontScale,
    },
    loadingText: {
      ...styles.loadingText,
      color: themeColors.secondaryText,
      fontSize: 16 * fontScale,
    },
  });

  if (loading) {
    return (
      <View style={dynamicStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>Preferences</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={dynamicStyles.loadingText}>Loading preferences...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Preferences</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Interests Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Political Interests</Text>
          <Text style={dynamicStyles.sectionDescription}>
            Select topics you're interested in to personalize your news feed
          </Text>
          <View style={styles.interestsGrid}>
            {POLITICAL_INTERESTS.map(renderInterestItem)}
          </View>
        </View>


        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Privacy</Text>
          {renderSwitchSetting(
            'Usage Analytics',
            'Help improve the app by sharing anonymous usage data',
            preferences.privacy.analytics,
            (value) => updatePrivacySetting('analytics', value),
            'analytics-outline'
          )}
          {renderSwitchSetting(
            'Personalization',
            'Use your reading history to suggest relevant articles',
            preferences.privacy.personalization,
            (value) => updatePrivacySetting('personalization', value),
            'person-outline'
          )}
        </View>

        {/* Display Section */}
        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Display</Text>
          {renderSwitchSetting(
            'Dark Mode',
            'Use dark theme for better reading in low light',
            preferences.display.darkMode,
            (value) => updateDisplaySetting('darkMode', value),
            'moon-outline'
          )}
          
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="text-outline" size={20} color={THEME_COLOR} />
            </View>
            <View style={styles.settingContent}>
              <Text style={dynamicStyles.settingTitle}>Font Size</Text>
              <Text style={dynamicStyles.settingDescription}>Adjust text size for better readability</Text>
              <View style={styles.fontSizeOptions}>
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.fontSizeOption,
                      preferences.display.fontSize === size && styles.fontSizeOptionSelected
                    ]}
                    onPress={() => updateDisplaySetting('fontSize', size)}
                  >
                    <Text style={[
                      styles.fontSizeOptionText,
                      preferences.display.fontSize === size && styles.fontSizeOptionTextSelected
                    ]}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginBottom: 20,
    lineHeight: 20,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  interestItemSelected: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  interestText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    marginRight: 4,
  },
  interestTextSelected: {
    color: '#fff',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    alignItems: 'center',
    paddingTop: 2,
  },
  settingContent: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 20,
  },
  fontSizeOptions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  fontSizeOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  fontSizeOptionSelected: {
    backgroundColor: THEME_COLOR,
    borderColor: THEME_COLOR,
  },
  fontSizeOptionText: {
    fontSize: 12,
    fontFamily: 'WorkSans_500Medium',
    color: BLACK,
  },
  fontSizeOptionTextSelected: {
    color: '#fff',
  },
  bottomPadding: {
    height: 32,
  },
});