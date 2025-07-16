import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { getContextData, ContextData } from '../utils/politicalTerms';
import { useUserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

const HIGHLIGHT = '#008080';
const BLACK = '#111';
const GRAY = '#6B6B6B';
const LIGHT_GRAY = '#f8f9fa';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleReader: { article: any };
  Context: { term: string };
  LegislativeSimulator: { billName: string; billDescription?: string };
};

type ContextScreenRouteProp = RouteProp<RootStackParamList, 'Context'>;
type ContextScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Context'>;

interface ContextScreenProps {
  route: ContextScreenRouteProp;
  navigation: ContextScreenNavigationProp;
}

export default function ContextScreen({ route, navigation }: ContextScreenProps) {
  const { term } = route.params;
  const { preferences } = useUserPreferences();
  const [contextData, setContextData] = useState<ContextData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get theme colors and font scale based on user preferences
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);

  // Determine if this term is a bill or policy that can be simulated
  const canSimulate = (term: string): boolean => {
    const termLower = term.toLowerCase();
    return termLower.includes('bill') || 
           termLower.includes('act') || 
           termLower.includes('policy') || 
           termLower.includes('reform') ||
           ['medicare', 'medicaid', 'social security', 'infrastructure', 'green new deal', 'affordable care act'].some(keyword => 
             termLower.includes(keyword)
           );
  };

  const handleSimulateImpact = () => {
    navigation.navigate('LegislativeSimulator', {
      billName: term,
      billDescription: contextData?.briefRundown
    });
  };

  useEffect(() => {
    const loadContextData = async () => {
      setLoading(true);
      try {
        const data = await getContextData(term);
        setContextData(data);
      } catch (error) {
        console.error('Failed to load context data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContextData();
  }, [term]);

  const renderSection = (title: string, content: string | string[] | undefined, icon: string) => {
    if (!content) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name={icon as any} size={20} color={HIGHLIGHT} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
          {Array.isArray(content) ? (
            content.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.sectionText}>{content}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderCompareContrastSection = (compareContrast: any) => {
    if (!compareContrast) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="git-compare-outline" size={20} color={HIGHLIGHT} />
          <Text style={styles.sectionTitle}>Compare & Contrast</Text>
        </View>
        <View style={styles.sectionContent}>
          {compareContrast.historicalUS && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Similar Programs in US History</Text>
              {compareContrast.historicalUS.map((item: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
          {compareContrast.otherCountries && (
            <View style={styles.subSection}>
              <Text style={styles.subSectionTitle}>Programs in Other Countries</Text>
              {compareContrast.otherCountries.map((item: string, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.listItemText}>{item}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Context</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={HIGHLIGHT} />
          <Text style={styles.loadingText}>Generating comprehensive context...</Text>
          <Text style={styles.loadingSubtext}>Using AI to provide detailed political analysis</Text>
        </View>
      </View>
    );
  }

  if (!contextData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BLACK} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Context</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="information-circle-outline" size={48} color={GRAY} />
          <Text style={styles.errorTitle}>Context Generation Failed</Text>
          <Text style={styles.errorText}>
            Unable to generate context information for "{term}". Please check your internet connection and try again. You can also configure an OpenAI API key in Settings for enhanced AI-powered explanations.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={BLACK} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Context</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Term Title */}
        <View style={styles.termHeader}>
          <Text style={styles.termTitle}>{contextData.term}</Text>
          
          {/* Legislative Impact Simulator Button */}
          {canSimulate(term) && (
            <TouchableOpacity 
              style={styles.simulatorButton} 
              onPress={handleSimulateImpact}
            >
              <Ionicons name="analytics-outline" size={20} color="#FFFFFF" />
              <Text style={styles.simulatorButtonText}>Simulate Legislative Impact</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Brief Rundown */}
        {renderSection(
          "Brief Rundown", 
          contextData.briefRundown, 
          "document-text-outline"
        )}

        {/* Components */}
        {renderSection(
          "Components", 
          contextData.components, 
          "list-outline"
        )}

        {/* Proposed Impact */}
        {renderSection(
          "Proposed Impact", 
          contextData.proposedImpact, 
          "trending-up-outline"
        )}

        {/* In Practice by States */}
        {renderSection(
          "In Practice by States", 
          contextData.inPracticeByStates, 
          "map-outline"
        )}

        {/* Compare & Contrast */}
        {renderCompareContrastSection(contextData.compareContrast)}

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
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 4,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    textAlign: 'center',
    lineHeight: 24,
  },
  termHeader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  termTitle: {
    fontSize: 32,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    textAlign: 'center',
    marginBottom: 16,
  },
  simulatorButton: {
    backgroundColor: HIGHLIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  simulatorButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginLeft: 8,
  },
  sectionContent: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: HIGHLIGHT,
  },
  sectionText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: HIGHLIGHT,
    marginRight: 8,
    marginTop: 2,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 24,
  },
  subSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  bottomPadding: {
    height: 32,
  },
});