// Premium Deal Card Component - Luxe Vacation Design

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

const DealCard = ({ deal, onPress, onSave }) => {
  const {
    destination,
    destinationInfo,
    price,
    typicalPrice,
    savings,
    airlineName,
    airlineColor,
    departureDate,
    returnDate,
    isHotDeal,
    isNonStop,
    seatsLeft,
  } = deal;

  // Format date to readable string
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Format price
  const formatPrice = (amount) => {
    return `$${Math.round(amount)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, isHotDeal && styles.hotDealCard]}
      onPress={() => onPress?.(deal)}
      activeOpacity={0.8}
    >
      {/* Hot Deal Badge */}
      {isHotDeal && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotBadgeText}>HOT DEAL</Text>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Left: Destination Info */}
        <View style={styles.destinationSection}>
          <Text style={styles.destinationEmoji}>{destinationInfo?.emoji || '✈️'}</Text>
          <View style={styles.destinationText}>
            <Text style={styles.cityName}>{destinationInfo?.city || destination}</Text>
            <Text style={styles.stateName}>{destinationInfo?.state}</Text>
            <Text style={styles.vibe}>{destinationInfo?.vibe}</Text>
          </View>
        </View>

        {/* Right: Price Info */}
        <View style={styles.priceSection}>
          <Text style={styles.price}>{formatPrice(price)}</Text>
          {typicalPrice && (
            <Text style={styles.typicalPrice}>
              <Text style={styles.strikethrough}>{formatPrice(typicalPrice)}</Text>
            </Text>
          )}
          {savings > 0 && (
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>{savings}% off</Text>
            </View>
          )}
        </View>
      </View>

      {/* Flight Details Bar */}
      <View style={styles.detailsBar}>
        {/* Airline */}
        <View style={styles.detailItem}>
          <View style={[styles.airlineDot, { backgroundColor: airlineColor }]} />
          <Text style={styles.detailText}>{airlineName}</Text>
        </View>

        {/* Dates */}
        <View style={styles.detailItem}>
          <Text style={styles.detailText}>
            {formatDate(departureDate)} - {formatDate(returnDate)}
          </Text>
        </View>

        {/* Non-stop badge */}
        {isNonStop && (
          <View style={styles.nonStopBadge}>
            <Text style={styles.nonStopText}>Nonstop</Text>
          </View>
        )}
      </View>

      {/* Urgency Footer */}
      {seatsLeft && seatsLeft <= 5 && (
        <View style={styles.urgencyBar}>
          <Text style={styles.urgencyText}>
            Only {seatsLeft} seat{seatsLeft > 1 ? 's' : ''} left at this price
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  hotDealCard: {
    borderWidth: 1,
    borderColor: COLORS.dealHot,
  },
  hotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.dealHot,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  hotBadgeText: {
    color: COLORS.textPrimary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.lg,
  },
  destinationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  destinationEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
  },
  destinationText: {
    flex: 1,
  },
  cityName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  stateName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vibe: {
    fontSize: 12,
    color: COLORS.gold,
    fontStyle: 'italic',
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.deal,
  },
  typicalPrice: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  strikethrough: {
    textDecorationLine: 'line-through',
  },
  savingsBadge: {
    backgroundColor: COLORS.deal + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  savingsText: {
    color: COLORS.deal,
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    gap: SPACING.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  nonStopBadge: {
    backgroundColor: COLORS.gold + '30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  nonStopText: {
    fontSize: 11,
    color: COLORS.gold,
    fontWeight: '600',
  },
  urgencyBar: {
    backgroundColor: COLORS.dealHot + '15',
    paddingVertical: SPACING.xs,
    alignItems: 'center',
  },
  urgencyText: {
    fontSize: 12,
    color: COLORS.dealHot,
    fontWeight: '500',
  },
});

export default DealCard;
