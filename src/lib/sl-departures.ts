'use server';

import axios from 'axios';
import {
  Departure,
  Departures,
  DeviationType,
  StopDepartures,
  TransportDepartures,
  TransportType
} from './sl-types';
import { logDeparture } from './influx';

const realtimeUrl: string = 'http://api.sl.se/api2/realtimedeparturesV4.json';
const departureWindow: number = 45;

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

    const deps = parseRealtimeDepartures(res.data);
    const station = deps.transports.length > 0 ? deps.transports[0].stationName : '';
    logDeparture(station, siteId);
    return deps;
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
    transports: []
  };

  const addType = (type: TransportType, data: any) => {
    if (data.length > 0) {
      let transport: TransportDepartures = {
        stationName: '',
        type: type,
        departures: []
      };
      data.forEach((item: any) => {
        transport.stationName = parseDeparture(transport.departures, item);
      });
      departures.transports.push(transport);
    }
  };

  addType(TransportType.Bus, data.ResponseData.Buses);
  addType(TransportType.Metro, data.ResponseData.Metros);
  addType(TransportType.Train, data.ResponseData.Trains);
  addType(TransportType.Tram, data.ResponseData.Trams);

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

  const deviations = slData.Deviations;
  if (deviations != null) {
    // just pick first for now
    const deviation = deviations[0];

    if (deviations.length > 1) {
      console.log(`There are ${deviations.length} deviations`);
      console.log(deviations[1]);
    }
    let type = DeviationType.Warning;
    if (deviation.Consequence == 'INFORMATION') {
      type = DeviationType.Information;
    } else if (deviation.Consequence == 'CANCELLED') {
      type = DeviationType.Severe;
    }
    // English text after ' * '
    let text: string = deviation.Text;
    const starPos = text.indexOf('*');
    if (starPos > 0) {
      text = text.substring(0, starPos - 1);
    }
    departure.deviation = {
      text: text,
      type: type
    };
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
