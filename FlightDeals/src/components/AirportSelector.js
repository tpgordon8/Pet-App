// Airport Selector Component - Premium Dropdown

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, SHADOWS } from '../constants/theme';
import { SUPPORTED_AIRPORTS } from '../constants/airports';

const AirportSelector = ({ selectedAirport, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const airport = SUPPORTED_AIRPORTS[selectedAirport];

  const handleSelect = (code) => {
    onSelect(code);
    setModalVisible(false);
  };

  return (
    <>
      {/* Selector Button */}
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorLabel}>Flying from</Text>
          <View style={styles.airportRow}>
            <Text style={styles.airportEmoji}>{airport?.emoji || '✈️'}</Text>
            <Text style={styles.airportCode}>{selectedAirport}</Text>
            <Text style={styles.airportCity}>{airport?.city}</Text>
          </View>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </TouchableOpacity>

      {/* Airport Selection Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Your Airport</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.airportList}>
              {Object.values(SUPPORTED_AIRPORTS).map((apt) => (
                <TouchableOpacity
                  key={apt.code}
                  style={[
                    styles.airportOption,
                    selectedAirport === apt.code && styles.airportOptionSelected,
                  ]}
                  onPress={() => handleSelect(apt.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{apt.emoji}</Text>
                  <View style={styles.optionText}>
                    <Text style={styles.optionCode}>{apt.code}</Text>
                    <Text style={styles.optionName}>{apt.name}</Text>
                    <Text style={styles.optionCity}>
                      {apt.city}, {apt.state}
                    </Text>
                  </View>
                  {selectedAirport === apt.code && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                More airports coming soon
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  airportRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  airportEmoji: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  airportCode: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gold,
    marginRight: SPACING.sm,
  },
  airportCity: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  chevron: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.card,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  airportList: {
    padding: SPACING.md,
  },
  airportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.card,
  },
  airportOptionSelected: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  optionEmoji: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  optionText: {
    flex: 1,
  },
  optionCode: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.gold,
  },
  optionName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  optionCity: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.gold,
    fontWeight: '700',
  },
  modalFooter: {
    padding: SPACING.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.card,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
});

export default AirportSelector;
