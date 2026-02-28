// Airline classifications for smart deal filtering

// Budget carriers - only show if we can confirm total cost <= $100
export const BUDGET_AIRLINES = [
  'NK', // Spirit
  'F9', // Frontier
  'G4', // Allegiant
  'SY', // Sun Country
  'XP', // Avelo
  'MX', // Breeze
];

// Premium/Major carriers - show deals under $100
export const MAJOR_AIRLINES = [
  'DL', // Delta
  'UA', // United
  'AA', // American
  'B6', // JetBlue
  'WN', // Southwest
  'AS', // Alaska
  'HA', // Hawaiian
];

// Airline display names and colors
export const AIRLINE_INFO = {
  'DL': { name: 'Delta', color: '#E31937', logo: '✈️' },
  'UA': { name: 'United', color: '#005DAA', logo: '✈️' },
  'AA': { name: 'American', color: '#0078D2', logo: '✈️' },
  'B6': { name: 'JetBlue', color: '#003876', logo: '✈️' },
  'WN': { name: 'Southwest', color: '#FFBF27', logo: '✈️' },
  'AS': { name: 'Alaska', color: '#01426A', logo: '✈️' },
  'HA': { name: 'Hawaiian', color: '#8B2346', logo: '🌺' },
  'NK': { name: 'Spirit', color: '#FFE600', logo: '👻', budget: true },
  'F9': { name: 'Frontier', color: '#00843D', logo: '🦌', budget: true },
  'G4': { name: 'Allegiant', color: '#F7941E', logo: '✈️', budget: true },
  'SY': { name: 'Sun Country', color: '#F15A29', logo: '☀️', budget: true },
};

// Check if an airline is a budget carrier
export const isBudgetAirline = (code) => BUDGET_AIRLINES.includes(code);

// Get airline display info
export const getAirlineInfo = (code) => {
  return AIRLINE_INFO[code] || { name: code, color: '#666', logo: '✈️' };
};
