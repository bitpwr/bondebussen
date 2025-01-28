'use server';

import axios from 'axios';
import { logSearch } from './influx';

const stationSearchUrl = 'https://journeyplanner.integration.sl.se/v1/typeahead.json';

function searchOptions(name: string, maxResults: number) {
  const params = {
    key: process.env.BB_SEARCH_KEY,
    searchstring: name,
    stationsonly: true,
    maxresults: maxResults
  };

  return params;
}

export type Station = {
  id: number;
  name: string;
};

export async function searchStation(name: string): Promise<Station[] | null> {
  try {
    console.log(`Search for '${name}'`);

    const res = await axios.get(stationSearchUrl, { params: searchOptions(name, 15) });
    const data = res.data;

    logSearch(name);

    let stops: Station[] = [];
    if (data.StatusCode != 0) {
      console.error(`Search failed: code ${data.StatusCode}, ${data.Message}`);
      return null;
    }

    // do not add duplicate stops
    data.ResponseData.forEach((s: any) => {
      const stopId = parseInt(s.SiteId.slice(s.SiteId.length - 4));
      if (!stops.some((stop) => stop.id === stopId)) {
        stops.push({ id: stopId, name: s.Name });
      }
    });

    return stops;
  } catch (error) {
    console.error(`Search exception: ${error}`);
    return null;
  }
}
