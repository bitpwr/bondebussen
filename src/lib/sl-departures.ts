'use server';

import axios from 'axios';
import { Departure, Departures, StopDepartures } from './sl-types';

const realtimeUrl: string = 'http://api.sl.se/api2/realtimedeparturesV4.json';
const departureWindow: number = 35;

function realtimeOptions(siteId: number, minutes: number) {
  const params = {
    key: process.env.BB_REALTIME_KEY,
    siteid: siteId,
    timewindow: minutes,
    bus: true,
    metro: true,
    train: true,
    tram: true,
    ship: false
  };

  return params;
}

export type ErrorHandler = (message: string) => void;

export async function getDepartures(
  siteId: number,
  errorHandler?: ErrorHandler
): Promise<Departures | null> {
  try {
    const res = await axios.get(realtimeUrl, { params: realtimeOptions(siteId, departureWindow) });
    if (res.data.StatusCode !== 0) {
      errorHandler?.(res.data.Message);
      return null;
    }

    return parseRealtimeDepartures(res.data);
  } catch (error: any) {
    console.log(error.message);
    errorHandler?.('Kunde inte hämta avgångar');
    return null;
  }
}

function timeFormat(date: Date) {
  function z(n: number) {
    return (n < 10 ? '0' : '') + n;
  }
  return z(date.getHours()) + ':' + z(date.getMinutes());
}

// parse SL realtime departures into Departures
function parseRealtimeDepartures(data: any): Departures {
  const date = new Date(data.ResponseData.LatestUpdate);

  let departures: Departures = {
    checkTime: date.toLocaleTimeString('se-SV'),
    busStops: [],
    trainStops: [],
    tramStops: [],
    metroStops: []
  };

  data.ResponseData.Buses.forEach((item: any) => {
    const station = parseDeparture(departures.busStops, item);
    if (!departures.busStation) {
      departures.busStation = station;
    }
  });

  data.ResponseData.Trains.forEach((item: any) => {
    const station = parseDeparture(departures.trainStops, item);
    if (!departures.trainStation) {
      departures.trainStation = station;
    }
  });

  data.ResponseData.Trams.forEach((item: any) => {
    const station = parseDeparture(departures.tramStops, item);
    if (!departures.tramStation) {
      departures.tramStation = station;
    }
  });

  data.ResponseData.Metros.forEach((item: any) => {
    const station = parseDeparture(departures.metroStops, item);
    if (!departures.metroStation) {
      departures.metroStation = station;
    }
  });

  return departures;
}

/// Adds the departure in slData to stops
/// returns the name of the stop
function parseDeparture(stops: StopDepartures[], slData: any): string {
  const timeTableDate: Date = new Date(slData.TimeTabledDateTime);
  const expectedDate: Date = new Date(slData.ExpectedDateTime);

  const departure: Departure = {
    lineNumber: slData.LineNumber,
    destination: slData.Destination,
    plannedTime: timeFormat(timeTableDate),
    expectedTime: timeFormat(expectedDate)
  };

  if (slData.DisplayTime != departure.expectedTime) {
    departure.display = slData.DisplayTime;
  }

  if (departure.plannedTime != departure.expectedTime) {
    departure.delayedMinutes = Math.round(
      (expectedDate.getTime() - timeTableDate.getTime()) / (1000 * 60)
    );
  }

  const stopId: number = slData.StopPointNumber;

  const existingStop = stops.find((s) => s.stopId === stopId);
  if (existingStop) {
    existingStop.departures.push(departure);
    if (!existingStop.destinations.some((d) => d == departure.destination)) {
      existingStop.destinations.push(departure.destination);
    }
  } else {
    stops.push({ stopId: stopId, destinations: [departure.destination], departures: [departure] });
  }

  return slData.StopAreaName;
}
