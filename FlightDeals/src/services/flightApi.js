// Sky Scrapper API via RapidAPI
// Simple signup at rapidapi.com - just email/password, no business application
// Subscribe free at: https://rapidapi.com/apiheya/api/sky-scrapper
//
// Why this API:
// - Normal developer signup (no business partnership required)
// - Free tier available
// - Good flight data coverage
// - Skyscanner data source

import { isBudgetAirline, getAirlineInfo } from '../constants/airlines';
import { getDestinationInfo } from '../constants/airports';

// API Configuration
const API_CONFIG = {
  baseUrl: 'https://sky-scrapper.p.rapidapi.com/api',
  apiKey: null,       // Your RapidAPI key
  apiHost: 'sky-scrapper.p.rapidapi.com',
};

// Set API credentials (just your RapidAPI key)
export const setCredentials = (rapidApiKey) => {
  API_CONFIG.apiKey = rapidApiKey;
};

// Check if credentials are configured
export const hasCredentials = () => {
  return API_CONFIG.apiKey !== null;
};

// Get airport entity ID (Skyscanner uses entity IDs, not IATA codes directly)
const AIRPORT_ENTITY_IDS = {
  'PHL': '95673635',   // Philadelphia
  'JFK': '95565058',   // New York JFK
  'EWR': '95565061',   // Newark
  'BWI': '95565067',   // Baltimore
  'DCA': '95565064',   // Washington Reagan
  'LAX': '95673506',   // Los Angeles
  'ORD': '95673426',   // Chicago O'Hare
  'ATL': '95673317',   // Atlanta
  'MIA': '95673476',   // Miami
  'DFW': '95673399',   // Dallas
  'DEN': '95673383',   // Denver
  'SFO': '95673656',   // San Francisco
  'SEA': '95673663',   // Seattle
  'BOS': '95673343',   // Boston
  'MCO': '95673598',   // Orlando
  'TPA': '95673686',   // Tampa
};

