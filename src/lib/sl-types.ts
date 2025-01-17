import { DirectionsBus, DirectionsRailway, DirectionsSubway, Tram } from '@mui/icons-material';

export const enum TransportType {
  Bus = 1,
  Metro = 2,
  Train = 3,
  Tram = 4
}

export type Departures = {
  checkTime: string;
  transports: TransportDepartures[];
};

export type TransportDepartures = {
  stationName: string;
  type: TransportType;
  departures: StopDepartures[];
};

export type StopDepartures = {
  stopId: number;
  destinations: string[];
  departures: Departure[];
};

export const enum DeviationType {
  Information = 1,
  Warning = 2,
  Severe = 3
}

export type Deviation = {
  text: string;
  type: DeviationType;
};

export type Departure = {
  lineNumber: string;
  destination: string;
  plannedTime: string;
  expectedTime: string;
  display?: string;
  delayedMinutes?: number;
  deviation?: Deviation;
};

export function sortTransportsByType(departures: Departures): Departures {
  departures.transports.sort((a, b) => a.type - b.type);
  return departures;
}
export function typeFromName(name: string): TransportType {
  if (name == 'BUS') {
    return TransportType.Bus;
  }

  if (name == 'METRO') {
    return TransportType.Metro;
  }

  if (name == 'TRAIN') {
    return TransportType.Train;
  }

  if (name == 'TRAM') {
    return TransportType.Tram;
  }

  return TransportType.Bus;
}

export function typeName(type: TransportType): string {
  if (type == TransportType.Bus) {
    return 'Buss';
  }

  if (type == TransportType.Metro) {
    return 'Tunnelbana';
  }

  if (type == TransportType.Train) {
    return 'Pendeltåg';
  }

  if (type == TransportType.Tram) {
    return 'Tvärbana';
  }

  return '';
}

export function typeColor(type: TransportType): string {
  if (type == TransportType.Bus) {
    return '#f44336';
  }

  if (type == TransportType.Metro) {
    return '#4caf50';
  }

  if (type == TransportType.Train) {
    return '#2979ff';
  }

  if (type == TransportType.Tram) {
    return '#606060';
  }

  return '#000000';
}

export function typeIcon(type: TransportType) {
  if (type == TransportType.Bus) {
    return DirectionsBus;
  }

  if (type == TransportType.Metro) {
    return DirectionsSubway;
  }

  if (type == TransportType.Train) {
    return DirectionsRailway;
  }

  if (type == TransportType.Tram) {
    return Tram;
  }

  return DirectionsBus;
}
