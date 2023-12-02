'use client';

import { Box, Button, ButtonGroup, Divider } from '@mui/material';
import SearchStopSelect from './SearchStopSelect';
import { Station } from '@/lib/sl-stops';
import { useEffect, useState } from 'react';
import { Departures, StopDepartures, TransportType } from '@/lib/sl-types';
import { getDepartures } from '@/lib/sl-departures';
import StationDepartures from './StationDepartures';

function hasType(deps: Departures, type: TransportType) {
  if (type == TransportType.Bus && deps.busStops.length > 0) {
    return true;
  }

  if (type == TransportType.Metro && deps.metroStops.length > 0) {
    return true;
  }

  if (type == TransportType.Train && deps.trainStops.length > 0) {
    return true;
  }

  if (type == TransportType.Tram && deps.tramStops.length > 0) {
    return true;
  }

  return false;
}

export default function Client() {
  const [station, setStation] = useState<Station | null>(null);
  const [departures, setDepartures] = useState<Departures | null>(null);
  const [type, setType] = useState<TransportType>(TransportType.Bus);

  useEffect(() => {
    const getDeps = async (id: number) => {
      const deps = await getDepartures(id);
      setDepartures(deps);
    };

    if (station) {
      getDeps(station.id);
    }
  }, [station]);

  const getStops = (): StopDepartures[] => {
    if (!departures) {
      return [];
    }

    if (type == TransportType.Bus) {
      return departures.busStops;
    }

    if (type == TransportType.Metro) {
      return departures.metroStops;
    }

    if (type == TransportType.Train) {
      return departures.trainStops;
    }

    if (type == TransportType.Tram) {
      return departures.tramStops;
    }

    return [];
  };

  return (
    <Box>
      <SearchStopSelect
        stationSelected={async (station: Station | null) => {
          setStation(station);
        }}
      />
      <ButtonGroup variant="contained" aria-label="outlined primary button group">
        {departures?.busStation ? (
          <Button onClick={() => setType(TransportType.Bus)}>Buss</Button>
        ) : null}
        {departures?.metroStation ? (
          <Button onClick={() => setType(TransportType.Metro)}>Tunnelbana</Button>
        ) : null}
        {departures?.trainStation ? (
          <Button onClick={() => setType(TransportType.Train)}>Pendeltåg</Button>
        ) : null}
        {departures?.tramStation ? (
          <Button onClick={() => setType(TransportType.Tram)}>Tvärbana</Button>
        ) : null}
      </ButtonGroup>
      <Divider />
      {departures ? (
        <StationDepartures
          stops={getStops()}
          station={departures.busStation}
          time={departures.checkTime}
        />
      ) : null}
    </Box>
  );
}
