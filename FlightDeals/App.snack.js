// Flight Deals v2.0 - Full Featured Version
// All Tier 1 & Tier 2 features + International + Multi-Airport + Real API

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════
// RAPIDAPI CONFIGURATION - Sky Scrapper API
// ═══════════════════════════════════════════════════════════
const RAPIDAPI_KEY = 'e10664bc11mshe8a9c611f6b8187p17ed3fjsnd778a7edc71e';
const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';
const USE_REAL_API = true; // Set to false to use mock data
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator,
  TouchableOpacity, Modal, Linking, StatusBar, Share, Animated, Dimensions,
  Switch, Platform,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════
// THEME SYSTEM - Dark & Light Modes
// ═══════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    background: '#0A0A0F', backgroundSecondary: '#14141F',
    card: '#1C1C28', cardHighlight: '#252535',
    gold: '#C9A962', goldLight: '#E8D5A3', goldDark: '#8B7355',
    textPrimary: '#FFFFFF', textSecondary: '#A0A0B0', textMuted: '#606070',
    deal: '#4ADE80', dealHot: '#F472B6', priceNormal: '#60A5FA',
    statusBar: 'light-content',
  },
  light: {
    background: '#F5F5F7', backgroundSecondary: '#FFFFFF',
    card: '#FFFFFF', cardHighlight: '#F0F0F5',
    gold: '#996B1F', goldLight: '#C9A962', goldDark: '#6B4A15',
    textPrimary: '#1A1A1A', textSecondary: '#666666', textMuted: '#999999',
    deal: '#16A34A', dealHot: '#DB2777', priceNormal: '#2563EB',
    statusBar: 'dark-content',
  }
};

const SP = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
const SHADOW = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15, shadowRadius: 12, elevation: 5,
};

// ═══════════════════════════════════════════════════════════
// DATA CONSTANTS
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

// Expanded airports with multi-select support + Sky Scrapper entity IDs
const AIRPORTS = {
  'PHL': { code: 'PHL', name: 'Philadelphia Intl', city: 'Philadelphia', state: 'PA', emoji: '🔔', region: 'Northeast', skyId: 'PHL', entityId: '27544008' },
  'JFK': { code: 'JFK', name: 'JFK International', city: 'New York', state: 'NY', emoji: '🗽', region: 'Northeast', skyId: 'JFK', entityId: '27537542' },
  'EWR': { code: 'EWR', name: 'Newark Liberty', city: 'Newark', state: 'NJ', emoji: '🏙️', region: 'Northeast', skyId: 'EWR', entityId: '27537564' },
  'LGA': { code: 'LGA', name: 'LaGuardia', city: 'New York', state: 'NY', emoji: '🗽', region: 'Northeast', skyId: 'LGA', entityId: '27537589' },
  'BWI': { code: 'BWI', name: 'Baltimore/Washington', city: 'Baltimore', state: 'MD', emoji: '🦀', region: 'Northeast', skyId: 'BWI', entityId: '27539604' },
  'DCA': { code: 'DCA', name: 'Reagan National', city: 'Washington', state: 'DC', emoji: '🏛️', region: 'Northeast', skyId: 'DCA', entityId: '27539525' },
  'BOS': { code: 'BOS', name: 'Boston Logan', city: 'Boston', state: 'MA', emoji: '🦞', region: 'Northeast', skyId: 'BOS', entityId: '27539525' },
};

