// Flight Deals - Single file version for Expo Snack
// Paste this entire file into https://snack.expo.dev

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Alert, Modal, Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// ═══════════════════════════════════════════════════════════
// THEME - First Class Lounge Aesthetic
// ═══════════════════════════════════════════════════════════
const COLORS = {
  background: '#0A0A0F', backgroundSecondary: '#14141F',
  card: '#1C1C28', cardHighlight: '#252535',
  gold: '#C9A962', goldLight: '#E8D5A3', goldDark: '#8B7355',
  textPrimary: '#FFFFFF', textSecondary: '#A0A0B0', textMuted: '#606070',
  deal: '#4ADE80', dealHot: '#F472B6', priceNormal: '#60A5FA',
};
const SP = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const SHADOW = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
};

// ═══════════════════════════════════════════════════════════
// AIRLINE DATA
// ═══════════════════════════════════════════════════════════
const BUDGET = ['NK','F9','G4','SY','XP','MX'];
const MAJORS = ['DL','UA','AA','B6','WN','AS','HA'];
const AIRLINES = {
  'DL': { name: 'Delta', color: '#E31937' },
  'UA': { name: 'United', color: '#005DAA' },
  'AA': { name: 'American', color: '#0078D2' },
  'B6': { name: 'JetBlue', color: '#003876' },
  'WN': { name: 'Southwest', color: '#FFBF27' },
  'AS': { name: 'Alaska', color: '#01426A' },
  'HA': { name: 'Hawaiian', color: '#8B2346' },
};

// ═══════════════════════════════════════════════════════════
// AIRPORT & DESTINATION DATA
// ═══════════════════════════════════════════════════════════
const AIRPORTS = {
  'PHL': { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia', state: 'PA', emoji: '🔔' },
  'JFK': { code: 'JFK', name: 'JFK International', city: 'New York', state: 'NY', emoji: '🗽' },
  'EWR': { code: 'EWR', name: 'Newark Liberty', city: 'Newark', state: 'NJ', emoji: '🏙️' },
  'BWI': { code: 'BWI', name: 'Baltimore/Washington', city: 'Baltimore', state: 'MD', emoji: '🦀' },
  'DCA': { code: 'DCA', name: 'Reagan National', city: 'Washington', state: 'DC', emoji: '🏛️' },
};

const DESTS = {
  'SAV': { city: 'Savannah', state: 'GA', emoji: '🌳', vibe: 'Historic charm' },
  'MIA': { city: 'Miami', state: 'FL', emoji: '🌴', vibe: 'Beach paradise' },
  'MCO': { city: 'Orlando', state: 'FL', emoji: '🏰', vibe: 'Theme parks' },
  'TPA': { city: 'Tampa', state: 'FL', emoji: '🌊', vibe: 'Gulf coast' },
  'ATL': { city: 'Atlanta', state: 'GA', emoji: '🍑', vibe: 'Southern hub' },
  'BOS': { city: 'Boston', state: 'MA', emoji: '🦞', vibe: 'Historic New England' },
  'ORD': { city: 'Chicago', state: 'IL', emoji: '🌬️', vibe: 'Windy city' },
  'DEN': { city: 'Denver', state: 'CO', emoji: '🏔️', vibe: 'Mountain adventure' },
  'MSY': { city: 'New Orleans', state: 'LA', emoji: '🎺', vibe: 'Jazz & culture' },
  'CHS': { city: 'Charleston', state: 'SC', emoji: '🏛️', vibe: 'Southern charm' },
  'BNA': { city: 'Nashville', state: 'TN', emoji: '🎶', vibe: 'Music city' },
  'CLT': { city: 'Charlotte', state: 'NC', emoji: '🏙️', vibe: 'Queen city' },
  'RDU': { city: 'Raleigh', state: 'NC', emoji: '🌲', vibe: 'Triangle area' },
  'DFW': { city: 'Dallas', state: 'TX', emoji: '🤠', vibe: 'Big Texas' },
  'AUS': { city: 'Austin', state: 'TX', emoji: '🎸', vibe: 'Live music capital' },
  'PBI': { city: 'West Palm Beach', state: 'FL', emoji: '🌴', vibe: 'Luxury Florida' },
  'RSW': { city: 'Fort Myers', state: 'FL', emoji: '🐚', vibe: 'Shell coast' },
  'JAX': { city: 'Jacksonville', state: 'FL', emoji: '🏖️', vibe: 'First coast' },
  'DTW': { city: 'Detroit', state: 'MI', emoji: '🚗', vibe: 'Motor city' },
  'CLE': { city: 'Cleveland', state: 'OH', emoji: '🎸', vibe: 'Rock & roll' },
  'PIT': { city: 'Pittsburgh', state: 'PA', emoji: '🌉', vibe: 'Steel city' },
  'MSP': { city: 'Minneapolis', state: 'MN', emoji: '❄️', vibe: 'Land of lakes' },
  'LAS': { city: 'Las Vegas', state: 'NV', emoji: '🎰', vibe: 'Entertainment' },
  'SAN': { city: 'San Diego', state: 'CA', emoji: '🌞', vibe: 'Perfect weather' },
};

const getDest = (c) => DESTS[c] || { city: c, state: '', emoji: '✈️', vibe: 'Adventure awaits' };

// ═══════════════════════════════════════════════════════════
// MOCK FLIGHT DATA GENERATOR
// ═══════════════════════════════════════════════════════════
const DEAL_CONFIGS = [
  { dest: 'SAV', min: 49, max: 79 }, { dest: 'MIA', min: 59, max: 89 },
  { dest: 'MCO', min: 49, max: 79 }, { dest: 'TPA', min: 55, max: 85 },
  { dest: 'ATL', min: 45, max: 69 }, { dest: 'BOS', min: 39, max: 65 },
  { dest: 'ORD', min: 59, max: 89 }, { dest: 'DEN', min: 79, max: 99 },
  { dest: 'MSY', min: 69, max: 95 }, { dest: 'CHS', min: 55, max: 79 },
  { dest: 'BNA', min: 65, max: 89 }, { dest: 'CLT', min: 45, max: 69 },
  { dest: 'RDU', min: 49, max: 75 }, { dest: 'DFW', min: 79, max: 99 },
  { dest: 'AUS', min: 85, max: 99 }, { dest: 'PBI', min: 65, max: 89 },
  { dest: 'JAX', min: 55, max: 79 }, { dest: 'DTW', min: 59, max: 85 },
  { dest: 'CLE', min: 49, max: 75 }, { dest: 'PIT', min: 45, max: 69 },
  { dest: 'MSP', min: 75, max: 99 }, { dest: 'LAS', min: 89, max: 99 },
];

const futureDate = (days = 90) => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * days) + 7);
  return d.toISOString().split('T')[0];
};
const returnDate = (dep) => {
  const d = new Date(dep);
  d.setDate(d.getDate() + Math.floor(Math.random() * 5) + 3);
  return d.toISOString().split('T')[0];
};
const randTime = () => {
  const h = Math.floor(Math.random() * 14) + 6;
  const m = Math.random() > 0.5 ? '00' : '30';
  return `${h.toString().padStart(2,'0')}:${m}`;
};

