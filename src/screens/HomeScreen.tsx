import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { fetchNewsArticles, NewsArticle } from '../utils/newsApi';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useUserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HIGHLIGHT = '#008080';
const BLACK = '#111';
const GRAY = '#6B6B6B';
const { width } = Dimensions.get('window');

const navTabs = [
  { key: 'home', selected: require('../../assets/home_selected.png'), unselected: require('../../assets/home_unselected.png') },
  { key: 'chat', selected: require('../../assets/chat_selected.png'), unselected: require('../../assets/chat_unselected.png') },
  { key: 'settings', selected: require('../../assets/settings_selected.png'), unselected: require('../../assets/settings_unselected.png') },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { preferences, loadPreferences } = useUserPreferences();
  const [selectedTab, setSelectedTab] = useState('home');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const [seenArticles, setSeenArticles] = useState<string[]>([]);

  // Get theme colors and font scale based on user preferences
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);

  // Reset to home tab and reload preferences when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setSelectedTab('home');
      // Reload preferences when returning to home screen
      loadPreferences();
    }, [loadPreferences])
  );

  // Load seen articles from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const seen = await AsyncStorage.getItem('seenArticles');
        setSeenArticles(seen ? JSON.parse(seen) : []);
      } catch (e) {
        setSeenArticles([]);
      }
    })();
  }, []);

  // Fetch news articles when interests or search changes
  useEffect(() => {
    setLoading(true);
    console.log('Fetching news with interests:', preferences.interests, 'search:', search);
    
    fetchNewsArticles(preferences.interests, search).then((arts) => {
      console.log('Fetched articles:', arts.length);
      // Filter out seen articles by URL
      const filtered = arts.filter((a) => !seenArticles.includes(a.url));
      console.log('Articles after filtering seen:', filtered.length);
      setArticles(filtered.map((a, idx) => ({ ...a, id: idx + 1 })));
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching news:', error);
      setLoading(false);
    });
  }, [preferences.interests, search, seenArticles]);

  const handleSwipedLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSwipedRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleArticleTap = async (article: NewsArticle) => {
    // Mark article as seen
    try {
      const updatedSeen = Array.from(new Set([...seenArticles, article.url]));
      setSeenArticles(updatedSeen);
      await AsyncStorage.setItem('seenArticles', JSON.stringify(updatedSeen));
    } catch (e) {
      // Ignore errors
    }
    navigation.navigate('ArticleReader', { article });
  };

  const handleTabPress = (tabKey: string) => {
    setSelectedTab(tabKey);
    // Navigation is handled by MainTabNavigator
  };

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: themeColors.background,
    },
    title: {
      ...styles.title,
      color: themeColors.text,
      fontSize: 36 * fontScale,
    },
    subtitle: {
      ...styles.subtitle,
      color: themeColors.secondaryText,
      fontSize: 16 * fontScale,
    },
    searchBar: {
      ...styles.searchBar,
      backgroundColor: themeColors.card,
      borderColor: themeColors.border,
      color: themeColors.text,
      fontSize: 16 * fontScale,
    },
    articleCard: {
      ...styles.articleCard,
      backgroundColor: themeColors.card,
      borderColor: themeColors.border,
    },
    articleSource: {
      ...styles.articleSource,
      color: themeColors.text,
      fontSize: 16 * fontScale,
    },
    articleTime: {
      ...styles.articleTime,
      color: themeColors.secondaryText,
      fontSize: 15 * fontScale,
    },
    articleTitle: {
      ...styles.articleTitle,
      color: themeColors.text,
      fontSize: 22 * fontScale,
    },
    articleSummary: {
      ...styles.articleSummary,
      color: themeColors.secondaryText,
      fontSize: 16 * fontScale,
    },
    articleReadTime: {
      ...styles.articleReadTime,
      color: themeColors.text,
      fontSize: 15 * fontScale,
    },
    swipeText: {
      ...styles.swipeText,
      color: themeColors.secondaryText,
      fontSize: 18 * fontScale,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={dynamicStyles.title}>Behind the Bill</Text>
        <Text style={dynamicStyles.subtitle}>Understand the context behind the headlines.</Text>
      </View>
      {/* Search and Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBarWrap}>
          <TextInput
            style={dynamicStyles.searchBar}
            placeholder="Search articles..."
            placeholderTextColor={themeColors.secondaryText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.filterIcon} onPress={() => setShowFilters(!showFilters)}>
          <Image 
            source={showFilters ? require('../../assets/filter_selected.png') : require('../../assets/filter_unselected.png')} 
            style={{ width: 22, height: 22, tintColor: '#fff' }} 
          />
        </TouchableOpacity>
      </View>
      {/* Swipeable News Cards */}
      <Text style={dynamicStyles.swipeText}>Swipe to skip</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color={HIGHLIGHT} style={{ marginTop: 40 }} />
        ) : articles.length === 0 ? (
          <Text style={{ color: themeColors.secondaryText, fontSize: 18 * fontScale, marginTop: 40 }}>No news found. Try a different search.</Text>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={articles}
            renderCard={(card) => (
              <TouchableOpacity 
                style={dynamicStyles.articleCard} 
                key={card.url}
                onPress={() => handleArticleTap(card)}
                activeOpacity={0.95}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={dynamicStyles.articleSource}>{card.source?.name || 'Unknown'}</Text>
                  <Text style={dynamicStyles.articleTime}> • {new Date(card.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={dynamicStyles.articleTitle}>{card.title}</Text>
                <Text style={dynamicStyles.articleSummary}>{card.description || ''}</Text>
                <Text style={dynamicStyles.articleReadTime}>{card.author ? `By ${card.author}` : ''}</Text>
                <View style={styles.tapHint}>
                  <Text style={styles.tapHintText}>Tap to read</Text>
                </View>
              </TouchableOpacity>
            )}
            onSwipedLeft={handleSwipedLeft}
            onSwipedRight={handleSwipedRight}
            cardIndex={0}
            backgroundColor={themeColors.background}
            stackSize={4}
            stackSeparation={8}
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
            containerStyle={{ flex: 1, marginTop: 0, marginBottom: 100 }}
            cardStyle={{ 
              borderRadius: 12, 
              shadowColor: '#000', 
              shadowOffset: { width: 0, height: 12 }, 
              shadowOpacity: 0.25, 
              shadowRadius: 20, 
              elevation: 12,
            }}
            cardVerticalMargin={12}
            cardHorizontalMargin={20}
            swipeAnimationDuration={400}
            goBackToPreviousCardOnSwipeLeft={false}
            goBackToPreviousCardOnSwipeRight={false}
            infinite
            showSecondCard
            secondCardZoom={0.92}
          />
        )}
      </View>
      
      {/* Bottom Bubble Navigation - moved outside swiper container */}
      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          {navTabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={selectedTab === tab.key ? styles.navBubbleSelected : styles.navBubble}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.85}
            >
              <Image
                source={selectedTab === tab.key ? tab.selected : tab.unselected}
                style={{ width: 28, height: 28, tintColor: selectedTab === tab.key ? BLACK : '#fff' }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    paddingBottom: 0,
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
    marginBottom: 18,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    marginBottom: 18,
  },
  searchBarWrap: {
    flex: 1,
    marginRight: 14,
  },
  searchBar: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: GRAY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
  },
  filterIcon: {
    backgroundColor: BLACK,
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeText: {
    alignSelf: 'flex-end',
    color: GRAY,
    fontFamily: 'WorkSans_700Bold',
    fontSize: 18,
    marginBottom: 0,
    marginRight: 32,
    marginTop: 2,
  },
  articleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width - 48,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: BLACK,
  },
  articleSource: {
    fontFamily: 'WorkSans_700Bold',
    fontSize: 16,
    color: BLACK,
  },
  articleTime: {
    fontFamily: 'WorkSans_400Regular',
    fontSize: 15,
    color: GRAY,
  },
  articleTitle: {
    fontFamily: 'WorkSans_700Bold',
    fontSize: 22,
    color: BLACK,
    marginBottom: 8,
    marginTop: 2,
  },
  articleSummary: {
    fontFamily: 'WorkSans_400Regular',
    fontSize: 16,
    color: GRAY,
    marginBottom: 16,
  },
  articleReadTime: {
    fontFamily: 'WorkSans_600SemiBold',
    fontSize: 15,
    color: BLACK,
    marginTop: 2,
  },
  tapHint: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  tapHintText: {
    fontFamily: 'WorkSans_500Medium',
    fontSize: 12,
    color: HIGHLIGHT,
  },
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    borderRadius: 40,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 64,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  navBubble: {
    backgroundColor: BLACK,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    zIndex: 1001,
    elevation: 11,
  },
  navBubbleSelected: {
    backgroundColor: '#fff',
    borderRadius: 32,
    width: 56,
    height: 56,
    zIndex: 1001,
    elevation: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: BLACK,
  },
}); 