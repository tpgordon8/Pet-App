import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { typography, spacing, borderRadius } from '../../utils/theme';
import { ExitButton } from './ExitButton';
import { RefreshButton } from './RefreshButton';

export const Header = () => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>PetLog</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Track your pet's activities
        </Text>
      </View>

      <View style={styles.headerActions}>
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themeToggle, { backgroundColor: colors.background }]}
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun size={20} color={colors.primary} strokeWidth={2} />
          ) : (
            <Moon size={20} color={colors.primary} strokeWidth={2} />
          )}
        </TouchableOpacity>
        <RefreshButton />
        <ExitButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
