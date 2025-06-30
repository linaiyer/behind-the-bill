import React, { useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Animated, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const INTEREST_OPTIONS = [
  'Education',
  'Healthcare',
  'Privacy',
  'Economy',
  'Environment',
  'Social Justice',
  'Other',
];

const COMMON_LOCATIONS = [
  'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Miami, FL', 'San Francisco, CA', 'Seattle, WA', 'Boston, MA', 'Washington, DC', 'London, UK', 'Toronto, CA', 'Austin, TX', 'Dallas, TX', 'Philadelphia, PA', 'Atlanta, GA', 'Denver, CO', 'Phoenix, AZ', 'San Diego, CA', 'Portland, OR', 'Vancouver, CA', 'Paris, FR', 'Berlin, DE', 'Tokyo, JP', 'Sydney, AU', 'Other',
];
const COMMON_OCCUPATIONS = [
  'Student', 'Teacher', 'Engineer', 'Healthcare Worker', 'Artist', 'Entrepreneur', 'Researcher', 'Lawyer', 'Designer', 'Developer', 'Manager', 'Consultant', 'Scientist', 'Writer', 'Sales', 'Marketing', 'Finance', 'Public Servant', 'Other',
];

const HIGHLIGHT = '#008080';
const BLACK = '#111';

export default function SurveyModal({ visible, onClose, onSubmit }: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [age, setAge] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [showCustomInterest, setShowCustomInterest] = useState(false);
  const [ageFocused, setAgeFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const [occupationFocused, setOccupationFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showOccupationDropdown, setShowOccupationDropdown] = useState(false);
  const buttonAnim = useRef(new Animated.Value(0)).current; // 0: black, 1: highlight
  const scale = useRef(new Animated.Value(1)).current;
  const navigation = useNavigation();

  const ageRanges = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  const toggleInterest = (interest: string) => {
    if (interest === 'Other') {
      setShowCustomInterest(true);
      return;
    }
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
      setInterests([...interests, customInterest.trim()]);
      setCustomInterest('');
      setShowCustomInterest(false);
    }
  };

  const handleSubmit = () => {
    onSubmit({ age, ageRange, location, occupation, interests });
  };

  const handlePressIn = () => {
    setPressed(true);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setPressed(false);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 30,
        bounciness: 8,
      }),
      Animated.timing(buttonAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSubmit();
  };

  // Interpolate button color
  const buttonBg = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BLACK, HIGHLIGHT],
  });

  // Age/location/occupation input border color
  const ageBorderColor = ageFocused ? HIGHLIGHT : BLACK;
  const locationBorderColor = locationFocused ? HIGHLIGHT : BLACK;
  const occupationBorderColor = occupationFocused ? HIGHLIGHT : BLACK;

  // Autocomplete filtering
  const filteredLocations = location.length > 0 ? COMMON_LOCATIONS.filter(l => l.toLowerCase().includes(location.toLowerCase())) : COMMON_LOCATIONS;
  const filteredOccupations = occupation.length > 0 ? COMMON_OCCUPATIONS.filter(o => o.toLowerCase().includes(occupation.toLowerCase())) : COMMON_OCCUPATIONS;

  const handleSurveyClose = () => {
    onClose();
  };

  const handleSurveySubmit = (data: any) => {
    onSubmit(data);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { maxHeight: 500, width: '85%' }]}>
          <TouchableOpacity style={styles.closeButton} onPress={handleSurveyClose} accessibilityLabel="Close survey">
            <Text style={{ fontSize: 22, color: BLACK }}>×</Text>
          </TouchableOpacity>
          <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { marginTop: 32 }]}>Tell us a little about yourself!</Text>
            <Text style={[styles.subtitle, { marginTop: 8 }]}>This helps us personalize your experience. You can skip any question you're not comfortable answering.</Text>
            <Text style={styles.label}>Age</Text>
            <View style={styles.ageSectionWrap}>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: ageBorderColor, color: BLACK, minWidth: 80, maxWidth: 120 },
                ]}
                placeholder="Your age"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                maxLength={3}
                onFocus={() => setAgeFocused(true)}
                onBlur={() => setAgeFocused(false)}
              />
            </View>
            <View style={{ height: 12 }} />
            <View style={styles.ageChipsGrid}>
              {ageRanges.map((range, idx) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.chip,
                    ageRange === range && { backgroundColor: HIGHLIGHT, borderColor: HIGHLIGHT },
                    { width: '30%', marginRight: (idx + 1) % 3 === 0 ? 0 : '5%', marginBottom: 10, alignItems: 'center' },
                  ]}
                  onPress={() => setAgeRange(ageRange === range ? '' : range)}
                >
                  <Text style={{ color: ageRange === range ? '#fff' : BLACK, fontSize: 14 }}>{range}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ height: 18 }} />
            <Text style={styles.label}>Location</Text>
            <View style={{ zIndex: 10, marginBottom: showLocationDropdown && locationFocused && filteredLocations.length > 0 ? 60 : 0 }}>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: locationBorderColor, color: BLACK },
                ]}
                placeholder="City, State or Country"
                placeholderTextColor="#888"
                value={location}
                onChangeText={text => { setLocation(text); setShowLocationDropdown(true); }}
                onFocus={() => setLocationFocused(true)}
                onBlur={() => setTimeout(() => setShowLocationDropdown(false), 150)}
              />
              {locationFocused && showLocationDropdown && filteredLocations.length > 0 && (
                <View style={styles.dropdownOverlay}>
                  <ScrollView style={styles.dropdownScroll}>
                    {filteredLocations.map((loc) => (
                      <TouchableOpacity key={loc} onPress={() => { setLocation(loc); setShowLocationDropdown(false); }}>
                        <Text style={styles.dropdownItem}>{loc}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <View style={{ height: 10 }} />
            <Text style={styles.label}>Occupation</Text>
            <View style={{ zIndex: 9, marginBottom: showOccupationDropdown && occupationFocused && filteredOccupations.length > 0 ? 60 : 0 }}>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: occupationBorderColor, color: BLACK },
                ]}
                placeholder="e.g. Student, Teacher, Engineer"
                placeholderTextColor="#888"
                value={occupation}
                onChangeText={text => { setOccupation(text); setShowOccupationDropdown(true); }}
                onFocus={() => setOccupationFocused(true)}
                onBlur={() => setTimeout(() => setShowOccupationDropdown(false), 150)}
              />
              {occupationFocused && showOccupationDropdown && filteredOccupations.length > 0 && (
                <View style={styles.dropdownOverlay}>
                  <ScrollView style={styles.dropdownScroll}>
                    {filteredOccupations.map((occ) => (
                      <TouchableOpacity key={occ} onPress={() => { setOccupation(occ); setShowOccupationDropdown(false); }}>
                        <Text style={styles.dropdownItem}>{occ}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
            <Text style={styles.label}>Interests</Text>
            <View style={styles.interestsWrap}>
              {INTEREST_OPTIONS.map((interest) => {
                const selected = interests.includes(interest);
                if (interest === 'Other') {
                  return (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.chip,
                        selected && { backgroundColor: HIGHLIGHT, borderColor: HIGHLIGHT },
                      ]}
                      onPress={() => {
                        if (selected) {
                          setInterests(interests.filter(i => i !== 'Other'));
                          setShowCustomInterest(false);
                        } else {
                          setInterests([...interests, 'Other']);
                          setShowCustomInterest(true);
                        }
                      }}
                    >
                      <Text style={{ color: selected ? '#fff' : BLACK }}>{interest}</Text>
                    </TouchableOpacity>
                  );
                }
                return (
                  <TouchableOpacity
                    key={interest}
                    style={[
                      styles.chip,
                      selected && { backgroundColor: HIGHLIGHT, borderColor: HIGHLIGHT },
                    ]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={{ color: selected ? '#fff' : BLACK }}>{interest}</Text>
                  </TouchableOpacity>
                );
              })}
              {showCustomInterest && (
                <View style={styles.customInterestWrap}>
                  <TextInput
                    style={[
                      styles.input,
                      { borderColor: HIGHLIGHT, color: BLACK, minWidth: 100, maxWidth: 180 },
                    ]}
                    placeholder="Add topic"
                    placeholderTextColor="#888"
                    value={customInterest}
                    onChangeText={setCustomInterest}
                    onSubmitEditing={() => {
                      if (customInterest.trim() && !interests.includes(customInterest.trim())) {
                        setInterests([...interests, customInterest.trim()]);
                        setCustomInterest('');
                        setShowCustomInterest(false);
                      }
                    }}
                  />
                  <TouchableOpacity onPress={() => {
                    if (customInterest.trim() && !interests.includes(customInterest.trim())) {
                      setInterests([...interests, customInterest.trim()]);
                      setCustomInterest('');
                      setShowCustomInterest(false);
                    }
                  }} style={[styles.chip, { backgroundColor: HIGHLIGHT, borderColor: HIGHLIGHT, marginLeft: 6 }]}> 
                    <Text style={{ color: '#fff' }}>Add</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* Show custom interests as selected chips */}
              {interests.filter(i => !INTEREST_OPTIONS.includes(i)).map(custom => (
                <TouchableOpacity
                  key={custom}
                  style={[styles.chip, { backgroundColor: HIGHLIGHT, borderColor: HIGHLIGHT }]}
                  onPress={() => setInterests(interests.filter(i => i !== custom))}
                >
                  <Text style={{ color: '#fff' }}>{custom}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Animated.View style={[{ transform: [{ scale }], marginTop: 6, backgroundColor: buttonBg, borderRadius: 18, alignSelf: 'center', minWidth: 120 }, styles.submitButton]}>
              <TouchableOpacity
                style={{ alignItems: 'center', paddingVertical: 8, paddingHorizontal: 18 }}
                activeOpacity={0.88}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => handleSurveySubmit({ age, ageRange, location, occupation, interests })}
                accessibilityRole="button"
              >
                <Text style={styles.submitText}>Save & Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '85%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontFamily: 'WorkSans_700Bold',
    color: '#111',
    marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#111',
    fontFamily: 'WorkSans_400Regular',
    marginBottom: 18,
    textAlign: 'center',
  },
  label: {
    fontSize: 15,
    color: '#111',
    fontFamily: 'WorkSans_600SemiBold',
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 10,
    padding: 8,
    fontSize: 16,
    fontFamily: 'WorkSans_400Regular',
    backgroundColor: '#fff',
    flex: 1,
    marginRight: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  ageChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    marginLeft: 0,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  chipSelected: {
    backgroundColor: HIGHLIGHT,
    borderColor: HIGHLIGHT,
  },
  interestsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    alignItems: 'center',
  },
  customInterestWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 2,
    maxHeight: 120,
    zIndex: 100,
    position: 'absolute',
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownOverlay: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 44,
    maxHeight: 120,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownScroll: {
    maxHeight: 120,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 15,
    color: '#111',
  },
  submitButton: {
    backgroundColor: '#111',
    borderRadius: 18,
    alignItems: 'center',
    minWidth: 120,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'WorkSans_600SemiBold',
  },
  ageSectionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 0,
  },
}); 