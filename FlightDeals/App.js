// Flight Deals - Find amazing flight deals under $100
// Standalone app for tracking cheap flights from your home airport

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { COLORS, SPACING } from './src/constants/theme';
import { DEFAULT_AIRPORT } from './src/constants/airports';
import { getMockDealsWithDelay } from './src/services/mockFlightData';
import { searchFlightDeals, hasCredentials } from './src/services/flightApi';
import {
  saveDeal,
  removeSavedDeal,
  subscribeSavedDeals,
  isDealSaved,
  getSavedDealId,
} from './src/services/savedDeals';

import DealCard from './src/components/DealCard';
import AirportSelector from './src/components/AirportSelector';
import FilterBar from './src/components/FilterBar';
import DealDetailModal from './src/components/DealDetailModal';

export default function App() {
  // State
  const [selectedAirport, setSelectedAirport] = useState(DEFAULT_AIRPORT);
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [savedDeals, setSavedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [error, setError] = useState(null);

  // Modal state
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Subscribe to saved deals
  useEffect(() => {
    const unsubscribe = subscribeSavedDeals((deals) => {
      setSavedDeals(deals);
    });
    return () => unsubscribe();
  }, []);

  // Fetch deals
  const fetchDeals = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      let fetchedDeals;

      // Use real API if credentials are configured, otherwise use mock data
      if (hasCredentials()) {
        fetchedDeals = await searchFlightDeals(selectedAirport, { maxPrice: 100 });
      } else {
        // Use mock data for demo/development
        fetchedDeals = await getMockDealsWithDelay(selectedAirport, 100);
      }

      setDeals(fetchedDeals);
      applyFilter(activeFilter, fetchedDeals);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Unable to load deals. Pull to refresh.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAirport, activeFilter]);

  // Initial fetch and when airport changes
  useEffect(() => {
    fetchDeals();
  }, [selectedAirport]);

  // Apply filter to deals
  const applyFilter = (filterId, dealsToFilter = deals) => {
    let filtered = [...dealsToFilter];

    switch (filterId) {
      case 'under50':
        filtered = filtered.filter(d => d.price < 50);
        break;
      case 'nonstop':
        filtered = filtered.filter(d => d.isNonStop);
        break;
      case 'weekend':
        filtered = filtered.filter(d => {
          const day = new Date(d.departureDate + 'T00:00:00').getDay();
          return day === 5 || day === 6 || day === 0;
        });
        break;
      case 'beach':
        const beachDestinations = ['MIA', 'TPA', 'MCO', 'PBI', 'RSW', 'JAX', 'SAN', 'SJU', 'SAV', 'CHS'];
        filtered = filtered.filter(d => beachDestinations.includes(d.destination));
        break;
      case 'city':
        const cityDestinations = ['ATL', 'ORD', 'DEN', 'DFW', 'AUS', 'BOS', 'SEA', 'DTW', 'CLT', 'MSP'];
        filtered = filtered.filter(d => cityDestinations.includes(d.destination));
        break;
      default:
        break;
    }

    setFilteredDeals(filtered);
    setActiveFilter(filterId);
  };

  // Handle filter change
  const handleFilterChange = (filterId) => {
    applyFilter(filterId);
  };

  // Handle deal press - open modal
  const handleDealPress = (deal) => {
    setSelectedDeal(deal);
    setModalVisible(true);
  };

  // Handle deal save/unsave
  const handleSaveDeal = async (deal) => {
    try {
      const alreadySaved = isDealSaved(savedDeals, deal);

      if (alreadySaved) {
        const savedId = getSavedDealId(savedDeals, deal);
        if (savedId) {
          await removeSavedDeal(savedId);
        }
      } else {
        await saveDeal(deal);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to save deal. Please try again.');
    }
  };

  // Close modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDeal(null);
  };

  // Handle refresh
  const onRefresh = () => {
    fetchDeals(true);
  };

  // Count hot deals
  const hotDealsCount = deals.filter(d => d.isHotDeal).length;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Flight Deals</Text>
            <Text style={styles.headerSubtitle}>Under $100, major airlines only</Text>
          </View>
          {hotDealsCount > 0 && (
            <View style={styles.hotCounter}>
              <Text style={styles.hotCounterText}>{hotDealsCount} HOT</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
            colors={[COLORS.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Airport Selector */}
        <AirportSelector
          selectedAirport={selectedAirport}
          onSelect={setSelectedAirport}
        />

        {/* Filter Bar */}
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Saved Deals Count */}
        {savedDeals.length > 0 && (
          <View style={styles.savedInfo}>
            <Text style={styles.savedInfoText}>
              {savedDeals.length} saved deal{savedDeals.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gold} />
            <Text style={styles.loadingText}>Finding amazing deals...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>✈️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchDeals()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty State */}
        {!loading && !error && filteredDeals.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>✈️</Text>
            <Text style={styles.emptyTitle}>No deals found</Text>
            <Text style={styles.emptyText}>
              {activeFilter !== 'all'
                ? 'Try a different filter or check back later'
                : 'Check back soon for new deals!'}
            </Text>
          </View>
        )}

        {/* Deals List */}
        {!loading && !error && filteredDeals.length > 0 && (
          <View style={styles.dealsContainer}>
            <Text style={styles.dealsCount}>
              {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
            </Text>
            {filteredDeals.map((deal) => (
              <DealCard
                key={deal.id}
                deal={deal}
                onPress={handleDealPress}
                isSaved={isDealSaved(savedDeals, deal)}
              />
            ))}
          </View>
        )}

        {/* Footer Spacer */}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* Deal Detail Modal */}
      <DealDetailModal
        visible={modalVisible}
        deal={selectedDeal}
        onClose={handleCloseModal}
        onSave={handleSaveDeal}
        isSaved={selectedDeal ? isDealSaved(savedDeals, selectedDeal) : false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gold,
  },
  hotCounter: {
    backgroundColor: COLORS.dealHot + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.dealHot,
  },
  hotCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.dealHot,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SPACING.sm,
  },
  savedInfo: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  savedInfoText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.background,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dealsContainer: {
    paddingTop: SPACING.sm,
  },
  dealsCount: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footerSpacer: {
    height: 40,
  },
});
