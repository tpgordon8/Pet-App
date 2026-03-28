#!/usr/bin/env python3
"""Fetch flight deals using fli (Google Flights)."""

import json
from datetime import datetime, timedelta
from fli import search_flights

ORIGINS = ["PHL", "JFK", "EWR", "BWI", "DCA", "BOS"]

DESTINATIONS = [
    ("MIA", "Southeast"),
    ("ATL", "Southeast"),
    ("ORD", "Midwest"),
    ("DEN", "West"),
    ("LAX", "West"),
    ("SFO", "West"),
    ("PHX", "Southwest"),
    ("DFW", "Southwest"),
]

def get_travel_dates():
    """Get departure and return dates (2 weeks out, 4-day trip)."""
    depart = datetime.now() + timedelta(days=14)
    ret = depart + timedelta(days=4)
    return depart.strftime("%Y-%m-%d"), ret.strftime("%Y-%m-%d")


def fetch_deals_for_origin(origin: str, depart_date: str, return_date: str) -> list:
    """Fetch flight deals from a single origin."""
    deals = []

    for dest_code, region in DESTINATIONS:
        try:
            results = search_flights(
                origin=origin,
                destination=dest_code,
                departure_date=depart_date,
                return_date=return_date,
                max_results=3,
            )

            for flight in results:
                deals.append({
                    "destination": dest_code,
                    "region": region,
                    "price": flight.price,
                    "airline": flight.airline,
                    "departTime": flight.departure_time,
                    "arriveTime": flight.arrival_time,
                    "duration": flight.duration,
                    "stops": flight.stops,
                    "departDate": depart_date,
                    "returnDate": return_date,
                })
        except Exception as e:
            print(f"Error fetching {origin} -> {dest_code}: {e}")
            continue

    # Sort by price and return top deals
    deals.sort(key=lambda x: x["price"])
    return deals[:10]


def main():
    depart_date, return_date = get_travel_dates()

    all_deals = {}
    for origin in ORIGINS:
        print(f"Fetching deals from {origin}...")
        all_deals[origin] = fetch_deals_for_origin(origin, depart_date, return_date)

    output = {
        "lastUpdated": datetime.utcnow().isoformat() + "Z",
        "departDate": depart_date,
        "returnDate": return_date,
        "deals": all_deals,
    }

    with open("deals.json", "w") as f:
        json.dump(output, f, indent=2)

    print("Done! Saved to deals.json")


if __name__ == "__main__":
    main()
