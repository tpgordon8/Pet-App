export const TARA_TRIP = {
  hotel: 'Grand-Hôtel du Cap-Ferrat',
  location: 'Cap-Ferrat, French Riviera',
  timezone: 'Europe/Paris',
  startDate: '2026-04-26',
  endDate: '2026-04-30',
  days: [
    {
      date: '2026-04-26',
      label: 'Sunday, April 26',
      shortLabel: 'Sun Apr 26',
      events: [
        { start: '10:00', end: '17:00', title: 'Pool Cabanas', location: 'Club Dauphin', emoji: '🏊', optional: false },
        { start: '11:00', end: '16:00', title: 'Registration & Hospitality', location: 'Le Cap Terrace', emoji: '🏨', optional: false },
        { start: '18:30', end: '19:30', title: 'Welcome Reception', location: 'Volupté Gardens', emoji: '🥂', optional: false },
        { start: '19:30', end: '21:30', title: 'Welcome Dinner', location: 'La Veranda Terrace', emoji: '🍽️', optional: false },
        { start: '21:30', end: '24:00', title: 'Afterglow', location: 'Le Bar Terrace', emoji: '✨', optional: false },
      ]
    },
    {
      date: '2026-04-27',
      label: 'Monday, April 27',
      shortLabel: 'Mon Apr 27',
      events: [
        { start: '06:30', end: '07:15', title: 'Sunrise Yoga', location: 'Front Lobby', emoji: '🧘', optional: true },
        { start: '07:00', end: '11:00', title: 'Breakfast at Leisure', location: 'La Veranda', emoji: '☕', optional: false },
        { start: '08:15', end: '15:45', title: 'Golf Tournament', location: 'Monte-Carlo Golf Club', emoji: '⛳', optional: true },
        { start: '09:00', end: '16:00', title: 'Shopping Day', location: 'Cannes & Nice', emoji: '🛍️', optional: true },
        { start: '10:15', end: '15:15', title: 'Èze Tour & Fragonard Factory', location: 'Èze Village', emoji: '🌸', optional: true },
        { start: '10:30', end: '16:00', title: 'Beach Day', location: 'Baia Bella', emoji: '🏖️', optional: true },
        { start: '10:00', end: '17:00', title: 'Pool Cabanas', location: 'Club Dauphin', emoji: '🏊', optional: true },
        { start: '18:00', end: '18:30', title: 'Dinner Transfer', location: 'Front Lobby', emoji: '🚌', optional: false },
        { start: '19:00', end: '22:00', title: 'Casual Dinner', location: 'Yacht Club de Monaco', emoji: '⛵', optional: false },
        { start: '22:00', end: '24:00', title: 'Afterglow', location: 'Le Cap, Grand Hotel du Cap-Ferrat', emoji: '✨', optional: false },
      ]
    },
    {
      date: '2026-04-28',
      label: 'Tuesday, April 28',
      shortLabel: 'Tue Apr 28',
      events: [
        { start: '06:30', end: '07:15', title: 'Sunrise Yoga', location: 'Front Lobby', emoji: '🧘', optional: true },
        { start: '07:00', end: '11:00', title: 'Breakfast at Leisure', location: 'La Veranda', emoji: '☕', optional: false },
        { start: '08:45', end: '16:00', title: 'X-Treme Day', location: 'Cap Dramont', emoji: '🤿', optional: true },
        { start: '09:00', end: '16:00', title: 'Shopping Day', location: 'Cannes & Nice', emoji: '🛍️', optional: true },
        { start: '09:30', end: '16:00', title: 'Cooking Class at Mirazur', location: 'Mirazur, Menton', emoji: '👨‍🍳', optional: true },
        { start: '10:00', end: '17:00', title: 'Pool Cabanas', location: 'Club Dauphin', emoji: '🏊', optional: true },
        { start: '10:30', end: '16:00', title: 'Beach Day', location: 'Baia Bella', emoji: '🏖️', optional: true },
        { start: '18:15', end: '19:00', title: 'Dinner Transfer', location: 'Front Lobby', emoji: '🚌', optional: false },
        { start: '19:00', end: '23:00', title: 'Awards Dinner', location: "Hôtel de Paris, Salle Empire", emoji: '🏆', optional: false },
        { start: '23:00', end: '25:00', title: 'Afterglow', location: 'New Moods, Monte Carlo', emoji: '✨', optional: false },
      ]
    },
    {
      date: '2026-04-29',
      label: 'Wednesday, April 29',
      shortLabel: 'Wed Apr 29',
      events: [
        { start: '06:30', end: '07:15', title: 'Sunrise Yoga', location: 'Front Lobby', emoji: '🧘', optional: false },
        { start: '07:00', end: '11:00', title: 'Breakfast at Leisure', location: 'La Veranda', emoji: '☕', optional: false },
        { start: '09:15', end: '15:30', title: 'Classic Car Rally', location: 'Front Lobby', emoji: '🏎️', optional: false },
        { start: '10:00', end: '17:00', title: 'Pool Cabanas', location: 'Club Dauphin', emoji: '🏊', optional: true },
        { start: '19:00', end: '20:00', title: 'Farewell Reception', location: 'La Veranda Terrace', emoji: '🥂', optional: false },
        { start: '20:00', end: '22:00', title: 'Farewell Dinner', location: 'Club Dauphin', emoji: '🍽️', optional: false },
        { start: '22:00', end: '25:00', title: 'Afterglow', location: 'Club Dauphin', emoji: '✨', optional: false },
      ]
    },
    {
      date: '2026-04-30',
      label: 'Thursday, April 30',
      shortLabel: 'Thu Apr 30',
      events: [
        { start: '07:00', end: '11:00', title: 'Breakfast at Leisure', location: 'La Veranda', emoji: '☕', optional: false },
        { start: '11:00', end: '23:59', title: 'Departure Day', location: 'Grand-Hôtel du Cap-Ferrat', emoji: '✈️', optional: false },
      ]
    }
  ]
}

// Parse "HH:MM" string to fractional hours for comparison
export function timeToHours(timeStr) {
  const [h, m] = timeStr.split(':').map(Number)
  return h + m / 60
}
