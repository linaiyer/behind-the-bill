import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SimulatorScreen({ navigation }: any) {
  const [selectedBill, setSelectedBill] = useState<string>('');
  const [userProfile, setUserProfile] = useState({
    age: '',
    location: '',
    occupation: '',
    interests: [] as string[]
  });

  const sampleBills = [
    {
      id: '1',
      title: 'Student Loan Forgiveness Act',
      category: 'education',
      impact: 'high'
    },
    {
      id: '2',
      title: 'Healthcare Access Expansion',
      category: 'healthcare',
      impact: 'medium'
    },
    {
      id: '3',
      title: 'Digital Privacy Protection',
      category: 'privacy',
      impact: 'high'
    }
  ];

  const impactAreas = [
    { name: 'Personal Finances', icon: 'wallet', color: 'bg-green-500' },
    { name: 'Healthcare Access', icon: 'medical', color: 'bg-blue-500' },
    { name: 'Education Opportunities', icon: 'school', color: 'bg-purple-500' },
    { name: 'Digital Privacy', icon: 'shield-checkmark', color: 'bg-red-500' },
    { name: 'Employment', icon: 'briefcase', color: 'bg-yellow-500' },
    { name: 'Community Impact', icon: 'people', color: 'bg-indigo-500' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 ml-4">Impact Simulator</Text>
          </View>
          <Text className="text-gray-600 mt-1">See how legislation affects your life</Text>
        </View>

        {/* User Profile Section */}
        <View className="px-6 py-6 bg-white mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Your Profile</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-gray-700 font-medium mb-2">Age Range</Text>
              <View className="flex-row gap-2">
                {['18-25', '26-35', '36-50', '51+'].map((age) => (
                  <TouchableOpacity
                    key={age}
                    className={`px-4 py-2 rounded-full border ${
                      userProfile.age === age ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`}
                    onPress={() => setUserProfile({...userProfile, age})}
                  >
                    <Text className={userProfile.age === age ? 'text-white' : 'text-gray-700'}>
                      {age}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Location</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                placeholder="Enter your city/state"
                value={userProfile.location}
                onChangeText={(text) => setUserProfile({...userProfile, location: text})}
              />
            </View>

            <View>
              <Text className="text-gray-700 font-medium mb-2">Occupation</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-4 py-3"
                placeholder="e.g., Student, Healthcare Worker, Tech Professional"
                value={userProfile.occupation}
                onChangeText={(text) => setUserProfile({...userProfile, occupation: text})}
              />
            </View>
          </View>
        </View>

        {/* Bill Selection */}
        <View className="px-6 py-6 bg-white mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Select a Bill to Simulate</Text>
          {sampleBills.map((bill) => (
            <TouchableOpacity
              key={bill.id}
              className={`p-4 rounded-xl mb-3 border ${
                selectedBill === bill.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onPress={() => setSelectedBill(bill.id)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900 mb-1">{bill.title}</Text>
                  <Text className="text-gray-600 text-sm capitalize">{bill.category}</Text>
                </View>
                <View className={`px-2 py-1 rounded-full ${getImpactColor(bill.impact)}`}>
                  <Text className="text-xs font-medium capitalize">{bill.impact} impact</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Impact Areas */}
        <View className="px-6 py-6 bg-white mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Impact Areas</Text>
          <View className="grid grid-cols-2 gap-3">
            {impactAreas.map((area) => (
              <TouchableOpacity
                key={area.name}
                className="p-4 rounded-xl border border-gray-200"
                onPress={() => navigation.navigate('ImpactDetail', { area: area.name })}
              >
                <View className={`w-10 h-10 rounded-full ${area.color} items-center justify-center mb-2`}>
                  <Ionicons name={area.icon as any} size={20} color="white" />
                </View>
                <Text className="font-medium text-gray-900">{area.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Simulate Button */}
        <View className="px-6 py-6">
          <TouchableOpacity
            className={`p-4 rounded-xl ${
              selectedBill && userProfile.age ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            disabled={!selectedBill || !userProfile.age}
            onPress={() => navigation.navigate('SimulationResult', { 
              billId: selectedBill, 
              userProfile 
            })}
          >
            <Text className="text-white text-center font-semibold text-lg">
              Run Impact Simulation
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 