import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import { X, LogOut, Minimize2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../../utils/theme';
import { exitApp, minimizeApp } from '../../utils/appNavigation';

export const ExitButton = () => {
  const { colors } = useTheme();
  const [showConfirm, setShowConfirm] = useState(false);

  // Only show on mobile/PWA
  const isMobileOrPWA = Platform.OS !== 'web' ||
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone;

  if (!isMobileOrPWA && Platform.OS === 'web') {
    return null; // Don't show exit button in regular browser
  }

  const handleExit = () => {
    setShowConfirm(false);
    exitApp();
  };

  const handleMinimize = () => {
    setShowConfirm(false);
    minimizeApp();
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowConfirm(true)}
        style={[styles.exitButton, { backgroundColor: colors.background }]}
        accessibilityLabel="Exit app"
      >
        <LogOut size={20} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowConfirm(false)}
        >
          <View
            style={[styles.modalContent, { backgroundColor: colors.card }, shadows.lg]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Exit PetLog?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              What would you like to do?
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleMinimize}
              >
                <Minimize2 size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.actionButtonText}>Minimize</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.error || '#EF4444' }]}
                onPress={handleExit}
              >
                <LogOut size={18} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.actionButtonText}>Exit App</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={() => setShowConfirm(false)}
            >
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
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
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
});