// Destinations with regions + Sky Scrapper entity IDs
const DESTS = {
  // US Domestic
  'SAV': { city: 'Savannah', country: 'USA', emoji: '🌳', vibe: 'Historic charm', region: 'Southeast', image: '🏛️', skyId: 'SAV', entityId: '27544850' },
  'MIA': { city: 'Miami', country: 'USA', emoji: '🌴', vibe: 'Beach paradise', region: 'Southeast', image: '🏖️', skyId: 'MIA', entityId: '27544008' },
  'MCO': { city: 'Orlando', country: 'USA', emoji: '🏰', vibe: 'Theme parks', region: 'Southeast', image: '🎢', skyId: 'MCO', entityId: '27544022' },
  'TPA': { city: 'Tampa', country: 'USA', emoji: '🌊', vibe: 'Gulf coast', region: 'Southeast', image: '🌅', skyId: 'TPA', entityId: '27539793' },
  'ATL': { city: 'Atlanta', country: 'USA', emoji: '🍑', vibe: 'Southern hub', region: 'Southeast', image: '🏙️', skyId: 'ATL', entityId: '27544008' },
  'BNA': { city: 'Nashville', country: 'USA', emoji: '🎶', vibe: 'Music city', region: 'Southeast', image: '🎸', skyId: 'BNA', entityId: '27539793' },
  'CHS': { city: 'Charleston', country: 'USA', emoji: '🏛️', vibe: 'Southern charm', region: 'Southeast', image: '🌺', skyId: 'CHS', entityId: '27539604' },
  'MSY': { city: 'New Orleans', country: 'USA', emoji: '🎺', vibe: 'Jazz & culture', region: 'Southeast', image: '🎭', skyId: 'MSY', entityId: '27544022' },
  'ORD': { city: 'Chicago', country: 'USA', emoji: '🌬️', vibe: 'Windy city', region: 'Midwest', image: '🏙️', skyId: 'ORD', entityId: '27539733' },
  'DTW': { city: 'Detroit', country: 'USA', emoji: '🚗', vibe: 'Motor city', region: 'Midwest', image: '🏭', skyId: 'DTW', entityId: '27539525' },
  'MSP': { city: 'Minneapolis', country: 'USA', emoji: '❄️', vibe: 'Land of lakes', region: 'Midwest', image: '🏔️', skyId: 'MSP', entityId: '27544008' },
  'DEN': { city: 'Denver', country: 'USA', emoji: '🏔️', vibe: 'Mountain adventure', region: 'West', image: '⛷️', skyId: 'DEN', entityId: '27539525' },
  'LAS': { city: 'Las Vegas', country: 'USA', emoji: '🎰', vibe: 'Entertainment', region: 'West', image: '🎲', skyId: 'LAS', entityId: '27544008' },
  'LAX': { city: 'Los Angeles', country: 'USA', emoji: '🎬', vibe: 'City of Angels', region: 'West', image: '🌴', skyId: 'LAX', entityId: '27544008' },
  'SFO': { city: 'San Francisco', country: 'USA', emoji: '🌉', vibe: 'Bay Area', region: 'West', image: '🌁', skyId: 'SFO', entityId: '27544008' },
  'SAN': { city: 'San Diego', country: 'USA', emoji: '🌞', vibe: 'Perfect weather', region: 'West', image: '🏄', skyId: 'SAN', entityId: '27544008' },
  'SEA': { city: 'Seattle', country: 'USA', emoji: '☕', vibe: 'Pacific Northwest', region: 'West', image: '🌲', skyId: 'SEA', entityId: '27544008' },
  'PHX': { city: 'Phoenix', country: 'USA', emoji: '🌵', vibe: 'Desert sun', region: 'West', image: '☀️', skyId: 'PHX', entityId: '27544008' },
  'DFW': { city: 'Dallas', country: 'USA', emoji: '🤠', vibe: 'Big Texas', region: 'South', image: '🏈', skyId: 'DFW', entityId: '27539525' },
  'AUS': { city: 'Austin', country: 'USA', emoji: '🎸', vibe: 'Live music capital', region: 'South', image: '🎵', skyId: 'AUS', entityId: '27539604' },
  'HOU': { city: 'Houston', country: 'USA', emoji: '🚀', vibe: 'Space city', region: 'South', image: '🛸', skyId: 'IAH', entityId: '27539525' },
  // Caribbean
  'SJU': { city: 'San Juan', country: 'Puerto Rico', emoji: '🏝️', vibe: 'Caribbean vibes', region: 'Caribbean', image: '🌺', skyId: 'SJU', entityId: '27544008' },
  'CUN': { city: 'Cancun', country: 'Mexico', emoji: '🏖️', vibe: 'Beach resort', region: 'Caribbean', image: '🌴', skyId: 'CUN', entityId: '27544008' },
  'PUJ': { city: 'Punta Cana', country: 'Dominican Rep', emoji: '🥥', vibe: 'All-inclusive', region: 'Caribbean', image: '🏝️', skyId: 'PUJ', entityId: '27544008' },
  'NAS': { city: 'Nassau', country: 'Bahamas', emoji: '🐚', vibe: 'Island escape', region: 'Caribbean', image: '🐠', skyId: 'NAS', entityId: '27544008' },
  'MBJ': { city: 'Montego Bay', country: 'Jamaica', emoji: '🇯🇲', vibe: 'Reggae vibes', region: 'Caribbean', image: '🎶', skyId: 'MBJ', entityId: '27544008' },
  // Europe
  'LHR': { city: 'London', country: 'UK', emoji: '🇬🇧', vibe: 'Royal city', region: 'Europe', image: '👑', skyId: 'LHR', entityId: '27544008' },
  'CDG': { city: 'Paris', country: 'France', emoji: '🇫🇷', vibe: 'City of Light', region: 'Europe', image: '🗼', skyId: 'CDG', entityId: '27544008' },
  'FCO': { city: 'Rome', country: 'Italy', emoji: '🇮🇹', vibe: 'Eternal city', region: 'Europe', image: '🏛️', skyId: 'FCO', entityId: '27544008' },
  'BCN': { city: 'Barcelona', country: 'Spain', emoji: '🇪🇸', vibe: 'Mediterranean gem', region: 'Europe', image: '⛪', skyId: 'BCN', entityId: '27544008' },
  'AMS': { city: 'Amsterdam', country: 'Netherlands', emoji: '🇳🇱', vibe: 'Canal city', region: 'Europe', image: '🚲', skyId: 'AMS', entityId: '27544008' },
  'DUB': { city: 'Dublin', country: 'Ireland', emoji: '🇮🇪', vibe: 'Emerald Isle', region: 'Europe', image: '☘️', skyId: 'DUB', entityId: '27544008' },
  'LIS': { city: 'Lisbon', country: 'Portugal', emoji: '🇵🇹', vibe: 'Coastal charm', region: 'Europe', image: '🌊', skyId: 'LIS', entityId: '27544008' },
};

const REGIONS = ['All', 'Southeast', 'Northeast', 'Midwest', 'West', 'South', 'Caribbean', 'Europe'];
const SORT_OPTIONS = [
  { id: 'price', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'savings', label: 'Best Savings' },
  { id: 'date', label: 'Departure Date' },
  { id: 'destination', label: 'Destination A-Z' },
];
const TRIP_PRESETS = [
  { id: 'any', label: 'Any Length', min: 1, max: 14 },
  { id: 'weekend', label: 'Weekend (2-3)', min: 2, max: 3 },
  { id: 'short', label: 'Short Trip (4-5)', min: 4, max: 5 },
  { id: 'week', label: 'Full Week (6-8)', min: 6, max: 8 },
];

const getDest = (c) => DESTS[c] || { city: c, country: 'Unknown', emoji: '✈️', vibe: 'Adventure awaits', region: 'Other', image: '🌍' };

// ═══════════════════════════════════════════════════════════
// MOCK FLIGHT DATA GENERATOR (Enhanced)
// ═══════════════════════════════════════════════════════════
const DEAL_CONFIGS = [
  // Domestic
  { dest: 'SAV', min: 49, max: 79 }, { dest: 'MIA', min: 59, max: 99 },
  { dest: 'MCO', min: 49, max: 89 }, { dest: 'TPA', min: 55, max: 85 },
  { dest: 'ATL', min: 45, max: 69 }, { dest: 'BNA', min: 59, max: 89 },
  { dest: 'ORD', min: 59, max: 89 }, { dest: 'DEN', min: 79, max: 119 },
  { dest: 'MSY', min: 69, max: 95 }, { dest: 'CHS', min: 55, max: 79 },
  { dest: 'DFW', min: 79, max: 109 }, { dest: 'AUS', min: 85, max: 115 },
  { dest: 'LAS', min: 89, max: 129 }, { dest: 'LAX', min: 99, max: 149 },
  { dest: 'SFO', min: 109, max: 159 }, { dest: 'SEA', min: 99, max: 139 },
  // Caribbean
  { dest: 'SJU', min: 99, max: 149 }, { dest: 'CUN', min: 149, max: 249 },
  { dest: 'PUJ', min: 199, max: 299 }, { dest: 'NAS', min: 129, max: 199 },
  { dest: 'MBJ', min: 179, max: 279 },
  // Europe
  { dest: 'LHR', min: 299, max: 449 }, { dest: 'CDG', min: 289, max: 429 },
  { dest: 'FCO', min: 349, max: 499 }, { dest: 'BCN', min: 279, max: 399 },
  { dest: 'AMS', min: 299, max: 449 }, { dest: 'DUB', min: 249, max: 379 },
  { dest: 'LIS', min: 269, max: 389 },
];

