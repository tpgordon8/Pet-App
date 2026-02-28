// Filter Bar Component - Quick filters for deals

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING } from '../constants/theme';

const FILTERS = [
  { id: 'all', label: 'All Deals', icon: '✨' },
  { id: 'under50', label: 'Under $50', icon: '🔥' },
  { id: 'nonstop', label: 'Nonstop', icon: '✈️' },
  { id: 'weekend', label: 'Weekends', icon: '📅' },
  { id: 'beach', label: 'Beach', icon: '🏖️' },
  { id: 'city', label: 'Cities', icon: '🏙️' },
];

const FilterBar = ({ activeFilter, onFilterChange }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterButton,
              activeFilter === filter.id && styles.filterButtonActive,
            ]}
            onPress={() => onFilterChange(filter.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text
              style={[
                styles.filterLabel,
                activeFilter === filter.id && styles.filterLabelActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    marginRight: SPACING.sm,
  },
  filterButtonActive: {
    backgroundColor: COLORS.gold,
  },
  filterIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterLabelActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
});

export default FilterBar;
