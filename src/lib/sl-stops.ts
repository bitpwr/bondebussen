'use server';

import axios from 'axios';
import { logSearch } from './influx';

const sitesUrl = 'https://transport.integration.sl.se/v1/sites?expand=false';
const updateInterval = 7 * 24 * 60 * 60 * 1000; // ms

export type Station = {
  id: number;
  name: string;
};

type StoredStation = {
  lowerCaseName: string;
  station: Station;
};

type StationStorage = {
  lastUpdate: Date;
  stations: StoredStation[];
};

let stationStorage: StationStorage = {
  lastUpdate: new Date(0),
  stations: []
};

async function allStations(): Promise<StationStorage> {
  if (stationStorage.lastUpdate.getTime() < Date.now() - updateInterval) {
    const stations = await fetchStations();
    if (stations) {
      console.log(`Updating ${stations.length} stations`);

      stationStorage = {
        lastUpdate: new Date(),
        stations: stations
      };
    }
  }

  return stationStorage;
}

export async function fetchStations(): Promise<StoredStation[] | null> {
  try {
    const res = await axios.get(sitesUrl, { params: {} });

    if (res.status !== 200) {
      console.error(`fetchStations status code: ${res.status}`);
      return null;
    }

    const stations: StoredStation[] = res.data.map((station: any) => ({
      lowerCaseName: station.name.toLowerCase(),
      station: {
        id: station.id,
        name: station.name
      }
    }));

    stations.sort((a, b) => a.lowerCaseName.localeCompare(b.lowerCaseName));

    return stations;
  } catch (error) {
    console.error(`fetchStations error: ${error}`);
    return null;
  }
}

export async function searchStation(name: string): Promise<Station[] | null> {
  try {
    logSearch(name);
    let result: Station[] = [];

    const storage = await allStations();

    storage.stations.forEach((stat) => {
      if (stat.lowerCaseName.toLowerCase().startsWith(name.toLowerCase())) {
        result.push(stat.station);
      }
    });

    return result;
  } catch (error) {
    console.error(`Search exception: ${error}`);
    return null;
  }
}
