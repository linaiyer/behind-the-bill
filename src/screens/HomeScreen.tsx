import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, TextInput, Dimensions, ActivityIndicator } from 'react-native';
import Swiper from 'react-native-deck-swiper';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNewsArticles, NewsArticle } from '../utils/newsApi';

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
  const [selectedTab, setSelectedTab] = useState('home');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  // Fetch onboarding interests from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const surveyData = await AsyncStorage.getItem('surveyData');
        if (surveyData) {
          const parsed = JSON.parse(surveyData);
          setInterests(parsed.interests || []);
          console.log('Loaded interests from AsyncStorage:', parsed.interests);
        }
      } catch (e) {
        setInterests([]);
        console.log('Failed to load interests from AsyncStorage:', e);
      }
    })();
  }, []);

  // Fetch news articles when interests or search changes
  useEffect(() => {
    setLoading(true);
    console.log('Fetching news with interests:', interests, 'and search:', search);
    fetchNewsArticles(interests, search).then((arts) => {
      console.log('NewsAPI returned articles:', arts);
      setArticles(arts.map((a, idx) => ({ ...a, id: idx + 1 })));
      setLoading(false);
    }).catch((error) => {
      console.error('Error fetching articles:', error);
      setLoading(false);
    });
  }, [interests, search]);

  const handleSwipedLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSwipedRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Behind the Bill</Text>
        <Text style={styles.subtitle}>Understand the context behind the headlines.</Text>
      </View>
      {/* Search and Filter Row */}
      <View style={styles.searchRow}>
        <View style={styles.searchBarWrap}>
          <TextInput
            style={styles.searchBar}
            placeholder="Search articles..."
            placeholderTextColor={GRAY}
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
      <Text style={styles.swipeText}>Swipe to skip</Text>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color={HIGHLIGHT} style={{ marginTop: 40 }} />
        ) : articles.length === 0 ? (
          <Text style={{ color: GRAY, fontSize: 18, marginTop: 40 }}>No news found. Try a different search.</Text>
        ) : (
          <Swiper
            ref={swiperRef}
            cards={articles}
            renderCard={(card) => (
              <View style={styles.articleCard} key={card.url}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.articleSource}>{card.source?.name || 'Unknown'}</Text>
                  <Text style={styles.articleTime}> • {new Date(card.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.articleTitle}>{card.title}</Text>
                <Text style={styles.articleSummary}>{card.description || ''}</Text>
                <Text style={styles.articleReadTime}>{card.author ? `By ${card.author}` : ''}</Text>
              </View>
            )}
            onSwipedLeft={handleSwipedLeft}
            onSwipedRight={handleSwipedRight}
            cardIndex={0}
            backgroundColor={'#fff'}
            stackSize={4}
            stackSeparation={8}
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
            containerStyle={{ flex: 1, marginTop: 0, marginBottom: 0 }}
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
      {/* Bottom Bubble Navigation */}
      <View style={styles.bottomNavWrap}>
        <View style={styles.bottomNav}>
          {navTabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={selectedTab === tab.key ? styles.navBubbleSelected : styles.navBubble}
              onPress={() => setSelectedTab(tab.key)}
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
  bottomNavWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: 'center',
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
    backgroundColor: 'transparent',
  },
  navBubble: {
    backgroundColor: BLACK,
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  navBubbleSelected: {
    backgroundColor: '#fff',
    borderRadius: 32,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: BLACK,
  },
}); 