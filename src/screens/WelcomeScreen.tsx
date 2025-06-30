import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SurveyModal from './SurveyModal'; // adjust path as needed

const BG_COLOR = '#F7F8FA'; // subtle off-white
const TITLE_COLOR = '#111';
const SUBTITLE_COLOR = '#7A7A7A'; // softer gray
const BUTTON_COLOR = '#111'; // black by default
const BUTTON_COLOR_HIGHLIGHT = '#006666'; // darker highlight color on press
const BUTTON_SHADOW = { shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
};

type WelcomeScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const [pressed, setPressed] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const [showSurvey, setShowSurvey] = useState(false);

  const handlePressIn = () => {
    setPressed(true);
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 8,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowSurvey(true);
  };

  useEffect(() => {
    AsyncStorage.getItem('surveyCompleted').then((val) => {
      if (!val) setShowSurvey(true);
    });
  }, []);

  const handleSurveyClose = () => {
    setShowSurvey(false);
    setTimeout(() => {
      navigation.replace('Home');
    }, 200);
  };

  const handleSurveySubmit = (data: any) => {
    setShowSurvey(false);
    setTimeout(() => {
      navigation.replace('Home');
    }, 200);
    // Optionally: save survey data
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BG_COLOR,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}
    >
      <Text
        style={{
          fontSize: 44,
          color: TITLE_COLOR,
          textAlign: 'center',
          fontFamily: 'WorkSans_700Bold',
          marginBottom: 18,
          letterSpacing: 0.1,
        }}
      >
        {`Welcome to\nBehind the Bill`}
      </Text>
      <Text
        style={{
          fontSize: 20,
          color: SUBTITLE_COLOR,
          textAlign: 'center',
          fontFamily: 'WorkSans_400Regular',
          marginBottom: 48,
          lineHeight: 28,
        }}
      >
        {`Understand the context\nbehind the headlines.`}
      </Text>
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={{
            backgroundColor: pressed ? BUTTON_COLOR_HIGHLIGHT : BUTTON_COLOR,
            borderRadius: 30,
            paddingVertical: 18,
            paddingHorizontal: 48,
            minWidth: 220,
            ...BUTTON_SHADOW,
          }}
          activeOpacity={0.88}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel="Start Your Journey"
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 18,
              fontFamily: 'WorkSans_600SemiBold',
              textAlign: 'center',
              letterSpacing: 0.2,
            }}
          >
            Start Your Journey
          </Text>
        </TouchableOpacity>
      </Animated.View>
      <SurveyModal
        visible={showSurvey}
        onClose={handleSurveyClose}
        onSubmit={handleSurveySubmit}
      />
    </View>
  );
}
