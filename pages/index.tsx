import { GetServerSideProps, NextPage } from 'next';
import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

import AirportListItem from '../components/airportListItem';
import Layout from '../components/layout';
import Search from '../components/search';
import useApiData from '../hooks/use-api-data';
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
  const lastPageIndexRef = useRef(0);
  const [pageIndex, setPageIndex] = useState(initialPage);
  const [query, setQuery] = useState(initialQuery);
  const [airports, setAirports] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [lastPageLoaded, setLastPageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    (async () => {
      const append = lastPageIndexRef.current != -1;
      if (pageIndex !== lastPageIndexRef.current) {
        lastPageIndexRef.current = pageIndex;
        try {
          let response = await axios.get<Airport[]>(
            `/api/airports/page/${pageIndex}/${query}`
          );
          let newPage = response.data;
          if (newPage.length) {
            setAirports(append ? airports.concat(newPage) : newPage);
          } else {
            setLastPageLoaded(true);
          }
          setLoading(false);
          setTimeout(() => {
            pageBottomRef.current?.scrollIntoView({
              behavior: 'smooth',
              block: 'end',
            });
          }, 0);
        } catch (e) {
          // TODO: add error message
        }
      }
    })();
  }, [airports, initialData, pageIndex, query]);

  const handleQueryUpdate = useCallback((search: string) => {
    // smells like a useReducer case
    setQuery(search);
    setLoading(true);
    setPageIndex(0);
    setLastPageLoaded(false);
    lastPageIndexRef.current = -1;
  }, []);

  const handleNextPage = useCallback(() => {
    setPageIndex(pageIndex + 1);
    setLoading(true);
  }, [pageIndex]);

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
            onClick={handleNextPage}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
