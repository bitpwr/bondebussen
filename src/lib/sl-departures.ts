'use server';

import axios from 'axios';
import {
  Departure,
  Departures,
  Deviation,
  DeviationType,
  sortStopsByNumber,
  sortTransportsByType,
  StopDepartures,
  TransportDepartures,
  TransportType,
  typeFromName
} from './sl-types';
import { logDeparture } from './influx';

function departureUrl(siteId: number): string {
  return `https://transport.integration.sl.se/v1/sites/${siteId}/departures`;
}

const departureOptions = {
  forecast: 45
};

export type ErrorHandler = (message: string) => void;

export async function getDepartures(
  siteId: number,
  errorHandler?: ErrorHandler
): Promise<Departures | null> {
  try {
    const res = await axios.get(departureUrl(siteId), {
      params: departureOptions
    });
    if (res.status !== 200) {
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

// generate deviation info if any
function deviation(deviations: any): Deviation | undefined {
  if (deviations.length > 0) {
    const dev = deviations.reduce((prev: any, current: any) => {
      return (prev.importance_level > current.importance_level) ? prev : current;
    });

    let type = DeviationType.Warning;
    if (dev.consequence == 'INFORMATION') {
      type = DeviationType.Information;
    } else if (dev.consequence == 'CANCELLED') {
      type = DeviationType.Severe;
    }

    const d: Deviation = {
      text: dev.message,
      type: type
    };
    return d;
  }

  return undefined;
}

// parse SL realtime departures into Departures
function parseRealtimeDepartures(data: any) {
  const date = new Date();

  let departures: Departures = {
    checkTime: date.toLocaleTimeString('se-SV', { timeZone: 'Europe/Stockholm' }),
    transports: []
  };

  const transportDepartures = (type: TransportType, station: string) => {
    const existingTransport = departures.transports.find((t) => t.type === type);
    if (existingTransport) {
      return existingTransport;
    } else {
      let transport: TransportDepartures = {
        stationName: station,
        type: type,
        departures: []
      };
      departures.transports.push(transport);
      return transport;
    }
  };

  const stopDepartures = (transport: TransportDepartures, stopId: number) => {
    const existingStop = transport.departures.find((s) => s.stopId === stopId);
    if (existingStop) {
      return existingStop;
    } else {
      let stop: StopDepartures = {
        stopId: stopId,
        destinations: [],
        departures: []
      };
      transport.departures.push(stop);
      return stop;
    }
  };

  data.departures?.forEach((item: any) => {
    const timeTableDate: Date = new Date(item.scheduled);
    const expectedDate: Date = new Date(item.expected);
    const type: TransportType = typeFromName(item.line.transport_mode);
    const stopPoint: number = item.stop_point.id;

    let dep: Departure = {
      lineNumber: item.line.designation,
      destination: item.destination,
      plannedTime: timeFormat(timeTableDate),
      expectedTime: timeFormat(expectedDate),
      display: item.display,
      delayedMinutes: 0,
      deviation: deviation(item.deviations)
    };

    if (dep.plannedTime != dep.expectedTime) {
      dep.delayedMinutes = Math.round(
        (expectedDate.getTime() - timeTableDate.getTime()) / (1000 * 60)
      );
    }

    const transport = transportDepartures(type, item.stop_area.name);
    const stop = stopDepartures(transport, stopPoint);
    stop.departures.push(dep);
    if (!stop.destinations.some((d) => d == dep.destination)) {
      stop.destinations.push(dep.destination);
    }
  });

  sortTransportsByType(departures);
  sortStopsByNumber(departures);
  return departures;
}
