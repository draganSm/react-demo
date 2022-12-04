import { NextPage } from "next";
import { useState } from "react";

import AirportListItem from "../components/airportListItem";
import Layout from "../components/layout";
import Search from "../components/search";
import useApiData from "../hooks/use-api-data";
import Airport from "../types/airport";

const Page: NextPage = () => {
  const [query, setQuery] = useState("");

  const airports = useApiData<Airport[]>(`/api/airports/${query}`, [query], [query]);

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

export default Page;
