import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  // 📝 These functions run when you tap a button
  // For now, they just show a popup message
  // Later, we'll save to Firebase instead!

  const handlePoop = () => {
    Alert.alert('Logged!', '💩 Poop logged successfully');
  };

  const handlePee = () => {
    Alert.alert('Logged!', '💧 Pee logged successfully');
  };

  const handleFood = () => {
    Alert.alert('Logged!', '🍖 Food logged successfully');
  };

  const handleSleep = () => {
    Alert.alert('Logged!', '😴 Sleep logged successfully');
  };

  return (
    <View style={styles.container}>
      {/* 📱 Status bar at the top of the screen */}
      <StatusBar style="auto" />

      {/* 📋 Header section */}
      <View style={styles.header}>
        <Text style={styles.title}>PetLog</Text>
        <Text style={styles.subtitle}>Quick activity logging</Text>
      </View>

      {/* 🔘 Button section */}
      <View style={styles.buttonContainer}>

        {/* 💩 Poop Button */}
        <TouchableOpacity
          style={[styles.button, styles.poopButton]}
          onPress={handlePoop}
        >
          <Text style={styles.buttonEmoji}>💩</Text>
          <Text style={styles.buttonText}>Poop</Text>
        </TouchableOpacity>

        {/* 💧 Pee Button */}
        <TouchableOpacity
          style={[styles.button, styles.peeButton]}
          onPress={handlePee}
        >
          <Text style={styles.buttonEmoji}>💧</Text>
          <Text style={styles.buttonText}>Pee</Text>
        </TouchableOpacity>

        {/* 🍖 Food Button */}
        <TouchableOpacity
          style={[styles.button, styles.foodButton]}
          onPress={handleFood}
        >
          <Text style={styles.buttonEmoji}>🍖</Text>
          <Text style={styles.buttonText}>Food</Text>
        </TouchableOpacity>

        {/* 😴 Sleep Button */}
        <TouchableOpacity
          style={[styles.button, styles.sleepButton]}
          onPress={handleSleep}
        >
          <Text style={styles.buttonEmoji}>😴</Text>
          <Text style={styles.buttonText}>Sleep</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 📦 Main container - holds everything
  container: {
    flex: 1,  // Take up full screen
    backgroundColor: '#f5f5f5',  // Light gray background
    paddingTop: 60,  // Space at top for status bar
  },

  // 📋 Header styles
  header: {
    alignItems: 'center',  // Center text horizontally
    marginBottom: 40,  // Space below header
  },
  title: {
    fontSize: 36,  // Big text
    fontWeight: 'bold',  // Make it bold
    color: '#333',  // Dark gray
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',  // Medium gray
  },

  // 🔘 Button container - holds all 4 buttons
  buttonContainer: {
    flex: 1,  // Take remaining space
    paddingHorizontal: 20,  // Space on left/right
    gap: 15,  // Space between buttons
  },

  // 🔘 Base button style (shared by all buttons)
  button: {
    flexDirection: 'row',  // Emoji and text side-by-side
    alignItems: 'center',  // Center vertically
    justifyContent: 'center',  // Center horizontally
    paddingVertical: 25,  // Tall buttons (easier to tap)
    borderRadius: 15,  // Rounded corners
    shadowColor: '#000',  // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,  // Shadow on Android
  },

  // 💩 Poop button - brown color
  poopButton: {
    backgroundColor: '#8B4513',  // Brown
  },

  // 💧 Pee button - yellow color
  peeButton: {
    backgroundColor: '#FFD700',  // Gold/Yellow
  },

  // 🍖 Food button - orange color
  foodButton: {
    backgroundColor: '#FF6347',  // Tomato/Orange-red
  },

  // 😴 Sleep button - blue color
  sleepButton: {
    backgroundColor: '#4169E1',  // Royal Blue
  },

  // 📝 Text inside buttons
  buttonEmoji: {
    fontSize: 32,  // Big emoji
    marginRight: 10,  // Space between emoji and text
  },
  buttonText: {
    fontSize: 22,  // Big text
    fontWeight: '600',  // Semi-bold
    color: 'white',  // White text on colored buttons
  },
});
