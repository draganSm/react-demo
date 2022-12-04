import Link from 'next/link';
import { FC } from 'react';
import Airport from '../types/airport';

type AirportProps = {
  airport: Airport;
  loading?: boolean;
};

const AirportListItem: FC<AirportProps> = ({ airport, loading }) => {
  const skeleton = loading ? 'animate-pulse bg-gray-200' : '';
  return (
    <Link
      className={`${skeleton} flex items-center p-5 mt-5 text-gray-800 border border-gray-200 rounded-lg shadow-sm hover:border-blue-600 focus:border-blue-600 focus:ring focus:ring-blue-200 focus:outline-none`}
      href={`/airports/${airport.iata.toLowerCase()}`}
    >
      <span>
        {airport.name}, {airport.city}
      </span>
      <span className="ml-auto text-gray-500">{airport.country}</span>
    </Link>
  );
};

export default AirportListItem;
