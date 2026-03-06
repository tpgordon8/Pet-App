import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, RefreshControl } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

// Contexts
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PetProvider, usePets } from './contexts/PetContext';

// Components
import { Header } from './components/layout/Header';
import { PetSelector } from './components/pet/PetSelector';
import { Droplet, Droplets, UtensilsCrossed, Moon as MoonIcon, Pill } from 'lucide-react-native';

// 🔥 Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZeE0mf4ptN0wunDbEFbgMZ29nfWIA4NQ",
  authDomain: "petlog-c4c1e.firebaseapp.com",
  databaseURL: "https://petlog-c4c1e-default-rtdb.firebaseio.com",
  projectId: "petlog-c4c1e",
  storageBucket: "petlog-c4c1e.firebasestorage.app",
  messagingSenderId: "417384966953",
  appId: "1:417384966953:web:8b00d0cac96e2b7ec2a538"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Main App Component (wrapped in contexts)
function AppContent() {
  const { colors } = useTheme();
  const { selectedPetId, getSelectedPets } = usePets();
  // 📊 State to store activities from Firebase
  const [activities, setActivities] = useState([]);
  // 📝 State for optional note input
  const [note, setNote] = useState('');
  // 🔄 State for pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // 🎧 Listen for real-time updates from Firebase
  useEffect(() => {
    console.log('🔌 Connecting to Firebase...');
    const activitiesRef = ref(database, 'activities');

    // This runs every time data changes in Firebase!
    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Firebase data received:', data);
      if (data) {
        // Convert object to array and sort by timestamp (newest first)
        const activitiesArray = Object.entries(data).map(([id, activity]) => ({
          id,
          ...activity
        })).sort((a, b) => b.timestamp - a.timestamp);

        console.log('✅ Activities:', activitiesArray.length);
        setActivities(activitiesArray);
      } else {
        console.log('⚠️ No activities found');
        setActivities([]);
      }
    }, (error) => {
      console.log('❌ Firebase error:', error);
      Alert.alert('Connection Error', 'Cannot connect to Firebase: ' + error.message);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  // 📝 Function to log an activity to Firebase
  const logActivity = (type, emoji) => {
    const activitiesRef = ref(database, 'activities');

    const activityData = {
      type: type,
      emoji: emoji,
      timestamp: Date.now(),
      user: 'You' // Later we'll add real user names
    };

    // Add note if one was entered
    if (note.trim()) {
      activityData.note = note.trim();
    }

    push(activitiesRef, activityData)
      .then(() => {
        // Clear note after successful log
        setNote('');
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to log activity: ' + error.message);
      });
  };

  // 🔄 Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    // Firebase real-time listener handles data updates automatically
    // Just show refresh animation briefly for user feedback
    setTimeout(() => {
      setRefreshing(false);
    }, 500);
  };

  // 🔘 Handler functions for each button
  const handlePoop = () => logActivity('Poop', '💩');
  const handlePee = () => logActivity('Pee', '💧');
  const handleFood = () => logActivity('Food', '🍖');
  const handleSleep = () => logActivity('Sleep', '😴');
  const handleMeds = () => logActivity('Meds', '💊');

  // 🕐 Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // 🎨 Get icon component for activity type
  const getActivityIcon = (type) => {
    const iconProps = { size: 20, strokeWidth: 2 };
    const iconColor = colors.activity[type.toLowerCase()]?.icon || colors.primary;

    switch(type.toLowerCase()) {
      case 'poop':
        return <Droplet {...iconProps} color={iconColor} />;
      case 'pee':
        return <Droplets {...iconProps} color={iconColor} />;
      case 'food':
        return <UtensilsCrossed {...iconProps} color={iconColor} />;
      case 'sleep':
        return <MoonIcon {...iconProps} color={iconColor} />;
      case 'meds':
        return <Pill {...iconProps} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />

      {/* Header with dark mode toggle */}
      <Header />

      {/* Pet Selector */}
      <PetSelector />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >

        {/* 📝 Optional note input */}
        <View style={styles.noteContainer}>
          <TextInput
            style={[styles.noteInput, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text
            }]}
            placeholder="Add a note (optional)..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />
          {note.trim() && (
            <TouchableOpacity
              onPress={() => setNote('')}
              style={[styles.clearButton, { backgroundColor: colors.textSecondary }]}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🔘 Button section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.activity.poop.bg }]}
            onPress={handlePoop}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.activity.poop.icon + '20' }]}>
              <Droplet size={24} color={colors.activity.poop.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.buttonText, { color: colors.activity.poop.text }]}>Poop</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.activity.pee.bg }]}
            onPress={handlePee}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.activity.pee.icon + '20' }]}>
              <Droplets size={24} color={colors.activity.pee.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.buttonText, { color: colors.activity.pee.text }]}>Pee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.activity.food.bg }]}
            onPress={handleFood}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.activity.food.icon + '20' }]}>
              <UtensilsCrossed size={24} color={colors.activity.food.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.buttonText, { color: colors.activity.food.text }]}>Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.activity.sleep.bg }]}
            onPress={handleSleep}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.activity.sleep.icon + '20' }]}>
              <MoonIcon size={24} color={colors.activity.sleep.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.buttonText, { color: colors.activity.sleep.text }]}>Sleep</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.activity.meds.bg }]}
            onPress={handleMeds}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.activity.meds.icon + '20' }]}>
              <Pill size={24} color={colors.activity.meds.icon} strokeWidth={2} />
            </View>
            <Text style={[styles.buttonText, { color: colors.activity.meds.text }]}>Meds</Text>
          </TouchableOpacity>
        </View>

        {/* 📱 Activity Feed */}
        <View style={[styles.feedContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feedTitle, { color: colors.text }]}>Recent Activity</Text>
          {activities.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No activities yet. Tap a button to start logging! 🐾
            </Text>
          ) : (
            activities.map((activity) => (
              <View
                key={activity.id}
                style={[styles.activityItem, { backgroundColor: colors.background }]}
              >
                <View style={[styles.activityIconCircle, {
                  backgroundColor: colors.activity[activity.type.toLowerCase()]?.bg || colors.card
                }]}>
                  {getActivityIcon(activity.type)}
                </View>
                <View style={styles.activityDetails}>
                  <Text style={[styles.activityText, { color: colors.text }]}>
                    <Text style={[styles.activityUser, { color: colors.primary }]}>
                      {activity.user}
                    </Text> logged {activity.type}
                  </Text>
                  {activity.note && (
                    <Text style={[styles.activityNote, { color: colors.textSecondary }]}>
                      "{activity.note}"
                    </Text>
                  )}
                  <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
                    {formatTime(activity.timestamp)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Wrap with providers
export default function App() {
  return (
    <ThemeProvider>
      <PetProvider database={database}>
        <AppContent />
      </PetProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  noteContainer: {
    position: 'relative',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  noteInput: {
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 60,
    maxHeight: 100,
  },
  clearButton: {
    position: 'absolute',
    right: 28,
    top: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },

  // 📱 Activity Feed Styles
  feedContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    marginTop: 40,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  activityIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 15,
    marginBottom: 2,
  },
  activityUser: {
    fontWeight: '600',
  },
  activityNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 2,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
  },
});
