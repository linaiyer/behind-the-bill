import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  persona?: string;
}

export default function ChatScreen({ navigation }: any) {
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
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 ml-4">Chat with AI</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('ChatSettings')}>
            <Ionicons name="settings" size={24} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Persona Selection */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-sm font-medium text-gray-700 mb-2">Chat Style:</Text>
        <View className="flex-row gap-2">
          {personas.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              className={`px-3 py-2 rounded-full flex-row items-center ${
                selectedPersona === persona.id ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onPress={() => setSelectedPersona(persona.id)}
            >
              <Ionicons 
                name={persona.icon as any} 
                size={16} 
                color={selectedPersona === persona.id ? 'white' : '#6B7280'} 
              />
              <Text className={`ml-1 text-sm font-medium ${
                selectedPersona === persona.id ? 'text-white' : 'text-gray-700'
              }`}>
                {persona.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-6 py-4"
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            className={`mb-4 ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <View
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.sender === 'user'
                  ? 'bg-blue-500'
                  : 'bg-white border border-gray-200'
              }`}
            >
              <Text
                className={`${
                  message.sender === 'user' ? 'text-white' : 'text-gray-900'
                }`}
              >
                {message.text}
              </Text>
              <Text
                className={`text-xs mt-2 ${
                  message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Questions */}
      <View className="px-6 py-4 bg-white border-t border-gray-200">
        <Text className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {sampleQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                className="bg-gray-100 px-3 py-2 rounded-full"
                onPress={() => setInputText(question)}
              >
                <Text className="text-sm text-gray-700">{question}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="bg-white border-t border-gray-200"
      >
        <View className="flex-row items-center px-6 py-4">
          <TextInput
            className="flex-1 border border-gray-300 rounded-full px-4 py-3 mr-3"
            placeholder="Ask about any bill or policy..."
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            className={`w-10 h-10 rounded-full items-center justify-center ${
              inputText.trim() ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color={inputText.trim() ? 'white' : '#9CA3AF'} 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 