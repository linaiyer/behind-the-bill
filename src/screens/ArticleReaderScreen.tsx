import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { NewsArticle, fetchFullArticleContent } from '../utils/newsApi';
import { HighlightedText } from '../components/HighlightedText';
import { cleanNewsText } from '../utils/htmlEntityDecoder';
import { useUserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

const HIGHLIGHT = '#008080';
const BLACK = '#111';
const GRAY = '#6B6B6B';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleReader: { article: NewsArticle };
  Context: { term: string };
};

type ArticleReaderScreenRouteProp = RouteProp<RootStackParamList, 'ArticleReader'>;
type ArticleReaderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ArticleReader'>;

interface ArticleReaderScreenProps {
  route: ArticleReaderScreenRouteProp;
  navigation: ArticleReaderScreenNavigationProp;
}


export default function ArticleReaderScreen({ route, navigation }: ArticleReaderScreenProps) {
  const { article } = route.params;
  const { preferences } = useUserPreferences();
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  // Get theme colors and font scale based on user preferences
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);

  useEffect(() => {
    const loadFullContent = async () => {
      setLoadingContent(true);
      try {
        const content = await fetchFullArticleContent(article.url);
        setFullContent(content);
      } catch (error) {
        console.error('Failed to load full content:', error);
      } finally {
        setLoadingContent(false);
      }
    };

    loadFullContent();
  }, [article.url]);

  const handleOpenOriginal = async () => {
    try {
      await Linking.openURL(article.url);
    } catch (error) {
      console.error('Failed to open article URL:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
    source: {
      ...styles.source,
      fontSize: 14 * fontScale,
    },
    publishDate: {
      ...styles.publishDate,
      color: themeColors.secondaryText,
      fontSize: 14 * fontScale,
    },
    author: {
      ...styles.author,
      color: themeColors.text,
      fontSize: 14 * fontScale,
    },
    title: {
      ...styles.title,
      color: themeColors.text,
      fontSize: 28 * fontScale,
    },
    description: {
      ...styles.description,
      color: themeColors.text,
      fontSize: 18 * fontScale,
    },
    bodyText: {
      ...styles.bodyText,
      color: themeColors.text,
      fontSize: 16 * fontScale,
    },
    loadingText: {
      ...styles.loadingText,
      color: themeColors.secondaryText,
      fontSize: 16 * fontScale,
    },
    fallbackText: {
      ...styles.fallbackText,
      color: themeColors.secondaryText,
      fontSize: 16 * fontScale,
    },
    originalArticleHeader: {
      ...styles.originalArticleHeader,
      color: themeColors.text,
      fontSize: 18 * fontScale,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Article</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article metadata */}
        <View style={styles.metadata}>
          <Text style={dynamicStyles.source}>{article.source?.name || 'Unknown Source'}</Text>
          <Text style={dynamicStyles.publishDate}>{formatDate(article.publishedAt)}</Text>
          {article.author && (
            <Text style={dynamicStyles.author}>By {article.author}</Text>
          )}
        </View>

        {/* Article title */}
        <Text style={dynamicStyles.title}>{cleanNewsText(article.title)}</Text>

        {/* Article content */}
        <View style={styles.articleBody}>
          {article.description && (
            <Text style={dynamicStyles.description}>{cleanNewsText(article.description)}</Text>
          )}
          
          {loadingContent ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={HIGHLIGHT} />
              <Text style={dynamicStyles.loadingText}>Loading full article...</Text>
            </View>
          ) : fullContent ? (
            <View style={styles.fullContentContainer}>
              {fullContent.split('\n\n').map((paragraph, index) => {
                // Skip empty paragraphs
                if (!paragraph || paragraph.trim().length === 0) {
                  return null;
                }
                
                return (
                  <View key={index} style={styles.paragraphContainer}>
                    <HighlightedText 
                      text={cleanNewsText(paragraph)} 
                      onTermPress={(term) => navigation.navigate('Context', { term })}
                    />
                  </View>
                );
              })}
            </View>
          ) : article.content && article.content.length > 200 ? (
            // If we have substantial content in article.content, display it with highlighting
            <View style={styles.fullContentContainer}>
              {article.content.split('\n\n').map((paragraph, index) => {
                // Skip empty paragraphs
                if (!paragraph || paragraph.trim().length === 0) {
                  return null;
                }
                
                return (
                  <View key={index} style={styles.paragraphContainer}>
                    <HighlightedText 
                      text={cleanNewsText(paragraph)} 
                      onTermPress={(term) => navigation.navigate('Context', { term })}
                    />
                  </View>
                );
              })}
            </View>
          ) : (
            <>
              {article.content && (
                <Text style={dynamicStyles.bodyText}>
                  {cleanNewsText(article.content.replace(/\[\+\d+ chars\]$/, ''))}
                </Text>
              )}
              <View style={styles.fallbackContainer}>
                <Text style={dynamicStyles.fallbackText}>
                  Unable to load the full article content. The complete article is available at the original source.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Read original article button - moved to end */}
        {!loadingContent && (
          <View style={styles.originalArticleSection}>
            <Text style={dynamicStyles.originalArticleHeader}>Want to read more?</Text>
            <TouchableOpacity style={styles.readOriginalButton} onPress={handleOpenOriginal}>
              <Text style={styles.readOriginalButtonText}>View Original Article</Text>
              <Ionicons name="open-outline" size={16} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}
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
    width: 40, // Same width as back button for centering
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  metadata: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  source: {
    fontSize: 14,
    fontFamily: 'WorkSans_700Bold',
    color: HIGHLIGHT,
    marginBottom: 4,
  },
  publishDate: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    fontFamily: 'WorkSans_500Medium',
    color: BLACK,
  },
  title: {
    fontSize: 28,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
    lineHeight: 36,
    marginBottom: 20,
  },
  articleBody: {
    marginBottom: 32,
  },
  description: {
    fontSize: 18,
    fontFamily: 'WorkSans_500Medium',
    color: BLACK,
    lineHeight: 26,
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 24,
  },
  fullContentContainer: {
    marginTop: 4,
  },
  paragraphContainer: {
    marginBottom: 16,
  },
  paragraphText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
    lineHeight: 26,
    textAlign: 'justify',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 12,
  },
  fallbackContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: HIGHLIGHT,
    marginTop: 20,
  },
  fallbackText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  originalArticleSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
    marginBottom: 32,
  },
  originalArticleHeader: {
    fontSize: 18,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 16,
  },
  readOriginalButton: {
    backgroundColor: HIGHLIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  readOriginalButtonText: {
    fontSize: 16,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
});