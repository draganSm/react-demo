import { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useState } from 'react';

import AirportListItem from '../components/airportListItem';
import Layout from '../components/layout';
import Search from '../components/search';
import useApiData from '../hooks/use-api-data';
import { allAirports, searchAirports } from '../models/airport';
import Airport from '../types/airport';

type PageProps = {
  airports: Airport[];
  initialQuery: string;
};

const Page: NextPage<PageProps> = ({
  airports: initialData,
  initialQuery = '',
}) => {
  const initialPage = 0;
  const [page, setPage] = useState(initialPage);
  const [query, setQuery] = useState(initialQuery);
  const [airports, setAirports] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const newAirports = useApiData<Airport[]>(`/api/airports/page/${page}/${query}`, initialData, [query]);
  if (newAirports !== airports) {
    // please enable network throttling in order to see the loading effect
    setAirports(newAirports);
    setLoading(false);
  }

  const handleQueryUpdate = useCallback((search: string) => {
    setQuery(search);
    setLoading(true);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Code Challenge: Airports</h1>

      <h2 className="mt-10 text-xl font-semibold">All Airports</h2>

      <Search onChange={handleQueryUpdate} value={query} />

      <div>
        {airports.map((airport) => (
          <AirportListItem key={airport.iata} airport={airport} loading={loading} />
        ))}
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  params,
}) => {
  const { search } = query ?? {};

  // if we got ?search=berlin&search=münchen, we will ignore second value of `search` key
  const normalizedQuery = (
    (Array.isArray(search) ? search[0] : search) ?? ''
  ).trim();

  const airports = await (normalizedQuery
    ? searchAirports(normalizedQuery)
    : allAirports());
  return {
    props: {
      airports,
      initialQuery: normalizedQuery ?? '',
    },
  };
};

export default Page;
