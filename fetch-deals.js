const fs = require('fs');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.error('ERROR: RAPIDAPI_KEY secret is not set!');
  process.exit(1);
}

const ORIGINS = ['PHL', 'JFK', 'EWR', 'BWI', 'DCA', 'BOS'];

const REGIONS = {
  MIA: 'Southeast', ATL: 'Southeast', MCO: 'Southeast', TPA: 'Southeast',
  ORD: 'Midwest', DTW: 'Midwest', MSP: 'Midwest', CLE: 'Midwest',
  LAX: 'West', SFO: 'West', DEN: 'West', SEA: 'West', LAS: 'West',
  DFW: 'Southwest', PHX: 'Southwest', HOU: 'Southwest', AUS: 'Southwest',
  SJU: 'Southeast', CUN: 'Southwest', NAS: 'Southeast',
};

async function fetchDealsFromOrigin(origin, travelDate) {
  const url = `https://${RAPIDAPI_HOST}/api/v1/flights/searchFlightEverywhere?originSkyId=${origin}&oneWay=false&currency=USD&countryCode=US&market=en-US&travelDate=${travelDate}`;

  console.log(`Fetching from ${origin}...`);

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.log(`  API error ${response.status}`);
      return [];
    }

    const json = await response.json();
    const results = json?.data?.results || json?.data?.everywhere || json?.data || [];

    if (!Array.isArray(results)) {
      console.log(`  Unexpected response format`);
      return [];
    }

    console.log(`  Found ${results.length} destinations`);

    return results.slice(0, 15).map(item => ({
      destination: item.destinationSkyId || item.skyId || item.iata || 'UNK',
      region: REGIONS[item.destinationSkyId] || REGIONS[item.skyId] || 'Other',
      price: item.price?.amount || item.cost || item.price || 0,
      airline: item.carrier || item.airline || 'Multiple',
      departTime: '',
      arriveTime: '',
      duration: '',
      stops: item.stops ?? 0,
      departDate: travelDate,
    })).filter(d => d.price > 0);

  } catch (e) {
    console.log(`  Error: ${e.message}`);
    return [];
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const today = new Date();
  const travelDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log(`Fetching flight deals for ${travelDate}\n`);

  const result = {
    lastUpdated: new Date().toISOString(),
    departDate: travelDate,
    returnDate: new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deals: {},
  };

  for (const origin of ORIGINS) {
    result.deals[origin] = await fetchDealsFromOrigin(origin, travelDate);
    await sleep(1000); // Rate limit
  }

  fs.writeFileSync('deals.json', JSON.stringify(result, null, 2));
  console.log('\nSaved deals.json');

  const totalDeals = Object.values(result.deals).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Total: ${totalDeals} deals`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
