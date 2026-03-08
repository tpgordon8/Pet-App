import { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, RefreshControl } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue, remove, update } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Contexts
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { PetProvider, usePets } from './contexts/PetContext';

// Components
import { Header } from './components/layout/Header';
import { PetSelector } from './components/pet/PetSelector';
import { IntroScreen, isOnboardingComplete } from './components/onboarding/IntroScreen';
import { MedicationManager } from './components/medication/MedicationManager';
import { pickImage, uploadImageToStorage } from './utils/imageUpload';
import { Droplet, Droplets, UtensilsCrossed, Moon as MoonIcon, Pill, Undo2, Copy, Clock, Camera, X } from 'lucide-react-native';
import { Image } from 'react-native';

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
const storage = getStorage(app);

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
  // 🎯 State for onboarding
  const [showIntro, setShowIntro] = useState(null); // null = checking, true = show, false = hide
  // ↩️ State to track last activity for undo
  const [lastActivityId, setLastActivityId] = useState(null);
  // 📋 State to track last activity data for duplicate
  const [lastActivityData, setLastActivityData] = useState(null);
  // 📷 State for selected photo
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // 🎯 Check if onboarding is complete on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await isOnboardingComplete();
      setShowIntro(!completed);
    };
    checkOnboarding();
  }, []);

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
  const logActivity = async (type, emoji) => {
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

    push(activitiesRef, activityData)
      .then((newActivityRef) => {
        // Track the last activity for undo and duplicate
        setLastActivityId(newActivityRef.key);
        setLastActivityData({ type, emoji, note: activityData.note });
        // Clear note and photo after successful log
        setNote('');
        setSelectedPhoto(null);
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to log activity: ' + error.message);
      });
  };

  // 📋 Function to duplicate the last activity
  const duplicateLastActivity = () => {
    if (!lastActivityData) {
      Alert.alert('Nothing to Duplicate', 'No recent activity to duplicate.');
      return;
    }

    // Log the same activity again with a new timestamp
    logActivity(lastActivityData.type, lastActivityData.emoji);
  };

  // 🕐 Function to adjust activity timestamp
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

  // ↩️ Function to undo the last activity
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

  // Show loading state while checking onboarding
  if (showIntro === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  // Show intro screen if onboarding not complete
  if (showIntro) {
    return <IntroScreen onComplete={() => setShowIntro(false)} />;
  }

  // Filter activities by selected pet
  const filteredActivities = selectedPetId === 'all'
    ? activities
    : activities.filter(activity => activity.petId === selectedPetId);

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

        {/* 📷 Photo picker and preview */}
        <View style={styles.photoContainer}>
          {selectedPhoto ? (
            <View style={[styles.photoPreview, { borderColor: colors.border }]}>
              <Image source={{ uri: selectedPhoto.uri }} style={styles.photoImage} />
              <TouchableOpacity
                onPress={() => setSelectedPhoto(null)}
                style={[styles.removePhotoButton, { backgroundColor: colors.textSecondary }]}
              >
                <X size={16} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={async () => {
                const image = await pickImage();
                if (image) setSelectedPhoto(image);
              }}
              style={[styles.addPhotoButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Camera size={20} color={colors.primary} strokeWidth={2} />
              <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ↩️ Quick action buttons */}
        {(lastActivityId || lastActivityData) && (
          <View style={styles.quickActionsContainer}>
            {lastActivityId && (
              <TouchableOpacity
                onPress={undoLastActivity}
                style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Undo2 size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.quickActionText, { color: colors.primary }]}>Undo</Text>
              </TouchableOpacity>
            )}
            {lastActivityData && (
              <TouchableOpacity
                onPress={duplicateLastActivity}
                style={[styles.quickActionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Copy size={16} color={colors.primary} strokeWidth={2} />
                <Text style={[styles.quickActionText, { color: colors.primary }]}>
                  Repeat {lastActivityData.type}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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

        {/* 💊 Medication Manager */}
        <MedicationManager database={database} />

        {/* 📱 Activity Feed */}
        <View style={[styles.feedContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.feedTitle, { color: colors.text }]}>Recent Activity</Text>
          {filteredActivities.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No activities yet. Tap a button to start logging! 🐾
            </Text>
          ) : (
            filteredActivities.map((activity) => {
              const isRecent = Date.now() - activity.timestamp < 2 * 60 * 60 * 1000; // 2 hours
              return (
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
                    {activity.photoURL && (
                      <Image
                        source={{ uri: activity.photoURL }}
                        style={[styles.activityPhoto, { borderColor: colors.border }]}
                      />
                    )}
                    <Text style={[styles.activityTime, { color: colors.textTertiary }]}>
                      {formatTime(activity.timestamp)}
                    </Text>
                  </View>
                  {isRecent && (
                    <TouchableOpacity
                      onPress={() => adjustActivityTime(activity.id, activity.timestamp)}
                      style={[styles.timeAdjustButton, { backgroundColor: colors.card }]}
                    >
                      <Clock size={16} color={colors.textSecondary} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
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
  photoContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  photoPreview: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
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
    display: 'flex', // Ensure flexbox is used
    flexDirection: 'row', // Ensure proper flex direction
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
    display: 'flex',
    flexDirection: 'row',
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
  activityPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  activityTime: {
    fontSize: 13,
  },
  timeAdjustButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
