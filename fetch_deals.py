#!/usr/bin/env python3
"""Fetch flight deals using fli (Google Flights)."""

import json
from datetime import datetime, timedelta

from fli.search import SearchFlights
from fli.models import FlightSearchFilters, FlightSegment, PassengerInfo, SeatType, MaxStops, SortBy

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
    search = SearchFlights()

    for dest_code, region in DESTINATIONS:
        try:
            filters = FlightSearchFilters(
                passenger_info=PassengerInfo(adults=1),
                flight_segments=[
                    FlightSegment(
                        departure_airport=origin,
                        arrival_airport=dest_code,
                        travel_date=depart_date,
                    ),
                    FlightSegment(
                        departure_airport=dest_code,
                        arrival_airport=origin,
                        travel_date=return_date,
                    ),
                ],
                seat_type=SeatType.ECONOMY,
                stops=MaxStops.ANY,
                sort_by=SortBy.CHEAPEST,
            )

            results = search.search(filters)

            for flight in results[:3]:
                # Extract first leg info
                first_leg = flight.legs[0] if flight.legs else None

                deals.append({
                    "destination": dest_code,
                    "region": region,
                    "price": flight.price,
                    "airline": first_leg.airline if first_leg else "Unknown",
                    "departTime": first_leg.departure_time if first_leg else "",
                    "arriveTime": first_leg.arrival_time if first_leg else "",
                    "duration": f"{flight.duration // 60}h {flight.duration % 60}m",
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
