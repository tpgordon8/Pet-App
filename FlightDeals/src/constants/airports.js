// Airport data for the flight deal tracker

export const SUPPORTED_AIRPORTS = {
  'PHL': {
    code: 'PHL',
    name: 'Philadelphia International',
    city: 'Philadelphia',
    state: 'PA',
    emoji: '🔔', // Liberty Bell
  },
  'JFK': {
    code: 'JFK',
    name: 'John F. Kennedy International',
    city: 'New York',
    state: 'NY',
    emoji: '🗽',
  },
  'EWR': {
    code: 'EWR',
    name: 'Newark Liberty International',
    city: 'Newark',
    state: 'NJ',
    emoji: '🏙️',
  },
  'BWI': {
    code: 'BWI',
    name: 'Baltimore/Washington International',
    city: 'Baltimore',
    state: 'MD',
    emoji: '🦀',
  },
  'DCA': {
    code: 'DCA',
    name: 'Ronald Reagan Washington National',
    city: 'Washington',
    state: 'DC',
    emoji: '🏛️',
  },
};

// Default airport
export const DEFAULT_AIRPORT = 'PHL';

// Popular destinations with imagery data
export const DESTINATIONS = {
  'SAV': { city: 'Savannah', state: 'GA', emoji: '🌳', image: 'moss', vibe: 'Historic charm' },
  'MIA': { city: 'Miami', state: 'FL', emoji: '🌴', image: 'beach', vibe: 'Beach paradise' },
  'MCO': { city: 'Orlando', state: 'FL', emoji: '🏰', image: 'theme', vibe: 'Theme parks' },
  'TPA': { city: 'Tampa', state: 'FL', emoji: '🌊', image: 'coast', vibe: 'Gulf coast' },
  'ATL': { city: 'Atlanta', state: 'GA', emoji: '🍑', image: 'city', vibe: 'Southern hub' },
  'BOS': { city: 'Boston', state: 'MA', emoji: '🦞', image: 'historic', vibe: 'Historic New England' },
  'ORD': { city: 'Chicago', state: 'IL', emoji: '🌬️', image: 'skyline', vibe: 'Windy city' },
  'DEN': { city: 'Denver', state: 'CO', emoji: '🏔️', image: 'mountain', vibe: 'Mountain adventure' },
  'LAX': { city: 'Los Angeles', state: 'CA', emoji: '🎬', image: 'hollywood', vibe: 'West coast' },
  'SFO': { city: 'San Francisco', state: 'CA', emoji: '🌉', image: 'bridge', vibe: 'Bay area' },
  'SEA': { city: 'Seattle', state: 'WA', emoji: '☕', image: 'rain', vibe: 'Pacific Northwest' },
  'MSP': { city: 'Minneapolis', state: 'MN', emoji: '❄️', image: 'lakes', vibe: 'Land of lakes' },
  'DFW': { city: 'Dallas', state: 'TX', emoji: '🤠', image: 'texas', vibe: 'Big Texas' },
  'AUS': { city: 'Austin', state: 'TX', emoji: '🎸', image: 'music', vibe: 'Live music capital' },
  'MSY': { city: 'New Orleans', state: 'LA', emoji: '🎺', image: 'jazz', vibe: 'Jazz & culture' },
  'SAN': { city: 'San Diego', state: 'CA', emoji: '🌞', image: 'sunny', vibe: 'Perfect weather' },
  'PHX': { city: 'Phoenix', state: 'AZ', emoji: '🌵', image: 'desert', vibe: 'Desert heat' },
  'LAS': { city: 'Las Vegas', state: 'NV', emoji: '🎰', image: 'vegas', vibe: 'Entertainment' },
  'SJU': { city: 'San Juan', state: 'PR', emoji: '🏝️', image: 'tropical', vibe: 'Caribbean vibes' },
  'CHS': { city: 'Charleston', state: 'SC', emoji: '🏛️', image: 'southern', vibe: 'Southern charm' },
  'PBI': { city: 'West Palm Beach', state: 'FL', emoji: '🌴', image: 'palm', vibe: 'Luxury Florida' },
  'RSW': { city: 'Fort Myers', state: 'FL', emoji: '🐚', image: 'shells', vibe: 'Shell coast' },
  'JAX': { city: 'Jacksonville', state: 'FL', emoji: '🏖️', image: 'beach', vibe: 'First coast' },
  'RDU': { city: 'Raleigh-Durham', state: 'NC', emoji: '🌲', image: 'pines', vibe: 'Triangle area' },
  'CLT': { city: 'Charlotte', state: 'NC', emoji: '🏙️', image: 'city', vibe: 'Queen city' },
  'BNA': { city: 'Nashville', state: 'TN', emoji: '🎶', image: 'music', vibe: 'Music city' },
  'PIT': { city: 'Pittsburgh', state: 'PA', emoji: '🌉', image: 'bridges', vibe: 'Steel city' },
  'CLE': { city: 'Cleveland', state: 'OH', emoji: '🎸', image: 'rock', vibe: 'Rock & roll' },
  'DTW': { city: 'Detroit', state: 'MI', emoji: '🚗', image: 'motors', vibe: 'Motor city' },
};

// Get destination info with fallback
export const getDestinationInfo = (code) => {
  return DESTINATIONS[code] || {
    city: code,
    state: '',
    emoji: '✈️',
    image: 'generic',
    vibe: 'Adventure awaits'
  };
};
