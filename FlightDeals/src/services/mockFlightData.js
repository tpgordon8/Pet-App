// Mock flight data for development and demo purposes
// This provides realistic-looking deals when API isn't configured

import { getDestinationInfo } from '../constants/airports';
import { AIRLINE_INFO, MAJOR_AIRLINES } from '../constants/airlines';

// Generate a random date within the next 3 months
const getRandomFutureDate = (daysFromNow = 90) => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * daysFromNow) + 7);
  return date.toISOString().split('T')[0];
};

// Generate a return date 3-7 days after departure
const getReturnDate = (departureDate) => {
  const date = new Date(departureDate);
  date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3);
  return date.toISOString().split('T')[0];
};

// Generate random time
const getRandomTime = () => {
  const hours = Math.floor(Math.random() * 14) + 6; // 6 AM to 8 PM
  const minutes = Math.random() > 0.5 ? '00' : '30';
  return `${hours.toString().padStart(2, '0')}:${minutes}`;
};

// Amazing deals data - these are realistic "too good to miss" prices
const AMAZING_DEALS = [
  { destination: 'SAV', minPrice: 49, maxPrice: 79, frequency: 'rare' },
  { destination: 'MIA', minPrice: 59, maxPrice: 89, frequency: 'common' },
  { destination: 'MCO', minPrice: 49, maxPrice: 79, frequency: 'common' },
  { destination: 'TPA', minPrice: 55, maxPrice: 85, frequency: 'common' },
  { destination: 'ATL', minPrice: 45, maxPrice: 69, frequency: 'common' },
  { destination: 'BOS', minPrice: 39, maxPrice: 65, frequency: 'rare' },
  { destination: 'ORD', minPrice: 59, maxPrice: 89, frequency: 'common' },
  { destination: 'DEN', minPrice: 79, maxPrice: 99, frequency: 'rare' },
  { destination: 'MSY', minPrice: 69, maxPrice: 95, frequency: 'medium' },
  { destination: 'CHS', minPrice: 55, maxPrice: 79, frequency: 'medium' },
  { destination: 'BNA', minPrice: 65, maxPrice: 89, frequency: 'medium' },
  { destination: 'CLT', minPrice: 45, maxPrice: 69, frequency: 'common' },
  { destination: 'RDU', minPrice: 49, maxPrice: 75, frequency: 'medium' },
  { destination: 'DFW', minPrice: 79, maxPrice: 99, frequency: 'medium' },
  { destination: 'AUS', minPrice: 85, maxPrice: 99, frequency: 'rare' },
  { destination: 'PBI', minPrice: 65, maxPrice: 89, frequency: 'medium' },
  { destination: 'RSW', minPrice: 69, maxPrice: 95, frequency: 'medium' },
  { destination: 'JAX', minPrice: 55, maxPrice: 79, frequency: 'common' },
  { destination: 'DTW', minPrice: 59, maxPrice: 85, frequency: 'common' },
  { destination: 'CLE', minPrice: 49, maxPrice: 75, frequency: 'common' },
  { destination: 'PIT', minPrice: 45, maxPrice: 69, frequency: 'common' },
  { destination: 'MSP', minPrice: 75, maxPrice: 99, frequency: 'medium' },
];

// Generate a single mock deal
const generateMockDeal = (dealConfig, origin = 'PHL') => {
  const carrier = MAJOR_AIRLINES[Math.floor(Math.random() * MAJOR_AIRLINES.length)];
  const airlineInfo = AIRLINE_INFO[carrier];
  const destInfo = getDestinationInfo(dealConfig.destination);

  const price = Math.floor(
    Math.random() * (dealConfig.maxPrice - dealConfig.minPrice) + dealConfig.minPrice
  );

  const departureDate = getRandomFutureDate();
  const returnDate = getReturnDate(departureDate);

  // Calculate "typical" price (50-150% higher) for savings display
  const typicalPrice = Math.floor(price * (1.5 + Math.random() * 0.5));
  const savings = Math.round(((typicalPrice - price) / typicalPrice) * 100);

  return {
    id: `${dealConfig.destination}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    origin,
    destination: dealConfig.destination,
    destinationInfo: destInfo,
    price,
    typicalPrice,
    savings,
    currency: 'USD',
    carrier,
    airlineName: airlineInfo?.name || carrier,
    airlineColor: airlineInfo?.color || '#666',
    departureDate,
    returnDate,
    departureTime: getRandomTime(),
    returnTime: getRandomTime(),
    isHotDeal: dealConfig.frequency === 'rare' || savings >= 50,
    isNonStop: Math.random() > 0.3, // 70% are non-stop
    seatsLeft: Math.floor(Math.random() * 5) + 1,
    expiresIn: Math.floor(Math.random() * 48) + 2, // 2-50 hours
  };
};

// Generate a list of mock deals
export const generateMockDeals = (origin = 'PHL', count = 15, maxPrice = 100) => {
  // Filter deals that could be under maxPrice
  const eligibleDeals = AMAZING_DEALS.filter(d => d.minPrice <= maxPrice);

  // Shuffle and pick random deals
  const shuffled = [...eligibleDeals].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Generate full deal objects
  const deals = selected
    .map(config => generateMockDeal(config, origin))
    .filter(deal => deal.price <= maxPrice)
    .sort((a, b) => a.price - b.price);

  return deals;
};

// Simulate API delay
export const getMockDealsWithDelay = async (origin = 'PHL', maxPrice = 100) => {
  // Simulate network delay (500-1500ms)
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  return generateMockDeals(origin, 15, maxPrice);
};

// Get a specific mock deal detail (for detail view)
export const getMockDealDetail = async (dealId) => {
  await new Promise(resolve => setTimeout(resolve, 300));

  // Parse destination from dealId
  const destination = dealId.split('-')[0];
  const dealConfig = AMAZING_DEALS.find(d => d.destination === destination) || AMAZING_DEALS[0];

  return generateMockDeal(dealConfig);
};
