// Deal Detail Modal - Luxe presentation of flight deal details

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const DealDetailModal = ({ visible, deal, onClose, onSave, isSaved }) => {
  if (!deal) return null;

  const {
    destination,
    destinationInfo,
    origin,
    price,
    typicalPrice,
    savings,
    airlineName,
    airlineColor,
    departureDate,
    returnDate,
    departureTime,
    returnTime,
    isHotDeal,
    isNonStop,
    seatsLeft,
    expiresIn,
  } = deal;

  // Format date with day of week
  const formatDateFull = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format price
  const formatPrice = (amount) => `$${Math.round(amount)}`;

  // Open Google Flights search
  const handleBookNow = () => {
    const url = `https://www.google.com/travel/flights?q=Flights%20from%20${origin}%20to%20${destination}%20on%20${departureDate}%20returning%20${returnDate}`;
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header with destination */}
            <View style={styles.header}>
              <Text style={styles.destinationEmoji}>
                {destinationInfo?.emoji || '✈️'}
              </Text>
              <View style={styles.headerText}>
                <Text style={styles.cityName}>
                  {destinationInfo?.city || destination}
                </Text>
                <Text style={styles.stateName}>{destinationInfo?.state}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Vibe tagline */}
            <Text style={styles.vibe}>{destinationInfo?.vibe}</Text>

            {/* Price section */}
            <View style={styles.priceSection}>
              <View style={styles.priceMain}>
                <Text style={styles.priceLabel}>Round trip from</Text>
                <Text style={styles.price}>{formatPrice(price)}</Text>
                {savings > 0 && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>Save {savings}%</Text>
                  </View>
                )}
              </View>
              {typicalPrice && (
                <Text style={styles.typicalPrice}>
                  Typically {formatPrice(typicalPrice)}
                </Text>
              )}
            </View>

            {/* Flight details card */}
            <View style={styles.detailsCard}>
              {/* Airline */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Airline</Text>
                <View style={styles.airlineInfo}>
                  <View style={[styles.airlineDot, { backgroundColor: airlineColor }]} />
                  <Text style={styles.detailValue}>{airlineName}</Text>
                </View>
              </View>

              {/* Outbound */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Depart</Text>
                <Text style={styles.detailValue}>
                  {formatDateFull(departureDate)} {departureTime && `at ${departureTime}`}
                </Text>
              </View>

              {/* Return */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Return</Text>
                <Text style={styles.detailValue}>
                  {formatDateFull(returnDate)} {returnTime && `at ${returnTime}`}
                </Text>
              </View>

              {/* Route */}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Route</Text>
                <View style={styles.routeInfo}>
                  <Text style={styles.routeCode}>{origin}</Text>
                  <Text style={styles.routeArrow}>→</Text>
                  <Text style={styles.routeCode}>{destination}</Text>
                  {isNonStop && (
                    <View style={styles.nonStopBadge}>
                      <Text style={styles.nonStopText}>Nonstop</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Urgency info */}
            {(seatsLeft || expiresIn) && (
              <View style={styles.urgencySection}>
                {seatsLeft && seatsLeft <= 5 && (
                  <View style={styles.urgencyItem}>
                    <Text style={styles.urgencyIcon}>🔥</Text>
                    <Text style={styles.urgencyText}>
                      Only {seatsLeft} seat{seatsLeft > 1 ? 's' : ''} left
                    </Text>
                  </View>
                )}
                {expiresIn && (
                  <View style={styles.urgencyItem}>
                    <Text style={styles.urgencyIcon}>⏰</Text>
                    <Text style={styles.urgencyText}>
                      Price valid for ~{expiresIn}h
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton, isSaved && styles.savedButton]}
                onPress={() => onSave(deal)}
              >
                <Text style={[styles.saveButtonText, isSaved && styles.savedButtonText]}>
                  {isSaved ? '♥ Saved' : '♡ Save Deal'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.bookButton]}
                onPress={handleBookNow}
              >
                <Text style={styles.bookButtonText}>Search Flights</Text>
              </TouchableOpacity>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              Prices may vary. Tap "Search Flights" to see current availability on Google Flights.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  destinationEmoji: {
    fontSize: 48,
    marginRight: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  cityName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  stateName: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  vibe: {
    fontSize: 14,
    color: COLORS.gold,
    fontStyle: 'italic',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  priceSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
  },
  price: {
    fontSize: 42,
    fontWeight: '700',
    color: COLORS.deal,
  },
  savingsBadge: {
    backgroundColor: COLORS.deal + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginLeft: SPACING.sm,
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.deal,
  },
  typicalPrice: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundSecondary,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  airlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  routeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.gold,
  },
  routeArrow: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginHorizontal: 8,
  },
  nonStopBadge: {
    backgroundColor: COLORS.gold + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: SPACING.sm,
  },
  nonStopText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },
  urgencySection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  urgencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  urgencyIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },
  urgencyText: {
    fontSize: 14,
    color: COLORS.dealHot,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.textMuted,
  },
  savedButton: {
    backgroundColor: COLORS.dealHot + '20',
    borderColor: COLORS.dealHot,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  savedButtonText: {
    color: COLORS.dealHot,
  },
  bookButton: {
    backgroundColor: COLORS.gold,
    ...SHADOWS.button,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.background,
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default DealDetailModal;
