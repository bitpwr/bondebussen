export const enum TransportType {
  Bus = 1,
  Metro = 2,
  Train = 3,
  Tram = 4
}

export type Departures = {
  checkTime: string;
  busStops: StopDepartures[];
  trainStops: StopDepartures[];
  tramStops: StopDepartures[];
  metroStops: StopDepartures[];
  busStation?: string;
  trainStation?: string;
  tramStation?: string;
  metroStation?: string;
};

// export type StationDepartures = {
//   stationName: string;
//   type: TransportType;
//   departures: StopDepartures[];
// };

export type StopDepartures = {
  stopId: number;
  destinations: string[];
  departures: Departure[];
};

export type Departure = {
  lineNumber: number;
  destination: string;
  plannedTime: string;
  expectedTime: string;
  display?: string;
  delayedMinutes?: number;
};
