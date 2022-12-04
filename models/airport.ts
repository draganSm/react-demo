import airports from '../data/airports.json';
import Airport from '../types/airport';

export const findAirportByIata = async (
  iata: string
): Promise<Airport | undefined> => {
  const iataID = iata.toUpperCase();
  return airports.find((airport) => airport.iata === iataID);
};

export const allAirports = async (): Promise<Airport[]> => {
  return airports;
};

export const searchAirports = async (query: string): Promise<Airport[]> => {
  const regex = new RegExp(query, 'i');

  return airports.filter(
    (airport) =>
      regex.test(airport.iata) ||
      regex.test(airport.name) ||
      regex.test(airport.city) ||
      regex.test(airport.country)
  );
};
