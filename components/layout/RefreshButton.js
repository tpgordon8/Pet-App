import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { borderRadius } from '../../utils/theme';

export const RefreshButton = () => {
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      if (Platform.OS === 'web') {
        // Check if service worker is registered
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            // Update service worker
            await registration.update();
          }
        }

        // Clear cache and reload
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => caches.delete(name)));
        }

        // Reload the page to get fresh content
        window.location.reload();
      } else {
        // For native apps, just reload
        window.location.reload();
      }
    } catch (error) {
      console.error('Error refreshing app:', error);
      Alert.alert('Refresh Error', 'Could not refresh the app. Please try again.');
      setIsRefreshing(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRefresh}
      style={[styles.refreshButton, { backgroundColor: colors.background }]}
      accessibilityLabel="Refresh app"
      disabled={isRefreshing}
    >
      <RefreshCw
        size={20}
        color={colors.primary}
        strokeWidth={2}
        style={isRefreshing ? styles.spinning : null}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  spinning: {
    // Note: CSS animation would be added via web styles if needed
    opacity: 0.5,
  },
});
