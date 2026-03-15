import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase, ref, onValue, push, update, remove } from 'firebase/database';

const PetContext = createContext();

export const usePets = () => {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error('usePets must be used within PetProvider');
  }
  return context;
};

export const PetProvider = ({ children, database }) => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Load pets from Firebase
  useEffect(() => {
    const petsRef = ref(database, 'pets');

    const unsubscribe = onValue(petsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const petsArray = Object.entries(data).map(([id, pet]) => ({
          id,
          ...pet
        }));
        setPets(petsArray);
      } else {
        setPets([]);
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Error loading pets:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [database]);

  // Load last selected pet from storage
  useEffect(() => {
    loadLastSelectedPet();
  }, []);

  const loadLastSelectedPet = async () => {
    try {
      const lastPet = await AsyncStorage.getItem('lastSelectedPet');
      if (lastPet) {
        setSelectedPetId(lastPet);
      }
    } catch (error) {
      console.error('Error loading last selected pet:', error);
    }
  };

  const selectPet = async (petId) => {
    try {
      setSelectedPetId(petId);
      await AsyncStorage.setItem('lastSelectedPet', petId);
    } catch (error) {
      console.error('Error saving selected pet:', error);
    }
  };

  const addPet = async (petData) => {
    try {
      const petsRef = ref(database, 'pets');
      const newPet = {
        ...petData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const result = await push(petsRef, newPet);

      // Auto-select newly added pet
      if (result.key) {
        await selectPet(result.key);
      }

      return result.key;
    } catch (error) {
      console.error('Error adding pet:', error);
      throw error;
    }
  };

  const updatePet = async (petId, updates) => {
    try {
      const petRef = ref(database, `pets/${petId}`);
      await update(petRef, {
        ...updates,
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('Error updating pet:', error);
      throw error;
    }
  };

  const deletePet = async (petId) => {
    try {
      const petRef = ref(database, `pets/${petId}`);
      await remove(petRef);

      // If deleted pet was selected, switch to 'all'
      if (selectedPetId === petId) {
        await selectPet('all');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      throw error;
    }
  };

  const getSelectedPets = () => {
    if (selectedPetId === 'all') {
      return pets;
    }
    return pets.filter(pet => pet.id === selectedPetId);
  };

  const value = {
    pets,
    selectedPetId,
    selectPet,
    addPet,
    updatePet,
    deletePet,
    getSelectedPets,
    isLoading,
  };

  return (
    <PetContext.Provider value={value}>
      {children}
    </PetContext.Provider>
  );
};
