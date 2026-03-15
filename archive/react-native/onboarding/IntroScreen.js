import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PawPrint, Users, User, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, borderRadius, shadows } from '../../utils/theme';

const ONBOARDING_KEY = '@petlog_onboarding_complete';
const HOUSEHOLD_SIZE_KEY = '@petlog_household_size';

export const IntroScreen = ({ onComplete }) => {
  const { colors } = useTheme();
  const [step, setStep] = useState(0);
  const [householdSize, setHouseholdSize] = useState(null);

  const handleHouseholdSelect = async (size) => {
    setHouseholdSize(size);

    // Store household size
    await AsyncStorage.setItem(HOUSEHOLD_SIZE_KEY, size);

    // If one person, skip straight to completion
    if (size === '1') {
      await completeOnboarding();
    } else {
      // For multi-person households, show next step
      setStep(1);
    }
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <PawPrint size={64} color={colors.primary} strokeWidth={1.5} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Welcome to PetLog!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Track your pet's daily activities with ease
      </Text>

      <View style={styles.featuresContainer}>
        <View style={styles.feature}>
          <Check size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.featureText, { color: colors.text }]}>
            Log meals, bathroom breaks, and meds
          </Text>
        </View>
        <View style={styles.feature}>
          <Check size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.featureText, { color: colors.text }]}>
            Share with family members in real-time
          </Text>
        </View>
        <View style={styles.feature}>
          <Check size={20} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.featureText, { color: colors.text }]}>
            View activity history at a glance
          </Text>
        </View>
      </View>

      <Text style={[styles.question, { color: colors.text }]}>
        How many people are in your household?
      </Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}
          onPress={() => handleHouseholdSelect('1')}
        >
          <User size={32} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.optionTitle, { color: colors.text }]}>Just Me</Text>
          <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
            One person household
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}
          onPress={() => handleHouseholdSelect('2+')}
        >
          <Users size={32} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.optionTitle, { color: colors.text }]}>Multiple People</Text>
          <Text style={[styles.optionSubtitle, { color: colors.textSecondary }]}>
            Share with family
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMultiPersonSetup = () => (
    <View style={styles.stepContainer}>
      <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Users size={64} color={colors.primary} strokeWidth={1.5} />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>Perfect!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        With PetLog, everyone in your household can stay in sync
      </Text>

      <View style={styles.tipsContainer}>
        <Text style={[styles.tipTitle, { color: colors.text }]}>💡 Quick Tips:</Text>
        <Text style={[styles.tip, { color: colors.textSecondary }]}>
          • Each activity shows who logged it and when
        </Text>
        <Text style={[styles.tip, { color: colors.textSecondary }]}>
          • Add notes to provide extra details
        </Text>
        <Text style={[styles.tip, { color: colors.textSecondary }]}>
          • Changes sync in real-time across all devices
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={completeOnboarding}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 0 ? renderWelcome() : renderMultiPersonSetup()}
      </ScrollView>
    </View>
  );
};

// Helper function to check if onboarding is complete
export const isOnboardingComplete = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Helper function to get household size
export const getHouseholdSize = async () => {
  try {
    const value = await AsyncStorage.getItem(HOUSEHOLD_SIZE_KEY);
    return value || '1';
  } catch (error) {
    console.error('Error getting household size:', error);
    return '1';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingLeft: spacing.md,
  },
  featureText: {
    fontSize: typography.fontSize.base,
    marginLeft: spacing.md,
    flex: 1,
  },
  question: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  optionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  option: {
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.md,
  },
  optionSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  tipsContainer: {
    width: '100%',
    marginVertical: spacing.xl,
    padding: spacing.lg,
  },
  tipTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginBottom: spacing.md,
  },
  tip: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
});
