import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUserPreferences, getThemeColors, getFontScale } from '../hooks/useUserPreferences';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  persona?: string;
}

export default function ChatScreen({ navigation }: any) {
  const { preferences } = useUserPreferences();
  const themeColors = getThemeColors(preferences.display.darkMode);
  const fontScale = getFontScale(preferences.display.fontSize);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm here to help you understand legislation. I can explain bills in different ways - as a politician, policy expert, or advocate. What would you like to know about?",
      sender: 'bot',
      timestamp: new Date(),
      persona: 'neutral'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('neutral');
  const scrollViewRef = useRef<ScrollView>(null);

  const personas = [
    { id: 'politician', name: 'Politician', icon: 'person', color: 'bg-blue-500' },
    { id: 'expert', name: 'Policy Expert', icon: 'school', color: 'bg-green-500' },
    { id: 'advocate', name: 'Advocate', icon: 'heart', color: 'bg-red-500' },
    { id: 'neutral', name: 'Neutral', icon: 'chatbubble', color: 'bg-gray-500' }
  ];

  const sampleQuestions = [
    "What's the Student Loan Forgiveness Act about?",
    "How will healthcare bills affect me?",
    "Explain digital privacy laws",
    "What's happening with environmental policy?"
  ];

  const sendMessage = () => {
    console.log('sendMessage called with inputText:', inputText);
    if (!inputText.trim()) {
      console.log('No input text, returning');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    console.log('Adding user message:', userMessage);
    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText, selectedPersona),
        sender: 'bot',
        timestamp: new Date(),
        persona: selectedPersona
      };
      console.log('Adding bot response:', botResponse);
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (userInput: string, persona: string): string => {
    const responses = {
      politician: "As a legislator, I believe this bill represents a balanced approach to addressing the concerns of our constituents. We've worked hard to ensure it serves the public interest while being fiscally responsible.",
      expert: "From a policy perspective, this legislation addresses several key issues. The data shows that similar measures in other states have had positive outcomes, though implementation challenges remain.",
      advocate: "This bill is crucial for protecting vulnerable communities. We've been fighting for these changes for years, and this represents a significant step forward for social justice.",
      neutral: "This bill aims to address several policy areas. Here are the key points: it affects funding, creates new regulations, and impacts various stakeholders differently."
    };
    return responses[persona as keyof typeof responses] || responses.neutral;
  };

  // Create dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    header: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: themeColors.card,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20 * fontScale,
      fontWeight: 'bold',
      color: themeColors.text,
      marginLeft: 16,
    },
    personaContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      backgroundColor: themeColors.card,
      borderBottomWidth: 1,
      borderBottomColor: themeColors.border,
    },
    personaLabel: {
      fontSize: 14 * fontScale,
      fontWeight: '500',
      color: themeColors.secondaryText,
      marginBottom: 8,
    },
    personaRow: {
      flexDirection: 'row',
      gap: 8,
    },
    personaButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    personaButtonActive: {
      backgroundColor: '#3B82F6',
    },
    personaButtonInactive: {
      backgroundColor: themeColors.border,
    },
    personaText: {
      marginLeft: 4,
      fontSize: 14 * fontScale,
      fontWeight: '500',
    },
    personaTextActive: {
      color: '#ffffff',
    },
    personaTextInactive: {
      color: themeColors.secondaryText,
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    messageContainer: {
      marginBottom: 16,
    },
    userMessage: {
      alignSelf: 'flex-end',
      backgroundColor: '#3B82F6',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      maxWidth: '80%',
    },
    botMessage: {
      alignSelf: 'flex-start',
      backgroundColor: themeColors.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 18,
      maxWidth: '80%',
    },
    messageText: {
      fontSize: 16 * fontScale,
      lineHeight: 22 * fontScale,
    },
    userMessageText: {
      color: '#ffffff',
    },
    botMessageText: {
      color: themeColors.text,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: themeColors.border,
      backgroundColor: themeColors.card,
    },
    textInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16 * fontScale,
      color: themeColors.text,
      backgroundColor: themeColors.background,
      marginRight: 12,
    },
    sendButton: {
      backgroundColor: '#3B82F6',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    sendButtonText: {
      color: '#ffffff',
      fontSize: 16 * fontScale,
      fontWeight: '600',
    },
    suggestionContainer: {
      paddingHorizontal: 24,
      paddingVertical: 16,
    },
    suggestionButton: {
      backgroundColor: themeColors.card,
      borderWidth: 1,
      borderColor: themeColors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 8,
    },
    suggestionText: {
      fontSize: 14 * fontScale,
      color: themeColors.text,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.headerRow}>
          <View style={dynamicStyles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={themeColors.text} />
            </TouchableOpacity>
            <Text style={dynamicStyles.headerTitle}>Chat with AI</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ChatSettings')}>
            <Ionicons name="settings" size={24} color={themeColors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Persona Selection */}
      <View style={dynamicStyles.personaContainer}>
        <Text style={dynamicStyles.personaLabel}>Chat Style:</Text>
        <View style={dynamicStyles.personaRow}>
          {personas.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              style={[
                dynamicStyles.personaButton,
                selectedPersona === persona.id 
                  ? dynamicStyles.personaButtonActive 
                  : dynamicStyles.personaButtonInactive
              ]}
              onPress={() => setSelectedPersona(persona.id)}
            >
              <Ionicons 
                name={persona.icon as any} 
                size={16} 
                color={selectedPersona === persona.id ? 'white' : themeColors.secondaryText} 
              />
              <Text style={[
                dynamicStyles.personaText,
                selectedPersona === persona.id 
                  ? dynamicStyles.personaTextActive 
                  : dynamicStyles.personaTextInactive
              ]}>
                {persona.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={dynamicStyles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              dynamicStyles.messageContainer,
              { alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start' }
            ]}
          >
            <View
              style={[
                message.sender === 'user' 
                  ? dynamicStyles.userMessage 
                  : dynamicStyles.botMessage
              ]}
            >
              <Text
                style={[
                  dynamicStyles.messageText,
                  message.sender === 'user' 
                    ? dynamicStyles.userMessageText 
                    : dynamicStyles.botMessageText
                ]}
              >
                {message.text}
              </Text>
              <Text
                style={[
                  {
                    fontSize: 12 * fontScale,
                    marginTop: 8,
                    opacity: 0.7,
                  },
                  message.sender === 'user' 
                    ? { color: 'rgba(255, 255, 255, 0.7)' } 
                    : { color: themeColors.secondaryText }
                ]}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Questions */}
      <View style={dynamicStyles.suggestionContainer}>
        <Text style={dynamicStyles.personaLabel}>Quick Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={dynamicStyles.personaRow}>
            {sampleQuestions.map((question, index) => (
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

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={dynamicStyles.inputContainer}>
          <TextInput
            style={dynamicStyles.textInput}
            placeholder="Ask about any bill or policy..."
            placeholderTextColor={themeColors.secondaryText}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              dynamicStyles.sendButton,
              { backgroundColor: inputText.trim() ? '#3B82F6' : themeColors.border }
            ]}
            onPress={() => {
              console.log('Send button pressed');
              sendMessage();
            }}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? 'white' : themeColors.secondaryText} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 