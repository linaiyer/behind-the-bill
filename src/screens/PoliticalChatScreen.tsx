import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { politicalChatService } from '../utils/politicalFigures';
import { PoliticalFigure, ChatMessage, ChatResponse } from '../types/politicalChat';
import { useUserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  ArticleReader: { article: any };
  Context: { term: string };
  LegislativeSimulator: { billName: string; billDescription?: string };
  PoliticalFigureSearch: undefined;
  PoliticalChat: { figureId: string; figureName: string };
};

type PoliticalChatScreenRouteProp = RouteProp<RootStackParamList, 'PoliticalChat'>;
type PoliticalChatScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PoliticalChat'>;

interface PoliticalChatScreenProps {
  route: PoliticalChatScreenRouteProp;
  navigation: PoliticalChatScreenNavigationProp;
}

const THEME_COLOR = '#008080';
const BLACK = '#111111';
const GRAY = '#6B6B6B';
const LIGHT_GRAY = '#f8f9fa';

export default function PoliticalChatScreen({ route, navigation }: PoliticalChatScreenProps) {
  const { figureId, figureName } = route.params;
  const { preferences } = useUserPreferences();
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);
  
  const [figure, setFigure] = useState<PoliticalFigure | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadFigureAndInitializeChat();
  }, [figureId]);

  const loadFigureAndInitializeChat = async () => {
    try {
      setIsLoading(true);
      const figureData = await politicalChatService.getFigureDetails(figureId);
      setFigure(figureData);
      
      // Initialize with welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: `Hello! I'm ${figureData.name}'s policy assistant. I can discuss my political views and policy positions with you. What would you like to know about my stance on various issues?`,
        sender: 'bot',
        timestamp: new Date(),
        figureId: figureId
      };
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to load figure:', error);
      Alert.alert('Error', 'Failed to load political figure information.');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const response: ChatResponse = await politicalChatService.sendMessage(
        figureId,
        inputText.trim(),
        messages
      );

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'bot',
        timestamp: new Date(),
        figureId: figureId,
        isBlocked: response.isBlocked,
        blockReason: response.blockReason
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        figureId: figureId
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedQuestions = [
    "What's your stance on healthcare reform?",
    "How do you view immigration policy?",
    "What are your thoughts on climate change?",
    "What's your position on economic policy?",
    "How do you approach foreign policy?",
    "What are your views on education reform?"
  ];

  const getPartyColor = (party: string) => {
    if (party.toLowerCase().includes('republican')) return '#FF4444';
    if (party.toLowerCase().includes('democratic')) return '#4444FF';
    return THEME_COLOR;
  };

  const MessageBubble = ({ message }: { message: ChatMessage }) => (
    <View style={[
      styles.messageContainer,
      message.sender === 'user' ? styles.userMessageContainer : styles.botMessageContainer
    ]}>
      <View style={[
        styles.messageBubble,
        message.sender === 'user' ? styles.userBubble : [styles.botBubble, { backgroundColor: themeColors.card }],
        message.isBlocked && styles.blockedBubble
      ]}>
        {message.isBlocked && (
          <View style={styles.blockedHeader}>
            <Ionicons name="shield-outline" size={16} color="#ef4444" />
            <Text style={styles.blockedText}>Message Blocked</Text>
          </View>
        )}
        <Text style={[
          styles.messageText,
          message.sender === 'user' ? styles.userMessageText : [styles.botMessageText, { color: themeColors.text }],
          message.isBlocked && styles.blockedMessageText
        ]}>
          {message.text}
        </Text>
        <Text style={[
          styles.messageTime,
          message.sender === 'user' ? styles.userMessageTime : [styles.botMessageTime, { color: themeColors.secondaryText }]
        ]}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <View style={[styles.typingBubble, { backgroundColor: themeColors.card }]}>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={THEME_COLOR} />
        <Text style={[styles.loadingText, { color: themeColors.secondaryText }]}>Loading {figureName}...</Text>
      </View>
    );
  }

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      ...styles.container,
      backgroundColor: themeColors.background,
    },
    header: {
      ...styles.header,
      backgroundColor: themeColors.card,
      borderBottomColor: themeColors.border,
    },
    headerName: {
      ...styles.headerName,
      color: themeColors.text,
    },
    headerTitle: {
      ...styles.headerTitle,
      color: themeColors.secondaryText,
    },
    messagesContainer: {
      ...styles.messagesContainer,
      backgroundColor: themeColors.background,
    },
    inputContainer: {
      ...styles.inputContainer,
      backgroundColor: themeColors.card,
      borderTopColor: themeColors.border,
    },
    textInput: {
      ...styles.textInput,
      backgroundColor: themeColors.background,
      borderColor: themeColors.border,
      color: themeColors.text,
    },
    suggestionsContainer: {
      ...styles.suggestionsContainer,
      backgroundColor: themeColors.card,
      borderTopColor: themeColors.border,
    },
    suggestionsTitle: {
      ...styles.suggestionsTitle,
      color: themeColors.text,
    },
    suggestionButton: {
      ...styles.suggestionButton,
      backgroundColor: themeColors.background,
      borderColor: themeColors.border,
    },
    suggestionText: {
      ...styles.suggestionText,
      color: themeColors.text,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={dynamicStyles.headerName}>{figure?.name}</Text>
          <Text style={dynamicStyles.headerTitle}>{figure?.title}</Text>
        </View>

        <View style={styles.headerRight}>
          {figure && (
            <View style={[styles.partyBadge, { backgroundColor: getPartyColor(figure.party) }]}>
              <Text style={styles.partyText}>{figure.party.split('/')[0]}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={dynamicStyles.messagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </ScrollView>

      {/* Suggested Questions */}
      <View style={dynamicStyles.suggestionsContainer}>
        <Text style={dynamicStyles.suggestionsTitle}>Suggested Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.suggestionsScroll}>
            {suggestedQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={dynamicStyles.suggestionButton}
                onPress={() => setInputText(question)}
              >
                <Text style={dynamicStyles.suggestionText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Input Section */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={dynamicStyles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={dynamicStyles.textInput}
            placeholder="Ask about political views and policies..."
            placeholderTextColor={themeColors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isTyping}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Ionicons
              name="send"
              size={20}
              color={!inputText.trim() || isTyping ? GRAY : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={GRAY} />
        <Text style={styles.disclaimerText}>
          AI assistant - discusses only political views and policies
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerName: {
    fontSize: 18,
    fontFamily: 'WorkSans_700Bold',
    color: BLACK,
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  partyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  partyText: {
    fontSize: 12,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#fff',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
  },
  userBubble: {
    backgroundColor: THEME_COLOR,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: LIGHT_GRAY,
    borderBottomLeftRadius: 4,
  },
  blockedBubble: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  blockedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockedText: {
    fontSize: 12,
    fontFamily: 'WorkSans_600SemiBold',
    color: '#ef4444',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: BLACK,
  },
  blockedMessageText: {
    color: '#ef4444',
  },
  messageTime: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    marginTop: 8,
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botMessageTime: {
    color: GRAY,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    backgroundColor: LIGHT_GRAY,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    padding: 16,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GRAY,
    marginHorizontal: 2,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 0.8,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontFamily: 'WorkSans_600SemiBold',
    color: BLACK,
    marginBottom: 12,
  },
  suggestionsScroll: {
    flexDirection: 'row',
    gap: 12,
  },
  suggestionButton: {
    backgroundColor: LIGHT_GRAY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: 'WorkSans_400Regular',
    color: BLACK,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  disclaimerText: {
    fontSize: 12,
    fontFamily: 'WorkSans_400Regular',
    color: GRAY,
    marginLeft: 4,
  },
});