const generateDeals = (origin = 'PHL', max = 100) => {
  const shuffled = [...DEAL_CONFIGS].sort(() => Math.random() - 0.5).slice(0, 15);
  return shuffled.map(cfg => {
    const carrier = MAJORS[Math.floor(Math.random() * MAJORS.length)];
    const info = AIRLINES[carrier] || { name: carrier, color: '#666' };
    const dest = getDest(cfg.dest);
    const price = Math.floor(Math.random() * (cfg.max - cfg.min) + cfg.min);
    const dep = futureDate();
    const ret = returnDate(dep);
    const typical = Math.floor(price * (1.5 + Math.random() * 0.5));
    const savings = Math.round(((typical - price) / typical) * 100);
    return {
      id: `${cfg.dest}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
      origin, destination: cfg.dest, destinationInfo: dest,
      price, typicalPrice: typical, savings, currency: 'USD',
      carrier, airlineName: info.name, airlineColor: info.color,
      departureDate: dep, returnDate: ret,
      departureTime: randTime(), returnTime: randTime(),
      isHotDeal: price <= 55 || savings >= 50,
      isNonStop: Math.random() > 0.3,
      seatsLeft: Math.floor(Math.random() * 5) + 1,
      expiresIn: Math.floor(Math.random() * 48) + 2,
    };
  }).filter(d => d.price <= max).sort((a, b) => a.price - b.price);
};

const fetchMockDeals = async (origin, max) => {
  await new Promise(r => setTimeout(r, 800));
  return generateDeals(origin, max);
};

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

// --- Filter Bar ---
const FILTERS = [
  { id: 'all', label: 'All Deals', icon: '✨' },
  { id: 'under50', label: 'Under $50', icon: '🔥' },
  { id: 'nonstop', label: 'Nonstop', icon: '✈️' },
  { id: 'weekend', label: 'Weekends', icon: '📅' },
  { id: 'beach', label: 'Beach', icon: '🏖️' },
  { id: 'city', label: 'Cities', icon: '🏙️' },
];

const FilterBar = ({ activeFilter, onFilterChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingHorizontal: SP.lg, gap: SP.sm, marginBottom: SP.md }}>
    {FILTERS.map(f => (
      <TouchableOpacity key={f.id}
        style={[s.filterBtn, activeFilter === f.id && s.filterBtnActive]}
        onPress={() => onFilterChange(f.id)}>
        <Text style={{ fontSize: 14, marginRight: 6 }}>{f.icon}</Text>
        <Text style={[s.filterLabel, activeFilter === f.id && s.filterLabelActive]}>{f.label}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// --- Airport Selector ---
const AirportSelector = ({ selectedAirport, onSelect }) => {
  const [modal, setModal] = useState(false);
  const apt = AIRPORTS[selectedAirport];
  return (
    <>
      <TouchableOpacity style={s.selector} onPress={() => setModal(true)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={s.selectorLabel}>FLYING FROM</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: SP.sm }}>{apt?.emoji}</Text>
            <Text style={s.airportCode}>{selectedAirport}</Text>
            <Text style={s.airportCity}>{apt?.city}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>▼</Text>
      </TouchableOpacity>
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Select Your Airport</Text>
              <TouchableOpacity onPress={() => setModal(false)} style={s.closeBtn}>
                <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: SP.md }}>
              {Object.values(AIRPORTS).map(a => (
                <TouchableOpacity key={a.code}
                  style={[s.aptOption, selectedAirport === a.code && s.aptOptionSel]}
                  onPress={() => { onSelect(a.code); setModal(false); }}>
                  <Text style={{ fontSize: 32, marginRight: SP.md }}>{a.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.gold }}>{a.code}</Text>
                    <Text style={{ fontSize: 14, color: COLORS.textPrimary, marginTop: 2 }}>{a.name}</Text>
                    <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{a.city}, {a.state}</Text>
                  </View>
                  {selectedAirport === a.code && <Text style={{ fontSize: 20, color: COLORS.gold }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ padding: SP.lg, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.card }}>
              <Text style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic' }}>More airports coming soon</Text>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// --- Deal Card ---
const DealCard = ({ deal, onPress }) => {
  const { destination, destinationInfo, price, typicalPrice, savings,
    airlineName, airlineColor, departureDate, returnDate,
    isHotDeal, isNonStop, seatsLeft } = deal;
  const fmtDate = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  return (
    <TouchableOpacity style={[s.card, isHotDeal && s.hotCard]} onPress={() => onPress?.(deal)} activeOpacity={0.8}>
      {isHotDeal && <View style={s.hotBadge}><Text style={s.hotBadgeText}>HOT DEAL</Text></View>}
      <View style={s.cardContent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Text style={{ fontSize: 40, marginRight: SP.md }}>{destinationInfo?.emoji || '✈️'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.cityName}>{destinationInfo?.city || destination}</Text>
            <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>{destinationInfo?.state}</Text>
            <Text style={{ fontSize: 12, color: COLORS.gold, fontStyle: 'italic' }}>{destinationInfo?.vibe}</Text>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.price}>${Math.round(price)}</Text>
          {typicalPrice && <Text style={s.typicalPrice}><Text style={{ textDecorationLine: 'line-through' }}>${Math.round(typicalPrice)}</Text></Text>}
          {savings > 0 && <View style={s.savBadge}><Text style={s.savText}>{savings}% off</Text></View>}
        </View>
      </View>
      <View style={s.detailsBar}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[s.dot, { backgroundColor: airlineColor }]} />
          <Text style={s.detailText}>{airlineName}</Text>
        </View>
        <Text style={s.detailText}>{fmtDate(departureDate)} - {fmtDate(returnDate)}</Text>
        {isNonStop && <View style={s.nonstopBadge}><Text style={s.nonstopText}>Nonstop</Text></View>}
      </View>
      {seatsLeft && seatsLeft <= 5 && (
        <View style={s.urgencyBar}>
          <Text style={s.urgencyText}>Only {seatsLeft} seat{seatsLeft > 1 ? 's' : ''} left at this price</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- Deal Detail Modal ---
const DealDetailModal = ({ visible, deal, onClose }) => {
  if (!deal) return null;
  const fmtDate = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}) : '';
  const openFlights = () => {
    Linking.openURL(`https://www.google.com/travel/flights?q=Flights+from+${deal.origin}+to+${deal.destination}+on+${deal.departureDate}+returning+${deal.returnDate}`);
  };
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={[s.modalContent, { maxHeight: '90%', paddingBottom: 40 }]}>
          <View style={{ width: 40, height: 4, backgroundColor: COLORS.textMuted, borderRadius: 2, alignSelf: 'center', marginTop: SP.md, marginBottom: SP.sm }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingTop: SP.md }}>
              <Text style={{ fontSize: 48, marginRight: SP.md }}>{deal.destinationInfo?.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.textPrimary }}>{deal.destinationInfo?.city}</Text>
                <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>{deal.destinationInfo?.state}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                <Text style={{ fontSize: 18, color: COLORS.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: COLORS.gold, fontStyle: 'italic', paddingHorizontal: SP.lg, marginTop: SP.sm }}>{deal.destinationInfo?.vibe}</Text>
            <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg }}>
              <Text style={{ fontSize: 14, color: COLORS.textSecondary }}>Round trip from</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 42, fontWeight: '700', color: COLORS.deal }}>${Math.round(deal.price)}</Text>
                {deal.savings > 0 && <View style={[s.savBadge, { marginLeft: SP.sm }]}><Text style={s.savText}>Save {deal.savings}%</Text></View>}
              </View>
              {deal.typicalPrice && <Text style={{ fontSize: 14, color: COLORS.textMuted }}>Typically ${Math.round(deal.typicalPrice)}</Text>}
            </View>
            <View style={{ backgroundColor: COLORS.card, marginHorizontal: SP.lg, borderRadius: 16, padding: SP.lg, marginTop: SP.lg }}>
              {[
                ['Airline', deal.airlineName],
                ['Depart', `${fmtDate(deal.departureDate)} at ${deal.departureTime || ''}`],
                ['Return', `${fmtDate(deal.returnDate)} at ${deal.returnTime || ''}`],
                ['Route', `${deal.origin} → ${deal.destination}${deal.isNonStop ? '  (Nonstop)' : ''}`],
              ].map(([label, value], i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SP.sm, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundSecondary }}>
                  <Text style={{ fontSize: 14, color: COLORS.textMuted }}>{label}</Text>
                  <Text style={{ fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' }}>{value}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', paddingHorizontal: SP.lg, marginTop: SP.lg, gap: SP.md }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: COLORS.gold, paddingVertical: SP.md, borderRadius: 16, alignItems: 'center' }} onPress={openFlights}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.background }}>Search Flights</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: SP.xl, marginTop: SP.md }}>
              Tap "Search Flights" to see current availability on Google Flights.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [airport, setAirport] = useState('PHL');
  const [deals, setDeals] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchDeals = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const data = await fetchMockDeals(airport, 100);
      setDeals(data);
      applyFilter(filter, data);
    } catch (e) {
      setError('Unable to load deals. Pull to refresh.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [airport, filter]);

  useEffect(() => { fetchDeals(); }, [airport]);

  const applyFilter = (id, data = deals) => {
    let f = [...data];
    const beach = ['MIA','TPA','MCO','PBI','RSW','JAX','SAN','SAV','CHS'];
    const city = ['ATL','ORD','DEN','DFW','AUS','BOS','DTW','CLT','MSP'];
    if (id === 'under50') f = f.filter(d => d.price < 50);
    else if (id === 'nonstop') f = f.filter(d => d.isNonStop);
    else if (id === 'weekend') f = f.filter(d => { const day = new Date(d.departureDate+'T00:00:00').getDay(); return day===5||day===6||day===0; });
    else if (id === 'beach') f = f.filter(d => beach.includes(d.destination));
    else if (id === 'city') f = f.filter(d => city.includes(d.destination));
    setFiltered(f); setFilter(id);
  };

  const hotCount = deals.filter(d => d.isHotDeal).length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />
      <View style={{ paddingTop: 60, paddingBottom: SP.lg, paddingHorizontal: SP.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 }}>Flight Deals</Text>
            <Text style={{ fontSize: 14, color: COLORS.gold }}>Under $100, major airlines only</Text>
          </View>
          {hotCount > 0 && (
            <View style={{ backgroundColor: COLORS.dealHot+'20', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: COLORS.dealHot }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.dealHot, letterSpacing: 0.5 }}>{hotCount} HOT</Text>
            </View>
          )}
        </View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: SP.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDeals(true)} tintColor={COLORS.gold} colors={[COLORS.gold]} />}
        showsVerticalScrollIndicator={false}>
        <AirportSelector selectedAirport={airport} onSelect={setAirport} />
        <FilterBar activeFilter={filter} onFilterChange={id => applyFilter(id)} />
        {loading && <View style={{ alignItems: 'center', paddingVertical: SP.xxl }}>
          <ActivityIndicator size="large" color={COLORS.gold} />
          <Text style={{ marginTop: SP.md, fontSize: 16, color: COLORS.textSecondary }}>Finding amazing deals...</Text>
        </View>}
        {error && !loading && <View style={{ alignItems: 'center', paddingVertical: SP.xxl }}>
          <Text style={{ fontSize: 48, marginBottom: SP.md }}>✈️</Text>
          <Text style={{ fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SP.lg }}>{error}</Text>
          <TouchableOpacity style={{ backgroundColor: COLORS.gold, paddingHorizontal: SP.lg, paddingVertical: SP.sm, borderRadius: 20 }} onPress={() => fetchDeals()}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.background }}>Try Again</Text>
          </TouchableOpacity>
        </View>}
        {!loading && !error && filtered.length === 0 && <View style={{ alignItems: 'center', paddingVertical: SP.xxl }}>
          <Text style={{ fontSize: 64, marginBottom: SP.md }}>✈️</Text>
          <Text style={{ fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SP.sm }}>No deals found</Text>
          <Text style={{ fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' }}>
            {filter !== 'all' ? 'Try a different filter' : 'Check back soon!'}
          </Text>
        </View>}
        {!loading && !error && filtered.length > 0 && <View style={{ paddingTop: SP.sm }}>
          <Text style={{ fontSize: 13, color: COLORS.textMuted, marginLeft: SP.lg, marginBottom: SP.md, textTransform: 'uppercase', letterSpacing: 1 }}>
            {filtered.length} deal{filtered.length !== 1 ? 's' : ''} found
          </Text>
          {filtered.map(d => <DealCard key={d.id} deal={d} onPress={deal => { setSelectedDeal(deal); setModalVisible(true); }} />)}
        </View>}
        <View style={{ height: 40 }} />
      </ScrollView>
      <DealDetailModal visible={modalVisible} deal={selectedDeal} onClose={() => { setModalVisible(false); setSelectedDeal(null); }} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: SP.md, paddingVertical: SP.sm, borderRadius: 20 },
  filterBtnActive: { backgroundColor: COLORS.gold },
  filterLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary },
  filterLabelActive: { color: COLORS.background, fontWeight: '600' },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, borderRadius: 16, padding: SP.md, marginHorizontal: SP.lg, marginBottom: SP.lg, ...SHADOW },
  selectorLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4, letterSpacing: 1 },
  airportCode: { fontSize: 24, fontWeight: '700', color: COLORS.gold, marginRight: SP.sm },
  airportCity: { fontSize: 16, color: COLORS.textPrimary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SP.lg, borderBottomWidth: 1, borderBottomColor: COLORS.card },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  aptOption: { flexDirection: 'row', alignItems: 'center', padding: SP.md, borderRadius: 12, marginBottom: SP.sm, backgroundColor: COLORS.card },
  aptOptionSel: { borderWidth: 2, borderColor: COLORS.gold },
  card: { backgroundColor: COLORS.card, borderRadius: 20, marginHorizontal: SP.lg, marginBottom: SP.md, overflow: 'hidden', ...SHADOW },
  hotCard: { borderWidth: 1, borderColor: COLORS.dealHot },
  hotBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.dealHot, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  hotBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SP.lg },
  cityName: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  price: { fontSize: 32, fontWeight: '700', color: COLORS.deal },
  typicalPrice: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  savBadge: { backgroundColor: COLORS.deal+'20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  savText: { color: COLORS.deal, fontSize: 12, fontWeight: '600' },
  detailsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm, backgroundColor: COLORS.backgroundSecondary, gap: SP.md },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  detailText: { fontSize: 13, color: COLORS.textSecondary },
  nonstopBadge: { backgroundColor: COLORS.gold+'30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },
  nonstopText: { fontSize: 11, color: COLORS.gold, fontWeight: '600' },
  urgencyBar: { backgroundColor: COLORS.dealHot+'15', paddingVertical: SP.xs, alignItems: 'center' },
  urgencyText: { fontSize: 12, color: COLORS.dealHot, fontWeight: '500' },
});
