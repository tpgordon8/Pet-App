import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, RefreshControl } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, serverTimestamp } from 'firebase/database';

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

export default function App() {
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

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 📋 Header section */}
        <View style={styles.header}>
          <Text style={styles.title}>PetLog</Text>
          <Text style={styles.subtitle}>Quick activity logging</Text>
        </View>

        {/* 📝 Optional note input */}
        <View style={styles.noteContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note (optional)..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />
          {note.trim() && (
            <TouchableOpacity onPress={() => setNote('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🔘 Button section */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.poopButton]} onPress={handlePoop}>
            <Text style={styles.buttonEmoji}>💩</Text>
            <Text style={styles.buttonText}>Poop</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.peeButton]} onPress={handlePee}>
            <Text style={styles.buttonEmoji}>💧</Text>
            <Text style={styles.buttonText}>Pee</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.foodButton]} onPress={handleFood}>
            <Text style={styles.buttonEmoji}>🍖</Text>
            <Text style={styles.buttonText}>Food</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.sleepButton]} onPress={handleSleep}>
            <Text style={styles.buttonEmoji}>😴</Text>
            <Text style={styles.buttonText}>Sleep</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.medsButton]} onPress={handleMeds}>
            <Text style={styles.buttonEmoji}>💊</Text>
            <Text style={styles.buttonText}>Meds</Text>
          </TouchableOpacity>
        </View>

        {/* 📱 Activity Feed (iMessage style) */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Recent Activity</Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No activities yet. Tap a button to start logging! 🐾</Text>
          ) : (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityUser}>{activity.user}</Text> logged {activity.type}
                  </Text>
                  {activity.note && (
                    <Text style={styles.activityNote}>"{activity.note}"</Text>
                  )}
                  <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  noteContainer: {
    position: 'relative',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  noteInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 60,
    maxHeight: 100,
  },
  clearButton: {
    position: 'absolute',
    right: 28,
    top: 8,
    backgroundColor: '#ccc',
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
    gap: 10,
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poopButton: {
    backgroundColor: '#8B4513',
  },
  peeButton: {
    backgroundColor: '#FFD700',
  },
  foodButton: {
    backgroundColor: '#FF6347',
  },
  sleepButton: {
    backgroundColor: '#4169E1',
  },
  medsButton: {
    backgroundColor: '#32CD32',
  },
  buttonEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  // 📱 Activity Feed Styles
  feedContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  activityEmoji: {
    fontSize: 32,
    marginRight: 15,
  },
  activityDetails: {
    flex: 1,
  },
  activityText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  activityUser: {
    fontWeight: 'bold',
    color: '#4169E1',
  },
  activityNote: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#999',
  },
});
