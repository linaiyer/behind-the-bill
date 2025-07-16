import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { detectSpecificPoliticalTerms, HighlightedTerm } from '../utils/politicalTerms';

interface HighlightedTextProps {
  text: string;
  onTermPress?: (term: string, category: string) => void;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, onTermPress }) => {
  const [highlightedTerms, setHighlightedTerms] = useState<HighlightedTerm[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle undefined or null text
  if (!text || typeof text !== 'string') {
    return <Text style={{ color: '#111111', fontSize: 16, fontFamily: 'WorkSans_400Regular', lineHeight: 26 }}></Text>;
  }

  useEffect(() => {
    setIsLoading(true);
    try {
      const terms = detectSpecificPoliticalTerms(text);
      setHighlightedTerms(terms);
    } catch (err) {
      console.error('Failed to analyze text:', err);
      setHighlightedTerms([]);
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  // Show loading state
  if (isLoading) {
    return (
      <View style={{ 
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8
      }}>
        <ActivityIndicator size="small" color="#008080" style={{ marginRight: 8 }} />
        <Text style={{ 
          color: '#6B6B6B', 
          fontSize: 14, 
          fontFamily: 'WorkSans_400Regular',
          fontStyle: 'italic'
        }}>
          Analyzing political terms...
        </Text>
      </View>
    );
  }

  // Show plain text if no terms detected or error occurred
  if (highlightedTerms.length === 0) {
    return (
      <Text style={{ 
        color: '#111111', 
        fontSize: 16, 
        fontFamily: 'WorkSans_400Regular', 
        lineHeight: 26,
        textAlign: 'justify'
      }}>
        {text}
      </Text>
    );
  }

  const elements = [];
  let lastIndex = 0;

  highlightedTerms.forEach((term, index) => {
    // Add text before the term
    if (term.startIndex > lastIndex) {
      elements.push(
        <Text key={`text-${index}`}>
          {text.substring(lastIndex, term.startIndex)}
        </Text>
      );
    }

    // Add the highlighted term with relevance-based styling
    elements.push(
      <Text
        key={`term-${index}`}
        onPress={() => onTermPress?.(term.term, term.category)}
        style={{
          textDecorationLine: 'underline',
          textDecorationColor: '#008080',
          textDecorationStyle: 'solid',
          backgroundColor: 'rgba(0, 128, 128, 0.1)',
        }}
      >
        {term.fullPhrase}
      </Text>
    );

    lastIndex = term.endIndex;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    elements.push(
      <Text key="text-end">
        {text.substring(lastIndex)}
      </Text>
    );
  }

  return (
    <Text style={{ 
      color: '#111111', 
      fontSize: 16, 
      fontFamily: 'WorkSans_400Regular', 
      lineHeight: 26,
      textAlign: 'justify'
    }}>
      {elements}
    </Text>
  );
};