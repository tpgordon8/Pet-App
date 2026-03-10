import { useState } from 'react';
import { pickImage } from '../utils/imageUpload';

/**
 * Custom hook to manage activity form state (notes and photos)
 * @returns {Object} Form state and handlers
 */
export const useActivityForm = () => {
  // 📝 State for optional note input
  const [note, setNote] = useState('');
  // 📷 State for selected photo
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  /**
   * Handle photo selection from picker
   */
  const handlePhotoSelect = async () => {
    const image = await pickImage();
    if (image) {
      setSelectedPhoto(image);
    }
  };

  /**
   * Clear the form (note and photo)
   */
  const clearForm = () => {
    setNote('');
    setSelectedPhoto(null);
  };

  return {
    note,
    setNote,
    selectedPhoto,
    setSelectedPhoto,
    handlePhotoSelect,
    clearForm,
  };
};