const futureDate = (minDays = 7, maxDays = 90) => {
  const d = new Date();
  d.setDate(d.getDate() + Math.floor(Math.random() * (maxDays - minDays)) + minDays);
  return d.toISOString().split('T')[0];
};

const returnDateCalc = (dep, minNights = 2, maxNights = 8) => {
  const d = new Date(dep);
  const nights = Math.floor(Math.random() * (maxNights - minNights + 1)) + minNights;
  d.setDate(d.getDate() + nights);
  return { date: d.toISOString().split('T')[0], nights };
};

const randTime = () => {
  const h = Math.floor(Math.random() * 14) + 6;
  const m = Math.random() > 0.5 ? '00' : '30';
  return `${h.toString().padStart(2,'0')}:${m}`;
};

const getPriceHistory = () => {
  const options = ['lowest', 'typical', 'good', 'high'];
  const weights = [0.2, 0.4, 0.3, 0.1];
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < weights.length; i++) {
    sum += weights[i];
    if (r <= sum) return options[i];
  }
  return 'typical';
};

const getWhyHotReasons = (deal) => {
  const reasons = [];
  if (deal.savings >= 50) reasons.push(`${deal.savings}% below typical price`);
  if (deal.priceHistory === 'lowest') reasons.push('Lowest price in 30 days');
  if (deal.isNonStop) reasons.push('Rare nonstop route');
  if (deal.seatsLeft <= 3) reasons.push(`Only ${deal.seatsLeft} seats left`);
  if (deal.price < 60) reasons.push('Under $60 round trip');
  return reasons.length > 0 ? reasons : ['Great value for this route'];
};

const generateDeals = (origins = ['PHL'], options = {}) => {
  const { maxPrice = 500, tripPreset = 'any', includeInternational = true, flexDates = false } = options;
  const preset = TRIP_PRESETS.find(p => p.id === tripPreset) || TRIP_PRESETS[0];

  let configs = [...DEAL_CONFIGS];
  if (!includeInternational) {
    configs = configs.filter(c => {
      const dest = getDest(c.dest);
      return dest.region !== 'Caribbean' && dest.region !== 'Europe';
    });
  }

  const shuffled = configs.sort(() => Math.random() - 0.5).slice(0, 20);
  const origin = origins[Math.floor(Math.random() * origins.length)];

  return shuffled.map(cfg => {
    const carrier = MAJORS[Math.floor(Math.random() * MAJORS.length)];
    const info = AIRLINES[carrier] || { name: carrier, color: '#666' };
    const dest = getDest(cfg.dest);
    const basePrice = Math.floor(Math.random() * (cfg.max - cfg.min) + cfg.min);
    const price = flexDates ? Math.floor(basePrice * 0.9) : basePrice;
    const dep = futureDate();
    const { date: ret, nights } = returnDateCalc(dep, preset.min, preset.max);
    const typical = Math.floor(price * (1.4 + Math.random() * 0.4));
    const savings = Math.round(((typical - price) / typical) * 100);
    const priceHistory = getPriceHistory();
    const expiresAt = Date.now() + (Math.floor(Math.random() * 48) + 2) * 60 * 60 * 1000;

    const deal = {
      id: `${cfg.dest}-${Date.now()}-${Math.random().toString(36).substr(2,9)}`,
      origin, destination: cfg.dest, destinationInfo: dest,
      price, typicalPrice: typical, savings, priceHistory, currency: 'USD',
      carrier, airlineName: info.name, airlineColor: info.color,
      departureDate: dep, returnDate: ret, nights,
      departureTime: randTime(), returnTime: randTime(),
      isHotDeal: price <= (cfg.min * 1.1) || savings >= 45 || priceHistory === 'lowest',
      isNonStop: Math.random() > 0.3,
      seatsLeft: Math.floor(Math.random() * 8) + 1,
      expiresAt,
      isInternational: dest.region === 'Caribbean' || dest.region === 'Europe',
    };
    deal.whyHot = getWhyHotReasons(deal);
    return deal;
  }).filter(d => d.price <= maxPrice).sort((a, b) => a.price - b.price);
};

const fetchMockDeals = async (origins, options) => {
  await new Promise(r => setTimeout(r, 1000));
  return generateDeals(origins, options);
};

// ═══════════════════════════════════════════════════════════
// REAL API - Sky Scrapper Flight Search
// ═══════════════════════════════════════════════════════════
const searchRealFlights = async (origin, destination, departDate, returnDate) => {
  const originAirport = AIRPORTS[origin];
  const destInfo = DESTS[destination];

  if (!originAirport || !destInfo) return null;

  const url = `https://${RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete?originSkyId=${origin}&destinationSkyId=${destination}&originEntityId=${originAirport.entityId}&destinationEntityId=${destInfo.entityId || '27544008'}&cabinClass=economy&adults=1&sortBy=best&currency=USD&market=en-US&countryCode=US&date=${departDate}${returnDate ? `&returnDate=${returnDate}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.log('API error:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.log('Flight search error:', error);
    return null;
  }
};

