import {
  DirectionsBoat,
  DirectionsBus,
  DirectionsRailway,
  DirectionsSubway,
  Tram
} from '@mui/icons-material';

export const enum TransportType {
  Bus = 1,
  Metro = 2,
  Train = 3,
  Tram = 4,
  Ship = 5
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
  delayedMinutes: number;
  deviation?: Deviation;
};

export function sortTransportsByType(departures: Departures): Departures {
  departures.transports.sort((a, b) => a.type - b.type);
  return departures;
}

export function sortStopsByNumber(departures: Departures): Departures {
  departures.transports.forEach((t) => {
    t.departures.sort((a, b) => a.stopId - b.stopId);
  });
  return departures;
}

export function typeFromName(name: string): TransportType {
  switch (name) {
    case 'BUS':
      return TransportType.Bus;
    case 'METRO':
      return TransportType.Metro;
    case 'TRAIN':
      return TransportType.Train;
    case 'TRAM':
      return TransportType.Tram;
    case 'SHIP':
      return TransportType.Ship;
  }

  console.error(`Unknown type name ${name}`);
  return TransportType.Bus;
}

export function typeName(type: TransportType): string {
  switch (type) {
    case TransportType.Bus:
      return 'Buss';
    case TransportType.Metro:
      return 'Tunnelbana';
    case TransportType.Train:
      return 'Pendeltåg';
    case TransportType.Tram:
      return 'Tvärbana';
    case TransportType.Ship:
      return 'Båt';
  }

  console.error(`Unknown type ${type}`);
  return 'okänd';
}

export function typeColor(type: TransportType): string {
  switch (type) {
    case TransportType.Bus:
      return '#f44336';
    case TransportType.Metro:
      return '#4caf50';
    case TransportType.Train:
      return '#2979ff';
    case TransportType.Tram:
      return '#606060';
    case TransportType.Ship:
      return '#1560bb';
  }

  console.error(`Unknown type for coloer ${type}`);
  return '#000000';
}

export function typeIcon(type: TransportType) {
  switch (type) {
    case TransportType.Bus:
      return DirectionsBus;
    case TransportType.Metro:
      return DirectionsSubway;
    case TransportType.Train:
      return DirectionsRailway;
    case TransportType.Tram:
      return Tram;
    case TransportType.Ship:
      return DirectionsBoat;
  }

  console.error(`Unknown type for icon ${type}`);
  return DirectionsBus;
}
