// PetLog Screen - Original pet activity tracking
// Moved from App.js to support navigation

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ref, push, onValue } from 'firebase/database';
import { database } from '../services/firebase';

const PetLogScreen = () => {
  // State to store activities from Firebase
  const [activities, setActivities] = useState([]);

  // Listen for real-time updates from Firebase
  useEffect(() => {
    console.log('🔌 PetLog: Connecting to Firebase...');
    const activitiesRef = ref(database, 'activities');

    const unsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Firebase data received:', data);
      if (data) {
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

    return () => unsubscribe();
  }, []);

  // Function to log an activity to Firebase
  const logActivity = (type, emoji) => {
    const activitiesRef = ref(database, 'activities');

    push(activitiesRef, {
      type: type,
      emoji: emoji,
      timestamp: Date.now(),
      user: 'You'
    }).catch((error) => {
      Alert.alert('Error', 'Failed to log activity: ' + error.message);
    });
  };

  // Handler functions for each button
  const handlePoop = () => logActivity('Poop', '💩');
  const handlePee = () => logActivity('Pee', '💧');
  const handleFood = () => logActivity('Food', '🍖');
  const handleSleep = () => logActivity('Sleep', '😴');

  // Format timestamp to readable time
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

      <ScrollView>
        {/* Header section */}
        <View style={styles.header}>
          <Text style={styles.title}>PetLog</Text>
          <Text style={styles.subtitle}>Quick activity logging</Text>
        </View>

        {/* Button section */}
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
        </View>

        {/* Activity Feed */}
        <View style={styles.feedContainer}>
          <Text style={styles.feedTitle}>Recent Activity</Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyText}>No activities yet. Tap a button to start logging!</Text>
          ) : (
            activities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <Text style={styles.activityEmoji}>{activity.emoji}</Text>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityText}>
                    <Text style={styles.activityUser}>{activity.user}</Text> logged {activity.type}
                  </Text>
                  <Text style={styles.activityTime}>{formatTime(activity.timestamp)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

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
  buttonEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
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
  activityTime: {
    fontSize: 14,
    color: '#999',
  },
});

export default PetLogScreen;