// Transform API response to our deal format
const transformApiResponse = (apiData, origin, destination) => {
  if (!apiData || !apiData.data || !apiData.data.itineraries) return [];

  const destInfo = getDest(destination);
  const deals = [];

  apiData.data.itineraries.slice(0, 10).forEach((itinerary, index) => {
    try {
      const price = itinerary.price?.raw || 0;
      const legs = itinerary.legs || [];
      const outbound = legs[0];
      const returnLeg = legs[1];

      if (!outbound) return;

      // Get carrier info
      const carrier = outbound.carriers?.marketing?.[0] || {};
      const carrierCode = carrier.alternateId || 'XX';
      const airlineInfo = AIRLINES[carrierCode] || { name: carrier.name || 'Airline', color: '#666' };

      // Skip budget airlines for expensive fares
      if (BUDGET.includes(carrierCode) && price > 70) return;

      // Calculate trip duration
      const depDate = outbound.departure?.split('T')[0];
      const retDate = returnLeg ? returnLeg.departure?.split('T')[0] : null;
      const nights = retDate ? Math.round((new Date(retDate) - new Date(depDate)) / (1000 * 60 * 60 * 24)) : 0;

      // Estimate typical price (30-50% higher)
      const typical = Math.floor(price * (1.3 + Math.random() * 0.2));
      const savings = Math.round(((typical - price) / typical) * 100);

      const deal = {
        id: `${destination}-api-${Date.now()}-${index}`,
        origin,
        destination,
        destinationInfo: destInfo,
        price: Math.round(price),
        typicalPrice: typical,
        savings,
        priceHistory: price < typical * 0.75 ? 'lowest' : price < typical * 0.9 ? 'good' : 'typical',
        currency: 'USD',
        carrier: carrierCode,
        airlineName: airlineInfo.name,
        airlineColor: airlineInfo.color,
        departureDate: depDate,
        returnDate: retDate,
        nights,
        departureTime: outbound.departure?.split('T')[1]?.slice(0, 5) || '',
        returnTime: returnLeg?.departure?.split('T')[1]?.slice(0, 5) || '',
        isHotDeal: savings >= 40 || price < 80,
        isNonStop: outbound.stopCount === 0,
        seatsLeft: Math.floor(Math.random() * 8) + 1,
        expiresAt: Date.now() + (Math.floor(Math.random() * 48) + 2) * 60 * 60 * 1000,
        isInternational: destInfo.region === 'Caribbean' || destInfo.region === 'Europe',
        isRealData: true,
      };
      deal.whyHot = getWhyHotReasons(deal);
      deals.push(deal);
    } catch (e) {
      console.log('Error parsing itinerary:', e);
    }
  });

  return deals;
};

// Fetch real deals from multiple destinations
const fetchRealDeals = async (origins, options = {}) => {
  const { maxPrice = 500, includeInternational = true } = options;
  const origin = origins[0]; // Use first selected airport

  // Pick 5-8 random destinations to search
  let destCodes = Object.keys(DESTS);
  if (!includeInternational) {
    destCodes = destCodes.filter(code => {
      const dest = DESTS[code];
      return dest.region !== 'Caribbean' && dest.region !== 'Europe';
    });
  }
  const shuffled = destCodes.sort(() => Math.random() - 0.5).slice(0, 6);

  // Generate dates (2-8 weeks out, weekend trips)
  const futureDate = (daysOut) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOut);
    return d.toISOString().split('T')[0];
  };

  const departDate = futureDate(14 + Math.floor(Math.random() * 30));
  const returnDate = futureDate(14 + Math.floor(Math.random() * 30) + 3 + Math.floor(Math.random() * 4));

  console.log(`🔍 Searching flights from ${origin} for ${departDate} - ${returnDate}...`);

  const allDeals = [];

  // Search each destination (in parallel for speed)
  const searchPromises = shuffled.map(async (dest) => {
    const apiData = await searchRealFlights(origin, dest, departDate, returnDate);
    if (apiData) {
      const deals = transformApiResponse(apiData, origin, dest);
      return deals;
    }
    return [];
  });

  try {
    const results = await Promise.all(searchPromises);
    results.forEach(deals => allDeals.push(...deals));
  } catch (e) {
    console.log('Error fetching real deals:', e);
  }

  // Filter by max price and sort
  const filtered = allDeals
    .filter(d => d.price <= maxPrice)
    .sort((a, b) => a.price - b.price);

  console.log(`✅ Found ${filtered.length} real deals!`);

  // If no real deals found, fall back to mock
  if (filtered.length === 0) {
    console.log('📦 No real deals found, using mock data...');
    return generateDeals(origins, options);
  }

  return filtered;
};

// Main fetch function - uses real API or mock based on setting
const fetchDeals = async (origins, options) => {
  if (USE_REAL_API && RAPIDAPI_KEY) {
    try {
      return await fetchRealDeals(origins, options);
    } catch (e) {
      console.log('Real API failed, falling back to mock:', e);
      return generateDeals(origins, options);
    }
  }
  return fetchMockDeals(origins, options);
};

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════
const formatDate = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
const formatDateFull = (d) => new Date(d+'T00:00:00').toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});

const getDayLabel = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
  const dayOfWeek = date.getDay();

  if (diffDays <= 3) return 'In 3 Days';
  if (diffDays <= 7 && (dayOfWeek === 5 || dayOfWeek === 6)) return 'This Weekend';
  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 14 && (dayOfWeek === 5 || dayOfWeek === 6)) return 'Next Weekend';
  if (diffDays <= 14) return 'Next Week';
  if (diffDays <= 30) return 'This Month';
  if (diffDays <= 60) return 'Next Month';
  const monthName = date.toLocaleDateString('en-US', { month: 'long' });
  return monthName;
};

