// Amadeus Flight API Service
// Handles authentication and flight deal searches

import { isBudgetAirline } from '../constants/airlines';

// API Configuration
// In production, these should be in environment variables
const AMADEUS_CONFIG = {
  baseUrl: 'https://test.api.amadeus.com', // Use 'https://api.amadeus.com' for production
  clientId: null,     // Set via setCredentials()
  clientSecret: null, // Set via setCredentials()
};

// Token storage
let accessToken = null;
let tokenExpiry = null;

// Set API credentials
export const setCredentials = (clientId, clientSecret) => {
  AMADEUS_CONFIG.clientId = clientId;
  AMADEUS_CONFIG.clientSecret = clientSecret;
};

// Check if credentials are configured
export const hasCredentials = () => {
  return AMADEUS_CONFIG.clientId && AMADEUS_CONFIG.clientSecret;
};

// Get OAuth2 access token
const getAccessToken = async () => {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  if (!hasCredentials()) {
    throw new Error('Amadeus API credentials not configured');
  }

  try {
    const response = await fetch(`${AMADEUS_CONFIG.baseUrl}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${AMADEUS_CONFIG.clientId}&client_secret=${AMADEUS_CONFIG.clientSecret}`,
    });

    if (!response.ok) {
      throw new Error('Failed to authenticate with Amadeus API');
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry 5 minutes before actual expiry for safety
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Amadeus auth error:', error);
    throw error;
  }
};

// Search for flight inspiration (deals from an origin)
export const searchFlightDeals = async (origin, options = {}) => {
  const {
    maxPrice = 100,
    departureDate = null, // Format: YYYY-MM-DD or range YYYY-MM-DD,YYYY-MM-DD
    oneWay = false,
    nonStop = false,
    viewBy = 'DESTINATION', // or 'DATE'
  } = options;

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      origin,
      maxPrice: maxPrice.toString(),
    });

    if (departureDate) {
      params.append('departureDate', departureDate);
    }
    if (oneWay) {
      params.append('oneWay', 'true');
    }
    if (nonStop) {
      params.append('nonStop', 'true');
    }
    params.append('viewBy', viewBy);

    const response = await fetch(
      `${AMADEUS_CONFIG.baseUrl}/v1/shopping/flight-destinations?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to fetch flight deals');
    }

    const data = await response.json();
    return processFlightDeals(data.data || [], maxPrice);
  } catch (error) {
    console.error('Flight search error:', error);
    throw error;
  }
};

// Search for specific flight offers (more detailed)
export const searchFlightOffers = async (origin, destination, departureDate, options = {}) => {
  const {
    returnDate = null,
    adults = 1,
    maxPrice = 100,
    nonStop = false,
    max = 20,
  } = options;

  try {
    const token = await getAccessToken();

    const params = new URLSearchParams({
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: adults.toString(),
      max: max.toString(),
      currencyCode: 'USD',
    });

    if (returnDate) {
      params.append('returnDate', returnDate);
    }
    if (nonStop) {
      params.append('nonStop', 'true');
    }
    if (maxPrice) {
      params.append('maxPrice', maxPrice.toString());
    }

    const response = await fetch(
      `${AMADEUS_CONFIG.baseUrl}/v2/shopping/flight-offers?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to fetch flight offers');
    }

    const data = await response.json();
    return processFlightOffers(data.data || [], maxPrice);
  } catch (error) {
    console.error('Flight offers error:', error);
    throw error;
  }
};

// Process flight deals and filter out budget airlines
const processFlightDeals = (deals, maxPrice) => {
  return deals
    .filter(deal => {
      const price = parseFloat(deal.price?.total || deal.price);
      return price <= maxPrice;
    })
    .map(deal => ({
      destination: deal.destination,
      origin: deal.origin,
      price: parseFloat(deal.price?.total || deal.price),
      departureDate: deal.departureDate,
      returnDate: deal.returnDate,
      links: deal.links,
    }))
    .sort((a, b) => a.price - b.price);
};

// Process flight offers with airline filtering
const processFlightOffers = (offers, maxPrice) => {
  return offers
    .filter(offer => {
      const price = parseFloat(offer.price?.total);
      const carrier = offer.validatingAirlineCodes?.[0];

      // If it's a budget airline, only include if we have full price breakdown
      // and it's still under maxPrice (Amadeus includes some fees)
      if (isBudgetAirline(carrier)) {
        // For now, exclude budget airlines as Amadeus doesn't include all fees
        // TODO: In future, could integrate with airline APIs for full pricing
        return false;
      }

      return price <= maxPrice;
    })
    .map(offer => ({
      id: offer.id,
      price: parseFloat(offer.price?.total),
      currency: offer.price?.currency || 'USD',
      carrier: offer.validatingAirlineCodes?.[0],
      segments: offer.itineraries?.map(itinerary => ({
        duration: itinerary.duration,
        segments: itinerary.segments?.map(seg => ({
          departure: {
            airport: seg.departure?.iataCode,
            time: seg.departure?.at,
          },
          arrival: {
            airport: seg.arrival?.iataCode,
            time: seg.arrival?.at,
          },
          carrier: seg.carrierCode,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          duration: seg.duration,
        })),
      })),
      numberOfBookableSeats: offer.numberOfBookableSeats,
      lastTicketingDate: offer.lastTicketingDate,
    }))
    .sort((a, b) => a.price - b.price);
};

// Export for testing
export const __testing = {
  getAccessToken,
  processFlightDeals,
  processFlightOffers,
};
