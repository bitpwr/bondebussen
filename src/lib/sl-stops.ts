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
    const res = await axios.get(stationSearchUrl, { params: searchOptions(name, 10) });
    const data = res.data;

    logSearch(name);

    let stops: Station[] = [];
    if (data.StatusCode != 0) {
      console.log('Statuscode: ' + data.StatusCode + ', ' + data.Message);
      return null;
    }

    data.ResponseData.forEach((s: any) => {
      stops.push({ id: s.SiteId, name: s.Name });
    });

    return stops;
  } catch (error) {
    console.error(error);
    return null;
  }
}