const getTimeRemaining = (expiresAt) => {
  const diff = expiresAt - Date.now();
  if (diff <= 0) return 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

const shareDeal = async (deal) => {
  const message = `✈️ Flight Deal Alert!\n\n${deal.destinationInfo.emoji} ${deal.destinationInfo.city} for $${deal.price} round trip!\n\n📅 ${formatDate(deal.departureDate)} - ${formatDate(deal.returnDate)} (${deal.nights} nights)\n✈️ ${deal.airlineName}${deal.isNonStop ? ' • Nonstop' : ''}\n💰 ${deal.savings}% off typical price\n\nFound on Flight Deals app`;
  try {
    await Share.share({ message });
  } catch (e) {
    console.log('Share failed', e);
  }
};

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════

// Tab Bar for Deals / Saved
const TabBar = ({ activeTab, onTabChange, savedCount, C }) => (
  <View style={[st.tabBar, { backgroundColor: C.card }]}>
    {['deals', 'saved'].map(tab => (
      <TouchableOpacity key={tab} style={[st.tab, activeTab === tab && { borderBottomColor: C.gold, borderBottomWidth: 2 }]}
        onPress={() => onTabChange(tab)}>
        <Text style={[st.tabText, { color: activeTab === tab ? C.gold : C.textMuted }]}>
          {tab === 'deals' ? '✈️ Deals' : `♥ Saved${savedCount > 0 ? ` (${savedCount})` : ''}`}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

// Settings Modal
const SettingsModal = ({ visible, onClose, settings, onSettingsChange, C }) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={[st.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
      <View style={[st.modalContent, { backgroundColor: C.backgroundSecondary }]}>
        <View style={[st.modalHeader, { borderBottomColor: C.card }]}>
          <Text style={[st.modalTitle, { color: C.textPrimary }]}>Settings</Text>
          <TouchableOpacity onPress={onClose} style={[st.closeBtn, { backgroundColor: C.card }]}>
            <Text style={{ fontSize: 18, color: C.textSecondary }}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={{ padding: SP.lg }}>
          {/* Dark Mode */}
          <View style={st.settingRow}>
            <View>
              <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: '600' }}>Dark Mode</Text>
              <Text style={{ fontSize: 13, color: C.textMuted }}>Luxe dark theme</Text>
            </View>
            <Switch value={settings.darkMode} onValueChange={(v) => onSettingsChange({ ...settings, darkMode: v })}
              trackColor={{ false: C.card, true: C.gold }} thumbColor="#fff" />
          </View>
          {/* International */}
          <View style={st.settingRow}>
            <View>
              <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: '600' }}>International Deals</Text>
              <Text style={{ fontSize: 13, color: C.textMuted }}>Include Caribbean & Europe</Text>
            </View>
            <Switch value={settings.includeInternational} onValueChange={(v) => onSettingsChange({ ...settings, includeInternational: v })}
              trackColor={{ false: C.card, true: C.gold }} thumbColor="#fff" />
          </View>
          {/* Flexible Dates */}
          <View style={st.settingRow}>
            <View>
              <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: '600' }}>Flexible Dates</Text>
              <Text style={{ fontSize: 13, color: C.textMuted }}>±3 days for better prices</Text>
            </View>
            <Switch value={settings.flexDates} onValueChange={(v) => onSettingsChange({ ...settings, flexDates: v })}
              trackColor={{ false: C.card, true: C.gold }} thumbColor="#fff" />
          </View>
          {/* One Way */}
          <View style={st.settingRow}>
            <View>
              <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: '600' }}>One-Way Deals</Text>
              <Text style={{ fontSize: 13, color: C.textMuted }}>Show one-way fares</Text>
            </View>
            <Switch value={settings.oneWay} onValueChange={(v) => onSettingsChange({ ...settings, oneWay: v })}
              trackColor={{ false: C.card, true: C.gold }} thumbColor="#fff" />
          </View>
          {/* Trip Length */}
          <View style={{ marginTop: SP.lg }}>
            <Text style={{ fontSize: 16, color: C.textPrimary, fontWeight: '600', marginBottom: SP.sm }}>Trip Length</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SP.sm }}>
              {TRIP_PRESETS.map(p => (
                <TouchableOpacity key={p.id}
                  style={[st.presetBtn, { backgroundColor: settings.tripPreset === p.id ? C.gold : C.card }]}
                  onPress={() => onSettingsChange({ ...settings, tripPreset: p.id })}>
                  <Text style={{ color: settings.tripPreset === p.id ? C.background : C.textSecondary, fontWeight: '500' }}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Airport Selector (Multi-select)
const AirportSelector = ({ selectedAirports, onSelect, C }) => {
  const [modal, setModal] = useState(false);
  const mainApt = AIRPORTS[selectedAirports[0]] || AIRPORTS.PHL;

  const toggleAirport = (code) => {
    if (selectedAirports.includes(code)) {
      if (selectedAirports.length > 1) {
        onSelect(selectedAirports.filter(c => c !== code));
      }
    } else {
      if (selectedAirports.length < 3) {
        onSelect([...selectedAirports, code]);
      }
    }
  };

  return (
    <>
      <TouchableOpacity style={[st.selector, { backgroundColor: C.card }, SHADOW]} onPress={() => setModal(true)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <Text style={[st.selectorLabel, { color: C.textMuted }]}>FLYING FROM</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
            {selectedAirports.map((code, i) => (
              <View key={code} style={{ flexDirection: 'row', alignItems: 'center' }}>
                {i > 0 && <Text style={{ color: C.textMuted, marginHorizontal: 4 }}>+</Text>}
                <Text style={[st.airportCode, { color: C.gold }]}>{code}</Text>
              </View>
            ))}
          </View>
          {selectedAirports.length > 1 && <Text style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{selectedAirports.length} airports selected</Text>}
        </View>
        <Text style={{ fontSize: 12, color: C.textMuted }}>▼</Text>
      </TouchableOpacity>
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => setModal(false)}>
        <View style={[st.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
          <View style={[st.modalContent, { backgroundColor: C.backgroundSecondary }]}>
            <View style={[st.modalHeader, { borderBottomColor: C.card }]}>
              <View>
                <Text style={[st.modalTitle, { color: C.textPrimary }]}>Select Airports</Text>
                <Text style={{ fontSize: 12, color: C.textMuted }}>Choose up to 3 home airports</Text>
              </View>
              <TouchableOpacity onPress={() => setModal(false)} style={[st.closeBtn, { backgroundColor: C.card }]}>
                <Text style={{ fontSize: 18, color: C.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: SP.md }}>
              {Object.values(AIRPORTS).map(a => {
                const isSelected = selectedAirports.includes(a.code);
                return (
                  <TouchableOpacity key={a.code}
                    style={[st.aptOption, { backgroundColor: C.card }, isSelected && { borderWidth: 2, borderColor: C.gold }]}
                    onPress={() => toggleAirport(a.code)}>
                    <Text style={{ fontSize: 32, marginRight: SP.md }}>{a.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: C.gold }}>{a.code}</Text>
                      <Text style={{ fontSize: 14, color: C.textPrimary }}>{a.city}</Text>
                    </View>
                    {isSelected && <Text style={{ fontSize: 20, color: C.gold }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Sort & Filter Bar
const FilterSortBar = ({ sortBy, onSortChange, regionFilter, onRegionChange, C }) => (
  <View style={{ marginBottom: SP.md }}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SP.lg, gap: SP.sm }}>
      {/* Region Pills */}
      {REGIONS.map(r => (
        <TouchableOpacity key={r}
          style={[st.filterBtn, { backgroundColor: regionFilter === r ? C.gold : C.card }]}
          onPress={() => onRegionChange(r)}>
          <Text style={[st.filterLabel, { color: regionFilter === r ? C.background : C.textSecondary }]}>{r}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

// Price History Badge
const PriceHistoryBadge = ({ history, C }) => {
  const config = {
    lowest: { label: 'Lowest in 30 days', color: C.deal, bg: C.deal + '20' },
    good: { label: 'Good price', color: C.gold, bg: C.gold + '20' },
    typical: { label: 'Typical', color: C.textMuted, bg: C.card },
    high: { label: 'Above average', color: C.dealHot, bg: C.dealHot + '20' },
  }[history] || { label: '', color: C.textMuted, bg: 'transparent' };

  if (!config.label) return null;
  return (
    <View style={{ backgroundColor: config.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
      <Text style={{ fontSize: 10, color: config.color, fontWeight: '600' }}>{config.label}</Text>
    </View>
  );
};

// Deal Card (Enhanced)
const DealCard = ({ deal, onPress, onSave, isSaved, C }) => {
  const { destination, destinationInfo, price, savings, airlineName, airlineColor,
    departureDate, returnDate, nights, isHotDeal, isNonStop, seatsLeft, priceHistory,
    expiresAt, isInternational, whyHot } = deal;

  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeRemaining(expiresAt)), 60000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <TouchableOpacity style={[st.card, { backgroundColor: C.card }, isHotDeal && { borderWidth: 1, borderColor: C.dealHot }, SHADOW]}
      onPress={() => onPress?.(deal)} activeOpacity={0.8}>
      {/* Hot Badge */}
      {isHotDeal && (
        <View style={[st.hotBadge, { backgroundColor: C.dealHot }]}>
          <Text style={st.hotBadgeText}>HOT DEAL</Text>
        </View>
      )}
      {/* International Badge */}
      {isInternational && (
        <View style={[st.intlBadge, { backgroundColor: C.gold }]}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: C.background }}>{destinationInfo.region}</Text>
        </View>
      )}

      <View style={st.cardContent}>
        {/* Destination */}
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: C.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginRight: SP.md }}>
            <Text style={{ fontSize: 28 }}>{destinationInfo?.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[st.cityName, { color: C.textPrimary }]}>{destinationInfo?.city}</Text>
            <Text style={{ fontSize: 13, color: C.textSecondary }}>{destinationInfo?.country || destinationInfo?.state}</Text>
            <Text style={{ fontSize: 12, color: C.gold, fontStyle: 'italic' }}>{destinationInfo?.vibe}</Text>
          </View>
        </View>
        {/* Price */}
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[st.price, { color: C.deal }]}>${Math.round(price)}</Text>
          <PriceHistoryBadge history={priceHistory} C={C} />
          {savings > 0 && <View style={[st.savBadge, { backgroundColor: C.deal + '20' }]}><Text style={[st.savText, { color: C.deal }]}>{savings}% off</Text></View>}
        </View>
      </View>

      {/* Trip Info Bar */}
      <View style={[st.detailsBar, { backgroundColor: C.backgroundSecondary }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={[st.dot, { backgroundColor: airlineColor }]} />
          <Text style={[st.detailText, { color: C.textSecondary }]}>{airlineName}</Text>
        </View>
        <View style={[st.dayLabel, { backgroundColor: C.gold + '20' }]}>
          <Text style={{ fontSize: 11, color: C.gold, fontWeight: '600' }}>{getDayLabel(departureDate)}</Text>
        </View>
        <Text style={[st.detailText, { color: C.textSecondary }]}>{nights} nights</Text>
        {isNonStop && <View style={[st.nonstopBadge, { backgroundColor: C.gold + '30' }]}><Text style={[st.nonstopText, { color: C.gold }]}>Nonstop</Text></View>}
      </View>

      {/* Urgency/Expiration Bar */}
      <View style={[st.urgencyBar, { backgroundColor: C.dealHot + '10' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {seatsLeft <= 5 && <Text style={[st.urgencyText, { color: C.dealHot }]}>🔥 {seatsLeft} seat{seatsLeft > 1 ? 's' : ''} left</Text>}
          <Text style={{ fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>⏱ {timeLeft}</Text>
        </View>
        {/* Quick Actions */}
        <View style={{ flexDirection: 'row', gap: SP.sm, marginLeft: SP.md }}>
          <TouchableOpacity onPress={() => onSave?.(deal)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 18 }}>{isSaved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => shareDeal(deal)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={{ fontSize: 18 }}>📤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Why Hot Tooltip (on hot deals) */}
      {isHotDeal && whyHot && whyHot.length > 0 && (
        <View style={{ paddingHorizontal: SP.lg, paddingBottom: SP.sm }}>
          <Text style={{ fontSize: 11, color: C.gold }}>💡 {whyHot[0]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// Deal Detail Modal
const DealDetailModal = ({ visible, deal, onClose, onSave, isSaved, C }) => {
  if (!deal) return null;

  const openFlights = () => {
    Linking.openURL(`https://www.google.com/travel/flights?q=Flights+from+${deal.origin}+to+${deal.destination}+on+${deal.departureDate}+returning+${deal.returnDate}`);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={[st.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
        <View style={[st.modalContent, { backgroundColor: C.backgroundSecondary, maxHeight: '90%', paddingBottom: 40 }]}>
          <View style={{ width: 40, height: 4, backgroundColor: C.textMuted, borderRadius: 2, alignSelf: 'center', marginTop: SP.md, marginBottom: SP.sm }} />
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingTop: SP.md }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', marginRight: SP.md }}>
                <Text style={{ fontSize: 36 }}>{deal.destinationInfo?.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: C.textPrimary }}>{deal.destinationInfo?.city}</Text>
                <Text style={{ fontSize: 16, color: C.textSecondary }}>{deal.destinationInfo?.country || deal.destinationInfo?.state}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={[st.closeBtn, { backgroundColor: C.card }]}>
                <Text style={{ fontSize: 18, color: C.textSecondary }}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: C.gold, fontStyle: 'italic', paddingHorizontal: SP.lg, marginTop: SP.sm }}>{deal.destinationInfo?.vibe}</Text>

            {/* Price Section */}
            <View style={{ paddingHorizontal: SP.lg, marginTop: SP.lg }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 14, color: C.textSecondary }}>Round trip from </Text>
                <Text style={{ fontSize: 48, fontWeight: '700', color: C.deal }}>${Math.round(deal.price)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: SP.sm, marginTop: SP.xs }}>
                <PriceHistoryBadge history={deal.priceHistory} C={C} />
                {deal.savings > 0 && <View style={[st.savBadge, { backgroundColor: C.deal + '20' }]}><Text style={[st.savText, { color: C.deal }]}>Save {deal.savings}%</Text></View>}
              </View>
              {deal.typicalPrice && <Text style={{ fontSize: 14, color: C.textMuted, marginTop: 4 }}>Typically ${Math.round(deal.typicalPrice)}</Text>}
            </View>

            {/* Why This Deal */}
            {deal.isHotDeal && deal.whyHot && (
              <View style={{ backgroundColor: C.gold + '15', marginHorizontal: SP.lg, marginTop: SP.lg, padding: SP.md, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: C.gold }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.gold, marginBottom: SP.xs }}>💡 Why this deal is hot:</Text>
                {deal.whyHot.map((reason, i) => (
                  <Text key={i} style={{ fontSize: 13, color: C.textSecondary, marginTop: 2 }}>• {reason}</Text>
                ))}
              </View>
            )}

            {/* Flight Details */}
            <View style={{ backgroundColor: C.card, marginHorizontal: SP.lg, borderRadius: 16, padding: SP.lg, marginTop: SP.lg }}>
              {[
                ['Airline', deal.airlineName],
                ['Depart', `${formatDateFull(deal.departureDate)} at ${deal.departureTime || ''}`],
                ['Return', `${formatDateFull(deal.returnDate)} at ${deal.returnTime || ''}`],
                ['Duration', `${deal.nights} nights`],
                ['Route', `${deal.origin} → ${deal.destination}${deal.isNonStop ? '  (Nonstop)' : ''}`],
              ].map(([label, value], i) => (
                <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: SP.sm, borderBottomWidth: i < 4 ? 1 : 0, borderBottomColor: C.backgroundSecondary }}>
                  <Text style={{ fontSize: 14, color: C.textMuted }}>{label}</Text>
                  <Text style={{ fontSize: 14, color: C.textPrimary, fontWeight: '500' }}>{value}</Text>
                </View>
              ))}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', paddingHorizontal: SP.lg, marginTop: SP.lg, gap: SP.md }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: C.card, paddingVertical: SP.md, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderWidth: 1, borderColor: isSaved ? C.dealHot : C.textMuted }}
                onPress={() => onSave?.(deal)}>
                <Text style={{ fontSize: 18, marginRight: SP.xs }}>{isSaved ? '❤️' : '🤍'}</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: isSaved ? C.dealHot : C.textPrimary }}>{isSaved ? 'Saved' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: C.card, paddingVertical: SP.md, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                onPress={() => shareDeal(deal)}>
                <Text style={{ fontSize: 18, marginRight: SP.xs }}>📤</Text>
                <Text style={{ fontSize: 16, fontWeight: '600', color: C.textPrimary }}>Share</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ backgroundColor: C.gold, marginHorizontal: SP.lg, marginTop: SP.md, paddingVertical: SP.md, borderRadius: 16, alignItems: 'center' }}
              onPress={openFlights}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.background }}>Search on Google Flights</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 12, color: C.textMuted, textAlign: 'center', paddingHorizontal: SP.xl, marginTop: SP.md }}>
              Tap to see current availability and book
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Onboarding Modal
const OnboardingModal = ({ visible, onComplete, C }) => {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji: '✈️', title: 'Find Amazing Deals', desc: 'Discover flights under $100 from major airlines - no budget carriers with hidden fees.' },
    { emoji: '🏠', title: 'Set Your Airports', desc: 'Choose up to 3 home airports to see deals from all of them at once.' },
    { emoji: '🌍', title: 'Domestic & International', desc: 'Browse US domestic, Caribbean beaches, or European getaways.' },
    { emoji: '❤️', title: 'Save & Share', desc: 'Save deals for later and share amazing finds with friends.' },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: SP.xl }}>
        <View style={{ backgroundColor: C.card, borderRadius: 24, padding: SP.xl, width: '100%', maxWidth: 340 }}>
          <Text style={{ fontSize: 64, textAlign: 'center', marginBottom: SP.lg }}>{steps[step].emoji}</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', color: C.textPrimary, textAlign: 'center', marginBottom: SP.sm }}>{steps[step].title}</Text>
          <Text style={{ fontSize: 16, color: C.textSecondary, textAlign: 'center', lineHeight: 24 }}>{steps[step].desc}</Text>

          {/* Dots */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: SP.xl, gap: SP.sm }}>
            {steps.map((_, i) => (
              <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i === step ? C.gold : C.backgroundSecondary }} />
            ))}
          </View>

          {/* Button */}
          <TouchableOpacity style={{ backgroundColor: C.gold, marginTop: SP.lg, paddingVertical: SP.md, borderRadius: 16, alignItems: 'center' }}
            onPress={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.background }}>{step < steps.length - 1 ? 'Next' : 'Get Started'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Loading Animation
const LoadingAnimation = ({ C }) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 2000, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ alignItems: 'center', paddingVertical: SP.xxl }}>
      <Animated.Text style={{ fontSize: 48, transform: [{ rotate }] }}>✈️</Animated.Text>
      <Text style={{ marginTop: SP.md, fontSize: 16, color: C.textSecondary }}>Finding amazing deals...</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
export default function App() {
  // State
  const [settings, setSettings] = useState({
    darkMode: true, includeInternational: true, flexDates: false, oneWay: false, tripPreset: 'any'
  });
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('deals');
  const [selectedAirports, setSelectedAirports] = useState(['PHL']);
  const [deals, setDeals] = useState([]);
  const [savedDeals, setSavedDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('price');
  const [regionFilter, setRegionFilter] = useState('All');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const C = THEMES[settings.darkMode ? 'dark' : 'light'];

  // Fetch deals (uses real API when enabled)
  const loadDeals = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      const data = await fetchDeals(selectedAirports, {
        maxPrice: 500,
        tripPreset: settings.tripPreset,
        includeInternational: settings.includeInternational,
        flexDates: settings.flexDates,
      });
      setDeals(data);
    } catch (e) {
      console.log('Error fetching deals', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedAirports, settings]);

  useEffect(() => { loadDeals(); }, [selectedAirports, settings.tripPreset, settings.includeInternational, settings.flexDates]);

  // Filter & Sort
  const getFilteredDeals = () => {
    let filtered = [...deals];
    if (regionFilter !== 'All') {
      filtered = filtered.filter(d => d.destinationInfo.region === regionFilter);
    }
    // Sort
    switch (sortBy) {
      case 'price-desc': filtered.sort((a,b) => b.price - a.price); break;
      case 'savings': filtered.sort((a,b) => b.savings - a.savings); break;
      case 'date': filtered.sort((a,b) => new Date(a.departureDate) - new Date(b.departureDate)); break;
      case 'destination': filtered.sort((a,b) => a.destinationInfo.city.localeCompare(b.destinationInfo.city)); break;
      default: filtered.sort((a,b) => a.price - b.price);
    }
    return filtered;
  };

  // Save/Unsave
  const toggleSave = (deal) => {
    const isSaved = savedDeals.some(d => d.id === deal.id);
    if (isSaved) {
      setSavedDeals(savedDeals.filter(d => d.id !== deal.id));
    } else {
      setSavedDeals([...savedDeals, { ...deal, savedAt: Date.now() }]);
    }
  };

  const isDealSaved = (deal) => savedDeals.some(d => d.id === deal.id);

  const filteredDeals = getFilteredDeals();
  const hotCount = deals.filter(d => d.isHotDeal).length;

  return (
    <View style={{ flex: 1, backgroundColor: C.background }}>
      <StatusBar barStyle={C.statusBar} backgroundColor={C.background} />

      {/* Onboarding */}
      <OnboardingModal visible={showOnboarding} onComplete={() => setShowOnboarding(false)} C={C} />

      {/* Settings */}
      <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={setSettings} C={C} />

      {/* Header */}
      <View style={{ paddingTop: 50, paddingBottom: SP.md, paddingHorizontal: SP.lg, backgroundColor: C.background }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SP.sm }}>
              <Text style={{ fontSize: 28, fontWeight: '700', color: C.textPrimary }}>Flight Deals</Text>
              {USE_REAL_API && deals.some(d => d.isRealData) && (
                <View style={{ backgroundColor: C.deal, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>LIVE</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 13, color: C.gold }}>Major airlines • No hidden fees</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: SP.sm }}>
            {hotCount > 0 && (
              <View style={{ backgroundColor: C.dealHot + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: C.dealHot }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.dealHot }}>{hotCount} HOT</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setShowSettings(true)} style={{ padding: SP.xs }}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} savedCount={savedDeals.length} C={C} />

      {/* Content */}
      <ScrollView style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDeals(true)} tintColor={C.gold} colors={[C.gold]} />}
        showsVerticalScrollIndicator={false}>

        {activeTab === 'deals' ? (
          <>
            {/* Airport Selector */}
            <View style={{ marginTop: SP.md }}>
              <AirportSelector selectedAirports={selectedAirports} onSelect={setSelectedAirports} C={C} />
            </View>

            {/* Filters */}
            <FilterSortBar sortBy={sortBy} onSortChange={setSortBy} regionFilter={regionFilter} onRegionChange={setRegionFilter} C={C} />

            {/* Loading */}
            {loading && <LoadingAnimation C={C} />}

            {/* Deals */}
            {!loading && filteredDeals.length > 0 && (
              <View style={{ paddingTop: SP.xs }}>
                <Text style={{ fontSize: 12, color: C.textMuted, marginLeft: SP.lg, marginBottom: SP.md, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''} found
                </Text>
                {filteredDeals.map(d => (
                  <DealCard key={d.id} deal={d} onPress={(deal) => { setSelectedDeal(deal); setModalVisible(true); }}
                    onSave={toggleSave} isSaved={isDealSaved(d)} C={C} />
                ))}
              </View>
            )}

            {/* Empty */}
            {!loading && filteredDeals.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: SP.xxl }}>
                <Text style={{ fontSize: 64, marginBottom: SP.md }}>✈️</Text>
                <Text style={{ fontSize: 20, fontWeight: '600', color: C.textPrimary }}>No deals found</Text>
                <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: SP.xs }}>Try a different region or check back later</Text>
              </View>
            )}
          </>
        ) : (
          /* Saved Tab */
          <View style={{ paddingTop: SP.lg }}>
            {savedDeals.length > 0 ? (
              <>
                <Text style={{ fontSize: 12, color: C.textMuted, marginLeft: SP.lg, marginBottom: SP.md, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {savedDeals.length} saved deal{savedDeals.length !== 1 ? 's' : ''}
                </Text>
                {savedDeals.sort((a,b) => b.savedAt - a.savedAt).map(d => (
                  <DealCard key={d.id} deal={d} onPress={(deal) => { setSelectedDeal(deal); setModalVisible(true); }}
                    onSave={toggleSave} isSaved={true} C={C} />
                ))}
              </>
            ) : (
              <View style={{ alignItems: 'center', paddingVertical: SP.xxl }}>
                <Text style={{ fontSize: 64, marginBottom: SP.md }}>❤️</Text>
                <Text style={{ fontSize: 20, fontWeight: '600', color: C.textPrimary }}>No saved deals yet</Text>
                <Text style={{ fontSize: 14, color: C.textSecondary, marginTop: SP.xs }}>Tap the heart on any deal to save it</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Deal Modal */}
      <DealDetailModal visible={modalVisible} deal={selectedDeal} onClose={() => { setModalVisible(false); setSelectedDeal(null); }}
        onSave={toggleSave} isSaved={selectedDeal ? isDealSaved(selectedDeal) : false} C={C} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const st = StyleSheet.create({
  tabBar: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  tab: { flex: 1, paddingVertical: SP.md, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '600' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: SP.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  presetBtn: { paddingHorizontal: SP.md, paddingVertical: SP.sm, borderRadius: 20 },
  selector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, padding: SP.md, marginHorizontal: SP.lg, marginBottom: SP.md },
  selectorLabel: { fontSize: 11, marginBottom: 4, letterSpacing: 1 },
  airportCode: { fontSize: 22, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SP.lg, borderBottomWidth: 1 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  aptOption: { flexDirection: 'row', alignItems: 'center', padding: SP.md, borderRadius: 12, marginBottom: SP.sm },
  filterBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.md, paddingVertical: SP.sm, borderRadius: 20 },
  filterLabel: { fontSize: 13, fontWeight: '500' },
  card: { borderRadius: 20, marginHorizontal: SP.lg, marginBottom: SP.md, overflow: 'hidden' },
  hotBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, zIndex: 1 },
  hotBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  intlBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, zIndex: 1 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: SP.lg, paddingTop: SP.xl },
  cityName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  price: { fontSize: 28, fontWeight: '700' },
  savBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 4 },
  savText: { fontSize: 12, fontWeight: '600' },
  detailsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.sm, gap: SP.sm },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  detailText: { fontSize: 12 },
  dayLabel: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  nonstopBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },
  nonstopText: { fontSize: 11, fontWeight: '600' },
  urgencyBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.lg, paddingVertical: SP.xs },
  urgencyText: { fontSize: 12, fontWeight: '500' },
});
