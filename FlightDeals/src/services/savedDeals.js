// Saved Deals Service - Firebase integration for saving favorite deals

import { ref, push, remove, onValue, query, orderByChild } from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase';

const SAVED_DEALS_PATH = 'savedFlightDeals';

// Save a deal to Firebase
export const saveDeal = async (deal) => {
  if (!isFirebaseConfigured()) {
    console.log('Firebase not configured - cannot save deals');
    return false;
  }

  try {
    const savedDealsRef = ref(database, SAVED_DEALS_PATH);
    const savedDeal = {
      ...deal,
      savedAt: Date.now(),
      dealSnapshot: {
        destination: deal.destination,
        destinationInfo: deal.destinationInfo,
        price: deal.price,
        carrier: deal.carrier,
        airlineName: deal.airlineName,
        departureDate: deal.departureDate,
        returnDate: deal.returnDate,
        isNonStop: deal.isNonStop,
      }
    };

    await push(savedDealsRef, savedDeal);
    console.log('Deal saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving deal:', error);
    throw error;
  }
};

// Remove a saved deal
export const removeSavedDeal = async (savedDealId) => {
  if (!isFirebaseConfigured()) return false;

  try {
    const dealRef = ref(database, `${SAVED_DEALS_PATH}/${savedDealId}`);
    await remove(dealRef);
    console.log('Deal removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing deal:', error);
    throw error;
  }
};

// Subscribe to saved deals (real-time updates)
export const subscribeSavedDeals = (callback) => {
  if (!isFirebaseConfigured()) {
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }

  const savedDealsRef = ref(database, SAVED_DEALS_PATH);
  const savedDealsQuery = query(savedDealsRef, orderByChild('savedAt'));

  const unsubscribe = onValue(savedDealsQuery, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const dealsArray = Object.entries(data)
        .map(([id, deal]) => ({
          id,
          savedId: id,
          ...deal,
        }))
        .sort((a, b) => b.savedAt - a.savedAt);

      callback(dealsArray);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error subscribing to saved deals:', error);
    callback([]);
  });

  return unsubscribe;
};

// Check if a deal is already saved
export const isDealSaved = (savedDeals, deal) => {
  return savedDeals.some(
    (saved) =>
      saved.destination === deal.destination &&
      saved.departureDate === deal.departureDate &&
      saved.returnDate === deal.returnDate
  );
};

// Get the saved deal ID for a specific deal
export const getSavedDealId = (savedDeals, deal) => {
  const found = savedDeals.find(
    (saved) =>
      saved.destination === deal.destination &&
      saved.departureDate === deal.departureDate &&
      saved.returnDate === deal.returnDate
  );
  return found?.savedId;
};
