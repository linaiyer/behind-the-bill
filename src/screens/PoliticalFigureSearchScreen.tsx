import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { politicalChatService } from '../utils/politicalFigures';
import { PoliticalFigure } from '../types/politicalChat';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleReader: { article: any };
  Context: { term: string };
  LegislativeSimulator: { billName: string; billDescription?: string };
  PoliticalFigureSearch: undefined;
  PoliticalChat: { figureId: string; figureName: string };
};

type PoliticalFigureSearchScreenRouteProp = RouteProp<RootStackParamList, 'PoliticalFigureSearch'>;
type PoliticalFigureSearchScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PoliticalFigureSearch'>;

interface PoliticalFigureSearchScreenProps {
  route?: PoliticalFigureSearchScreenRouteProp;
  navigation?: PoliticalFigureSearchScreenNavigationProp;
}

const THEME_COLOR = '#008080';
const BLACK = '#111111';
const GRAY = '#6B6B6B';
const LIGHT_GRAY = '#f8f9fa';

export default function PoliticalFigureSearchScreen({ route, navigation }: PoliticalFigureSearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PoliticalFigure[]>([]);
  const [popularFigures, setPopularFigures] = useState<PoliticalFigure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadPopularFigures();
  }, []);

  const loadPopularFigures = async () => {
    try {
      // Load all figures as "popular" for now
      const figures = await politicalChatService.searchFigures('');
      setPopularFigures(figures.slice(0, 6)); // Show top 6
    } catch (error) {
      console.error('Failed to load popular figures:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Search Required', 'Please enter a political figure name to search.');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await politicalChatService.searchFigures(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      Alert.alert('Search Failed', 'Unable to search for political figures. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFigure = (figure: PoliticalFigure) => {
    console.log('selectFigure called with figure:', figure.name);
    if (navigation) {
      navigation.navigate('PoliticalChat', {
        figureId: figure.id,
        figureName: figure.name
      });
    }
  };

  const getPartyColor = (party: string) => {
    if (party.toLowerCase().includes('republican')) return '#FF4444';
    if (party.toLowerCase().includes('democratic')) return '#4444FF';
    return THEME_COLOR;
  };

  const getStanceColor = (stance: string) => {
    switch (stance) {
      case 'progressive': return '#22c55e';
      case 'liberal': return '#3b82f6';
      case 'moderate': return '#8b5cf6';
      case 'conservative': return '#ef4444';
      case 'libertarian': return '#f59e0b';
      default: return GRAY;
    }
  };

  const FigureCard = ({ figure }: { figure: PoliticalFigure }) => (
    <TouchableOpacity 
      style={styles.figureCard}
      onPress={() => selectFigure(figure)}
      activeOpacity={0.7}
    >
      <View style={styles.figureHeader}>
        <Text style={styles.figureAvatar}>{figure.avatar}</Text>
        <View style={styles.figureInfo}>
          <Text style={styles.figureName}>{figure.name}</Text>
          <Text style={styles.figureTitle}>{figure.title}</Text>
        </View>
        <View style={[styles.partyBadge, { backgroundColor: getPartyColor(figure.party) }]}>
          <Text style={styles.partyText}>{figure.party}</Text>
        </View>
      </View>

      <Text style={styles.figureDescription}>{figure.description}</Text>

      <View style={styles.figureDetails}>
        <View style={styles.stanceContainer}>
          <View style={[styles.stanceBadge, { backgroundColor: getStanceColor(figure.politicalStance) }]}>
            <Text style={styles.stanceText}>{figure.politicalStance}</Text>
          </View>
        </View>
        
        <View style={styles.policiesContainer}>
          <Text style={styles.policiesLabel}>Key Policies:</Text>
          <View style={styles.policiesGrid}>
            {figure.keyPolicies.slice(0, 3).map((policy, index) => (
              <View key={index} style={styles.policyTag}>
                <Text style={styles.policyText}>{policy}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.chatButton}>
        <Ionicons name="chatbubble-outline" size={20} color={THEME_COLOR} />
        <Text style={styles.chatButtonText}>Chat about policies</Text>
        <Ionicons name="arrow-forward" size={16} color={THEME_COLOR} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {navigation && (
          <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={BLACK} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Political Chat</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Chat with Political Figures</Text>
        <Text style={styles.searchSubtitle}>
          Discuss policies and political views with AI assistants trained on public statements and positions
        </Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a political figure..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="search" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Results */}
        {hasSearched && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchResults.length > 0 ? `Search Results (${searchResults.length})` : 'No Results Found'}
            </Text>
            {searchResults.length > 0 ? (
              searchResults.map((figure) => (
                <FigureCard key={figure.id} figure={figure} />
              ))
            ) : hasSearched && (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={GRAY} />
                <Text style={styles.noResultsText}>No political figures found for "{searchQuery}"</Text>
                <Text style={styles.noResultsSubtext}>Try searching for a different name or title</Text>
              </View>
            )}
          </View>
        )}

        {/* Popular Figures */}
        {!hasSearched && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Popular Political Figures</Text>
            {popularFigures.map((figure) => (
              <FigureCard key={figure.id} figure={figure} />
            ))}
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerIcon}>
            <Ionicons name="information-circle" size={24} color={THEME_COLOR} />
          </View>
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>Important Notice</Text>
            <Text style={styles.disclaimerText}>
              These are AI assistants trained on public statements and policy positions. 
              They only discuss political views and policies, not personal matters. 
              Responses are generated based on publicly available information.
            </Text>
          </View>
        </View>
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
  searchSection: {
    backgroundColor: LIGHT_GRAY,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchTitle: {
    fontSize: 24,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 24,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginRight: 12,
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: THEME_COLOR,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 16,
  },
  figureCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  figureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  figureAvatar: {
    fontSize: 36,
    marginRight: 16,
  },
  figureInfo: {
    flex: 1,
  },
  figureName: {
    fontSize: 20,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    marginBottom: 4,
  },
  figureTitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  partyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  partyText: {
    fontSize: 12,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
  figureDescription: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 24,
    marginBottom: 16,
  },
  figureDetails: {
    marginBottom: 16,
  },
  stanceContainer: {
    marginBottom: 12,
  },
  stanceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  stanceText: {
    fontSize: 12,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  policiesContainer: {
    marginTop: 12,
  },
  policiesLabel: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  policiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  policyTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  policyText: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  chatButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: THEME_COLOR,
    marginHorizontal: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    textAlign: 'center',
    marginTop: 16,
  },
  noResultsSubtext: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    textAlign: 'center',
    marginTop: 8,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff7ed',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
    marginVertical: 20,
  },
  disclaimerIcon: {
    marginRight: 12,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 20,
  },
});