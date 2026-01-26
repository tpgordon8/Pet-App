// Pet-App Main Entry Point
// Combined PetLog and Flight Deals application

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';

// Screens
import FlightDealsScreen from './src/screens/FlightDealsScreen';
import PetLogScreen from './src/screens/PetLogScreen';

// Navigation
import TabNavigator from './src/navigation/TabNavigator';

// Theme
import { COLORS } from './src/constants/theme';

export default function App() {
  const [activeTab, setActiveTab] = useState('flights'); // Default to flights

  return (
    <View style={styles.container}>
      {/* Screen Content */}
      {activeTab === 'flights' && <FlightDealsScreen />}
      {activeTab === 'petlog' && <PetLogScreen />}

      {/* Bottom Tab Navigation */}
      <TabNavigator
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
