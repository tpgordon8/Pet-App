import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { ChevronDown, PawPrint } from 'lucide-react-native';
import { usePets } from '../../contexts/PetContext';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../../utils/theme';

export const PetSelector = () => {
  const { pets, selectedPetId, selectPet } = usePets();
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const selectedPet = pets.find(pet => pet.id === selectedPetId);
  const displayName = selectedPetId === 'all' ? 'All Pets' : selectedPet?.name || 'Select Pet';

  const handleSelectPet = (petId) => {
    selectPet(petId);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor: colors.card, borderColor: colors.border },
          shadows.sm
        ]}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.selectedPet}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '20' }]}>
            {selectedPet?.emoji ? (
              <Text style={styles.avatarEmoji}>{selectedPet.emoji}</Text>
            ) : (
              <PawPrint size={20} color={colors.primary} strokeWidth={2} />
            )}
          </View>
          <View style={styles.petInfo}>
            <Text style={[styles.petName, { color: colors.text }]}>{displayName}</Text>
            {pets.length > 0 && (
              <Text style={[styles.petCount, { color: colors.textSecondary }]}>
                {selectedPetId === 'all' ? `${pets.length} pets` : selectedPet?.type || 'Pet'}
              </Text>
            )}
          </View>
        </View>
        <ChevronDown size={20} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }, shadows.lg]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Pet</Text>

            <ScrollView style={styles.petList}>
              <TouchableOpacity
                style={[
                  styles.petOption,
                  { backgroundColor: selectedPetId === 'all' ? colors.primary + '10' : 'transparent' }
                ]}
                onPress={() => handleSelectPet('all')}
              >
                <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '20' }]}>
                  <PawPrint size={20} color={colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.petInfo}>
                  <Text style={[styles.petName, { color: colors.text }]}>All Pets</Text>
                  <Text style={[styles.petCount, { color: colors.textSecondary }]}>
                    {pets.length} pets
                  </Text>
                </View>
              </TouchableOpacity>

              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    { backgroundColor: selectedPetId === pet.id ? colors.primary + '10' : 'transparent' }
                  ]}
                  onPress={() => handleSelectPet(pet.id)}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '20' }]}>
                    {pet.emoji ? (
                      <Text style={styles.avatarEmoji}>{pet.emoji}</Text>
                    ) : (
                      <PawPrint size={20} color={colors.primary} strokeWidth={2} />
                    )}
                  </View>
                  <View style={styles.petInfo}>
                    <Text style={[styles.petName, { color: colors.text }]}>{pet.name}</Text>
                    <Text style={[styles.petCount, { color: colors.textSecondary }]}>
                      {pet.type || 'Pet'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                setIsOpen(false);
                // TODO: Open add pet modal
              }}
            >
              <Text style={styles.addButtonText}>+ Add New Pet</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  selectedPet: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarEmoji: {
    fontSize: 20,
    lineHeight: 20,
    textAlign: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: 2,
  },
  petCount: {
    fontSize: typography.fontSize.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.lg,
  },
  petList: {
    marginBottom: spacing.lg,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  addButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
