const fs = require('fs');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'sky-scrapper.p.rapidapi.com';

if (!RAPIDAPI_KEY) {
  console.error('ERROR: RAPIDAPI_KEY secret is not set!');
  console.error('Go to: Settings → Secrets → Actions → New repository secret');
  console.error('Name: RAPIDAPI_KEY');
  console.error('Value: your RapidAPI key');
  process.exit(1);
}

const ORIGINS = {
  PHL: '27544008',
  JFK: '27537542',
  EWR: '27537564',
  BWI: '27539604',
  DCA: '27539525',
  BOS: '27539525',
};

const DESTS = {
  MIA: '27544850',
  MCO: '27539793',
  ATL: '27544008',
  ORD: '27539733',
  DEN: '27539465',
  LAS: '27544156',
  LAX: '27544850',
  DFW: '27539454',
  SJU: '27546055',
  CUN: '27540568',
};

async function fetchFlights(origin, originId, dest, destId, departDate, returnDate) {
  const url = `https://${RAPIDAPI_HOST}/api/v2/flights/searchFlightsComplete?originSkyId=${origin}&destinationSkyId=${dest}&originEntityId=${originId}&destinationEntityId=${destId}&cabinClass=economy&adults=1&sortBy=best&currency=USD&market=en-US&countryCode=US&date=${departDate}&returnDate=${returnDate}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      console.log(`  API error ${response.status} for ${origin}->${dest}`);
      return [];
    }

    const data = await response.json();
    return data?.data?.itineraries || [];
  } catch (e) {
    console.log(`  Fetch error for ${origin}->${dest}: ${e.message}`);
    return [];
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const today = new Date();
  const departDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const returnDate = new Date(today.getTime() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  console.log(`Fetching flights for ${departDate} to ${returnDate}`);

  const result = {
    lastUpdated: new Date().toISOString(),
    departDate,
    returnDate,
    deals: {},
  };

  const destKeys = Object.keys(DESTS);

  for (const [origin, originId] of Object.entries(ORIGINS)) {
    console.log(`\nFetching from ${origin}...`);
    result.deals[origin] = [];

    // Fetch to 3 random destinations per origin
    const shuffled = destKeys.sort(() => Math.random() - 0.5).slice(0, 3);

    for (const dest of shuffled) {
      console.log(`  -> ${dest}`);
      const itineraries = await fetchFlights(origin, originId, dest, DESTS[dest], departDate, returnDate);

      if (itineraries.length > 0) {
        console.log(`     Found ${itineraries.length} flights`);
        result.deals[origin].push(...itineraries.slice(0, 5)); // Keep top 5 per route
      }

      await sleep(500); // Rate limiting
    }

    console.log(`  Total for ${origin}: ${result.deals[origin].length} itineraries`);
  }

  fs.writeFileSync('deals.json', JSON.stringify(result, null, 2));
  console.log('\nSaved deals.json');

  // Summary
  const totalDeals = Object.values(result.deals).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`Total: ${totalDeals} itineraries across ${Object.keys(result.deals).length} airports`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
