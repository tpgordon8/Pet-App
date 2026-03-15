import { useState, useEffect } from 'react';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { Alert } from 'react-native';
import { uploadImageToStorage } from '../utils/imageUpload';

/**
 * Custom hook to manage activity logging and operations
 * @param {Object} database - Firebase database instance
 * @param {Object} storage - Firebase storage instance
 * @param {string} selectedPetId - Currently selected pet ID
 * @returns {Object} Activity management functions and state
 */
export const useActivities = (database, storage, selectedPetId) => {
  // 📊 State to store activities from Firebase
  const [activities, setActivities] = useState([]);
  // ↩️ State to track last activity for undo
  const [lastActivityId, setLastActivityId] = useState(null);
  // 📋 State to track last activity data for duplicate
  const [lastActivityData, setLastActivityData] = useState(null);

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
  }, [database]);

  /**
   * Log an activity to Firebase
   * @param {string} type - Activity type (Poop, Pee, Food, Sleep, Meds)
   * @param {string} emoji - Emoji representation
   * @param {string} note - Optional note
   * @param {Object} selectedPhoto - Optional photo object with uri
   */
  const logActivity = async (type, emoji, note = '', selectedPhoto = null) => {
    const activitiesRef = ref(database, 'activities');

    const activityData = {
      type: type,
      emoji: emoji,
      timestamp: Date.now(),
      user: 'You', // Later we'll add real user names
      petId: selectedPetId // Associate activity with selected pet
    };

    // Add note if one was entered
    if (note.trim()) {
      activityData.note = note.trim();
    }

    // Upload photo if one was selected
    if (selectedPhoto) {
      try {
        const photoURL = await uploadImageToStorage(storage, selectedPhoto.uri, selectedPetId);
        activityData.photoURL = photoURL;
      } catch (error) {
        Alert.alert('Upload Error', 'Failed to upload photo. Logging without photo.');
      }
    }

    try {
      const newActivityRef = await push(activitiesRef, activityData);
      // Track the last activity for undo and duplicate
      setLastActivityId(newActivityRef.key);
      setLastActivityData({ type, emoji, note: activityData.note });
      return true; // Success
    } catch (error) {
      Alert.alert('Error', 'Failed to log activity: ' + error.message);
      return false; // Failure
    }
  };

  /**
   * Duplicate the last activity with a new timestamp
   */
  const duplicateLastActivity = (note = '', selectedPhoto = null) => {
    if (!lastActivityData) {
      Alert.alert('Nothing to Duplicate', 'No recent activity to duplicate.');
      return;
    }

    // Log the same activity again with a new timestamp
    logActivity(lastActivityData.type, lastActivityData.emoji, note, selectedPhoto);
  };

  /**
   * Adjust the timestamp of an activity
   * @param {string} activityId - ID of the activity to adjust
   * @param {number} currentTimestamp - Current timestamp in milliseconds
   */
  const adjustActivityTime = (activityId, currentTimestamp) => {
    const timeOptions = [
      { label: '- 30 minutes', minutes: -30 },
      { label: '- 15 minutes', minutes: -15 },
      { label: '- 5 minutes', minutes: -5 },
      { label: '+ 5 minutes', minutes: 5 },
      { label: '+ 15 minutes', minutes: 15 },
      { label: '+ 30 minutes', minutes: 30 },
    ];

    Alert.alert(
      'Adjust Time',
      'How much should we adjust this activity\'s time?',
      [
        ...timeOptions.map(option => ({
          text: option.label,
          onPress: () => {
            const newTimestamp = currentTimestamp + (option.minutes * 60000);
            const activityRef = ref(database, `activities/${activityId}`);
            update(activityRef, { timestamp: newTimestamp })
              .catch((error) => {
                Alert.alert('Error', 'Failed to adjust time: ' + error.message);
              });
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  /**
   * Undo the last activity
   */
  const undoLastActivity = () => {
    if (!lastActivityId) {
      Alert.alert('Nothing to Undo', 'No recent activity to undo.');
      return;
    }

    const activityRef = ref(database, `activities/${lastActivityId}`);

    Alert.alert(
      'Undo Last Activity',
      'Are you sure you want to delete the last activity?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Undo',
          style: 'destructive',
          onPress: () => {
            remove(activityRef)
              .then(() => {
                setLastActivityId(null);
              })
              .catch((error) => {
                Alert.alert('Error', 'Failed to undo activity: ' + error.message);
              });
          }
        }
      ]
    );
  };

  return {
    activities,
    logActivity,
    undoLastActivity,
    adjustActivityTime,
    duplicateLastActivity,
    lastActivityId,
    lastActivityData,
  };
};
