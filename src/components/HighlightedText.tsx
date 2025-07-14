import React, { useState, useEffect } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { extractPoliticalEntitiesWithAI, ExtractedEntity } from '../utils/aiEntityExtraction';

interface HighlightedTextProps {
  text: string;
  onTermPress?: (term: string, category: string) => void;
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({ text, onTermPress }) => {
  const [detectedEntities, setDetectedEntities] = useState<ExtractedEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Handle undefined or null text
  if (!text || typeof text !== 'string') {
    return <Text style={{ color: '#111111', fontSize: 16, fontFamily: 'WorkSans_400Regular', lineHeight: 26 }}></Text>;
  }

  useEffect(() => {
    const detectEntities = async () => {
      setIsLoading(true);
      try {
        const entities = await extractPoliticalEntitiesWithAI(text);
        setDetectedEntities(entities);
      } catch (error) {
        console.error('Error detecting political entities:', error);
        setDetectedEntities([]);
      } finally {
        setIsLoading(false);
      }
    };

    detectEntities();
  }, [text]);

  // Show loading or plain text while detecting
  if (isLoading || detectedEntities.length === 0) {
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

  detectedEntities.forEach((entity, index) => {
    // Add text before the entity
    if (entity.startIndex > lastIndex) {
      elements.push(
        <Text key={`text-${index}`}>
          {text.substring(lastIndex, entity.startIndex)}
        </Text>
      );
    }

    // Add the highlighted entity (full phrase, but pass specific name to context)
    const displayName = entity.specificName || entity.term;
    elements.push(
      <TouchableOpacity
        key={`entity-${index}`}
        onPress={() => onTermPress?.(displayName, entity.category)}
        style={{ backgroundColor: 'transparent' }}
      >
        <Text
          style={{
            color: '#111111',
            textDecorationLine: 'underline',
            textDecorationColor: '#008080',
            textDecorationStyle: 'solid',
            fontWeight: '500',
          }}
        >
          {entity.fullPhrase}
        </Text>
      </TouchableOpacity>
    );

    lastIndex = entity.endIndex;
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