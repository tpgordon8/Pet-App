import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Pill, Plus, X, Clock, Calendar, Check } from 'lucide-react-native';
import { ref, push, onValue, remove, update } from 'firebase/database';
import { useTheme } from '../../contexts/ThemeContext';
import { usePets } from '../../contexts/PetContext';
import { typography, spacing, borderRadius } from '../../utils/theme';
import { scheduleMedicationNotification, cancelMedicationNotification } from '../../utils/notifications';

export function MedicationManager({ database }) {
  const { colors } = useTheme();
  const { selectedPetId, getSelectedPets } = usePets();
  const [medications, setMedications] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    frequency: 'daily', // daily, twice-daily, weekly
    timeOfDay: '09:00',
  });

  // Load medications for selected pet
  useEffect(() => {
    if (selectedPetId === 'all') {
      setMedications([]);
      return;
    }

    const medRef = ref(database, `medications/${selectedPetId}`);
    const unsubscribe = onValue(medRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const medsArray = Object.entries(data).map(([id, med]) => ({
          id,
          ...med
        }));
        setMedications(medsArray);
      } else {
        setMedications([]);
      }
    });

    return () => unsubscribe();
  }, [selectedPetId]);

  const addMedication = async () => {
    if (!newMed.name.trim()) {
      Alert.alert('Error', 'Please enter a medication name');
      return;
    }

    const medRef = ref(database, `medications/${selectedPetId}`);
    try {
      const newMedRef = await push(medRef, {
        ...newMed,
        createdAt: Date.now(),
        active: true,
      });

      // Schedule notification
      const pets = getSelectedPets();
      const petName = pets.length > 0 ? pets[0].name : 'your pet';
      const notificationIds = await scheduleMedicationNotification(
        { ...newMed, id: newMedRef.key, petId: selectedPetId },
        petName
      );

      // Save notification IDs to medication record
      if (notificationIds) {
        await update(ref(database, `medications/${selectedPetId}/${newMedRef.key}`), {
          notificationId: notificationIds.notificationId,
          secondNotificationId: notificationIds.secondNotificationId,
        });
      }

      setNewMed({ name: '', dosage: '', frequency: 'daily', timeOfDay: '09:00' });
      setShowAddForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add medication: ' + error.message);
    }
  };

  const toggleMedication = async (medId, currentStatus, medication) => {
    const medRef = ref(database, `medications/${selectedPetId}/${medId}`);

    // If pausing, cancel notifications
    if (currentStatus && medication.notificationId) {
      await cancelMedicationNotification(
        medication.notificationId,
        medication.secondNotificationId
      );
    }

    // If activating, schedule notifications
    if (!currentStatus) {
      const pets = getSelectedPets();
      const petName = pets.length > 0 ? pets[0].name : 'your pet';
      const notificationIds = await scheduleMedicationNotification(
        { ...medication, id: medId, petId: selectedPetId },
        petName
      );

      if (notificationIds) {
        await update(medRef, {
          active: true,
          notificationId: notificationIds.notificationId,
          secondNotificationId: notificationIds.secondNotificationId,
        });
        return;
      }
    }

    update(medRef, { active: !currentStatus });
  };

  const markAsGiven = (medication) => {
    const activitiesRef = ref(database, 'activities');
    const activityData = {
      type: 'Meds',
      emoji: '💊',
      timestamp: Date.now(),
      user: 'You',
      petId: selectedPetId,
      note: `${medication.name} (${medication.dosage})`,
    };

    push(activitiesRef, activityData)
      .then(() => {
        // Visual feedback
        Alert.alert('✅ Marked as Given', `${medication.name} has been logged.`);
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to log medication: ' + error.message);
      });
  };

  const deleteMedication = (medId, medication) => {
    Alert.alert(
      'Delete Medication',
      'Are you sure you want to delete this medication?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Cancel notifications
            if (medication.notificationId) {
              await cancelMedicationNotification(
                medication.notificationId,
                medication.secondNotificationId
              );
            }

            const medRef = ref(database, `medications/${selectedPetId}/${medId}`);
            remove(medRef);
          }
        }
      ]
    );
  };

  const getFrequencyLabel = (freq) => {
    switch (freq) {
      case 'daily': return 'Daily';
      case 'twice-daily': return '2x Daily';
      case 'weekly': return 'Weekly';
      default: return freq;
    }
  };

  if (selectedPetId === 'all') {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <Text style={[styles.selectPetText, { color: colors.textSecondary }]}>
          Select a pet to manage medications
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Pill size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.title, { color: colors.text }]}>Medications</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddForm(!showAddForm)}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          {showAddForm ? (
            <X size={20} color="#fff" strokeWidth={2} />
          ) : (
            <Plus size={20} color="#fff" strokeWidth={2} />
          )}
        </TouchableOpacity>
      </View>

      {showAddForm && (
        <View style={[styles.addForm, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Medication name"
            placeholderTextColor={colors.textSecondary}
            value={newMed.name}
            onChangeText={(text) => setNewMed({ ...newMed, name: text })}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Dosage (e.g., 10mg)"
            placeholderTextColor={colors.textSecondary}
            value={newMed.dosage}
            onChangeText={(text) => setNewMed({ ...newMed, dosage: text })}
          />
          <View style={styles.frequencyRow}>
            {['daily', 'twice-daily', 'weekly'].map((freq) => (
              <TouchableOpacity
                key={freq}
                onPress={() => setNewMed({ ...newMed, frequency: freq })}
                style={[
                  styles.frequencyButton,
                  {
                    backgroundColor: newMed.frequency === freq ? colors.primary : colors.card,
                    borderColor: colors.border,
                  }
                ]}
              >
                <Text style={[
                  styles.frequencyText,
                  { color: newMed.frequency === freq ? '#fff' : colors.text }
                ]}>
                  {getFrequencyLabel(freq)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Time (HH:MM)"
            placeholderTextColor={colors.textSecondary}
            value={newMed.timeOfDay}
            onChangeText={(text) => setNewMed({ ...newMed, timeOfDay: text })}
          />
          <TouchableOpacity
            onPress={addMedication}
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.submitButtonText}>Add Medication</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.medicationList}>
        {medications.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No medications added yet. Tap + to add one.
          </Text>
        ) : (
          medications.map((med) => (
            <View
              key={med.id}
              style={[
                styles.medicationItem,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  opacity: med.active ? 1 : 0.5
                }
              ]}
            >
              <View style={styles.medInfo}>
                <Text style={[styles.medName, { color: colors.text }]}>
                  {med.name}
                </Text>
                <Text style={[styles.medDosage, { color: colors.textSecondary }]}>
                  {med.dosage} • {getFrequencyLabel(med.frequency)} at {med.timeOfDay}
                </Text>
                {med.active && (
                  <TouchableOpacity
                    onPress={() => markAsGiven(med)}
                    style={[styles.markGivenButton, { backgroundColor: colors.activity.meds.bg }]}
                  >
                    <Check size={14} color={colors.activity.meds.icon} strokeWidth={2} />
                    <Text style={[styles.markGivenText, { color: colors.activity.meds.text }]}>
                      Mark as Given
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.medActions}>
                <TouchableOpacity
                  onPress={() => toggleMedication(med.id, med.active, med)}
                  style={[
                    styles.toggleButton,
                    { backgroundColor: med.active ? colors.primary : colors.textSecondary }
                  ]}
                >
                  <Text style={styles.toggleButtonText}>
                    {med.active ? 'Active' : 'Paused'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteMedication(med.id, med)}
                  style={[styles.deleteButton, { backgroundColor: colors.card }]}
                >
                  <X size={16} color={colors.textSecondary} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    maxHeight: 500,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectPetText: {
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    marginTop: spacing.xl,
  },
  addForm: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.md,
    borderWidth: 1,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  submitButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  medicationList: {
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.fontSize.md,
    marginTop: spacing.xl,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 4,
  },
  medDosage: {
    fontSize: typography.fontSize.sm,
    marginBottom: 8,
  },
  markGivenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: borderRadius.md,
    gap: 4,
    alignSelf: 'flex-start',
  },
  markGivenText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  medActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