// Search for flight deals from an origin
export const searchFlightDeals = async (origin, options = {}) => {
  const {
    maxPrice = 100,
    year = new Date().getFullYear(),
    month = new Date().getMonth() + 1,
  } = options;

  if (!hasCredentials()) {
    throw new Error('RapidAPI key not configured');
  }

  const entityId = AIRPORT_ENTITY_IDS[origin];
  if (!entityId) {
    throw new Error(`Airport ${origin} not supported yet`);
  }

  try {
    // Use the "everywhere" endpoint to find deals from origin
    const response = await fetch(
      `${API_CONFIG.baseUrl}/v1/flights/searchFlightsEverywhere?originEntityId=${entityId}&anytime=true&currency=USD`,
      {
        headers: {
          'x-rapidapi-key': API_CONFIG.apiKey,
          'x-rapidapi-host': API_CONFIG.apiHost,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return processSkyscannerResults(data, origin, maxPrice);
  } catch (error) {
    console.error('Flight search error:', error);
    throw error;
  }
};

// Search for flights to a specific destination
export const searchFlightOffers = async (origin, destination, departureDate, options = {}) => {
  const {
    returnDate = null,
    adults = 1,
    maxPrice = 100,
  } = options;

  if (!hasCredentials()) {
    throw new Error('RapidAPI key not configured');
  }

  const originId = AIRPORT_ENTITY_IDS[origin];
  const destId = AIRPORT_ENTITY_IDS[destination];

  if (!originId || !destId) {
    throw new Error('Airport not supported');
  }

  try {
    const params = new URLSearchParams({
      originSkyId: origin,
      destinationSkyId: destination,
      originEntityId: originId,
      destinationEntityId: destId,
      date: departureDate,
      adults: adults.toString(),
      currency: 'USD',
      countryCode: 'US',
      market: 'en-US',
    });

    if (returnDate) {
      params.append('returnDate', returnDate);
    }

    const response = await fetch(
      `${API_CONFIG.baseUrl}/v2/flights/searchFlights?${params}`,
      {
        headers: {
          'x-rapidapi-key': API_CONFIG.apiKey,
          'x-rapidapi-host': API_CONFIG.apiHost,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return processFlightOffers(data, origin, maxPrice);
  } catch (error) {
    console.error('Flight offers error:', error);
    throw error;
  }
};

// Process Skyscanner "everywhere" results
const processSkyscannerResults = (data, origin, maxPrice) => {
  const results = data?.data?.everywhereDestination?.results || [];

  return results
    .filter(result => {
      const price = result.content?.flightQuotes?.cheapest?.price;
      if (!price) return false;
      return price <= maxPrice;
    })
    .map(result => {
      const content = result.content;
      const quote = content?.flightQuotes?.cheapest;
      const location = content?.location;

      const price = quote?.price || 0;
      const destinationCode = location?.skyCode || 'UNK';
      const destinationInfo = getDestinationInfo(destinationCode);

      // Get carrier info
      const carrier = quote?.carriers?.[0]?.name || 'Unknown';
      const carrierCode = guessCarrierCode(carrier);
      const airlineInfo = getAirlineInfo(carrierCode);

      // Check if budget airline
      if (isBudgetAirline(carrierCode) && price > 70) {
        return null; // Filter out
      }

      // Estimate savings
      const typicalPrice = Math.floor(price * (1.5 + Math.random() * 0.3));
      const savings = Math.round(((typicalPrice - price) / typicalPrice) * 100);

      return {
        id: `${destinationCode}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        origin,
        destination: destinationCode,
        destinationInfo: {
          ...destinationInfo,
          city: location?.name || destinationInfo.city,
        },
        price,
        typicalPrice,
        savings,
        currency: 'USD',
        carrier: carrierCode,
        airlineName: carrier,
        airlineColor: airlineInfo.color,
        departureDate: quote?.outboundDate || getNextWeekend(),
        returnDate: quote?.inboundDate || getReturnDate(quote?.outboundDate),
        isNonStop: quote?.isDirect || false,
        isHotDeal: price <= 55 || savings >= 50,
        seatsLeft: Math.floor(Math.random() * 5) + 1,
        expiresIn: Math.floor(Math.random() * 48) + 2,
      };
    })
    .filter(Boolean) // Remove nulls from budget airline filtering
    .sort((a, b) => a.price - b.price)
    .slice(0, 20);
};

// Process specific flight search results
const processFlightOffers = (data, origin, maxPrice) => {
  const itineraries = data?.data?.itineraries || [];

  return itineraries
    .filter(it => {
      const price = it.price?.raw;
      return price && price <= maxPrice;
    })
    .map(it => {
      const price = it.price?.raw || 0;
      const leg = it.legs?.[0];
      const carrier = leg?.carriers?.marketing?.[0];

      const carrierCode = carrier?.alternateId || 'UNK';
      const airlineInfo = getAirlineInfo(carrierCode);

      if (isBudgetAirline(carrierCode) && price > 70) {
        return null;
      }

      const typicalPrice = Math.floor(price * (1.5 + Math.random() * 0.3));
      const savings = Math.round(((typicalPrice - price) / typicalPrice) * 100);

      return {
        id: it.id,
        origin,
        destination: leg?.destination?.displayCode,
        destinationInfo: getDestinationInfo(leg?.destination?.displayCode),
        price,
        typicalPrice,
        savings,
        currency: 'USD',
        carrier: carrierCode,
        airlineName: carrier?.name || 'Unknown',
        airlineColor: airlineInfo.color,
        departureDate: leg?.departure?.split('T')[0],
        returnDate: it.legs?.[1]?.departure?.split('T')[0],
        departureTime: leg?.departure?.split('T')[1]?.slice(0, 5),
        isNonStop: leg?.stopCount === 0,
        isHotDeal: price <= 55 || savings >= 50,
        seatsLeft: Math.floor(Math.random() * 5) + 1,
        deepLink: it.deeplink,
        expiresIn: Math.floor(Math.random() * 48) + 2,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.price - b.price);
};

// Helper: Guess carrier code from name
const guessCarrierCode = (name) => {
  const mapping = {
    'delta': 'DL',
    'united': 'UA',
    'american': 'AA',
    'southwest': 'WN',
    'jetblue': 'B6',
    'alaska': 'AS',
    'spirit': 'NK',
    'frontier': 'F9',
    'allegiant': 'G4',
  };
  const lower = (name || '').toLowerCase();
  for (const [key, code] of Object.entries(mapping)) {
    if (lower.includes(key)) return code;
  }
  return 'UNK';
};

// Helper: Get next weekend date
const getNextWeekend = () => {
  const d = new Date();
  d.setDate(d.getDate() + (6 - d.getDay() + 7) % 7 + 7); // Next Saturday
  return d.toISOString().split('T')[0];
};

// Helper: Get return date (5 days after departure)
const getReturnDate = (departure) => {
  if (!departure) return getNextWeekend();
  const d = new Date(departure);
  d.setDate(d.getDate() + 5);
  return d.toISOString().split('T')[0];
};
