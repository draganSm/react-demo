import { GetServerSideProps, NextPage } from 'next';
import { useState } from 'react';

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
  const [query, setQuery] = useState(initialQuery);

  const airports = useApiData<Airport[]>(
    `/api/airports/${query}`,
    initialData,
    [query]
  );

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Code Challenge: Airports</h1>

      <h2 className="mt-10 text-xl font-semibold">All Airports</h2>

      <Search onChange={setQuery} />

      <div>
        {airports.map((airport) => (
          <AirportListItem key={airport.iata} airport={airport} />
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
