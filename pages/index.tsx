import { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useRef, useState } from 'react';

import AirportListItem from '../components/airportListItem';
import Layout from '../components/layout';
import Search from '../components/search';
import usePager from '../hooks/usePager';
import { allAirports, searchAirports } from '../models/airport';
import Airport from '../types/airport';
import { PAGE_SIZE } from '../utils/const';

type PageProps = {
  airports: Airport[];
  initialQuery: string;
};

const Page: NextPage<PageProps> = ({
  airports: initialData,
  initialQuery = '',
}) => {
  const initialPage = 0;
  const pageBottomRef = useRef<HTMLDivElement>();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const apiEndpointUrlFactory = useCallback(
    (pageIndex: number) => `/api/airports/page/${pageIndex}/${query}`,
    [query]
  );

  const handlePageLoaded = useCallback(() => {
    pageBottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, []);

  const {
    items: airports,
    loading,
    lastPageLoaded,
    startNewQuery,
    loadNextPage,
  } = usePager<Airport>(
    initialPage,
    initialData,
    apiEndpointUrlFactory,
    handlePageLoaded
  );

  const handleQueryUpdate = useCallback(
    (search: string) => {
      startNewQuery();
      setQuery(search);
    },
    [startNewQuery]
  );

  const handleNextPage = useCallback(() => {
    loadNextPage();
  }, [loadNextPage]);

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Code Challenge: Airports</h1>
      <h2 className="mt-10 text-xl font-semibold">All Airports</h2>

      <div className="p-3 bg-slate-100 opacity-95 sticky top-0 after:contents ">
        <Search onChange={handleQueryUpdate} value={query} />
      </div>

      <div>
        {airports.map((airport) => (
          <AirportListItem
            key={airport.iata}
            airport={airport}
            loading={loading}
          />
        ))}
      </div>

      {!lastPageLoaded && (
        <div className="flex justify-center my-4">
          <button
            disabled={loading}
            onClick={handleNextPage}
            className="bg-blue-500 disabled:bg-blue-300 hover:bg-blue-700 disabled:hover:bg-blue-300 text-white font-bold py-2 px-4 rounded"
          >
            More ...
          </button>
        </div>
      )}
      <div ref={pageBottomRef}></div>
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
  const firstPage = airports.slice(0, PAGE_SIZE);
  return {
    props: {
      airports: firstPage,
      initialQuery: normalizedQuery ?? '',
    },
  };
};

export default Page;
