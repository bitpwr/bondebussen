'use client';

import { Box, Button, ButtonGroup } from '@mui/material';
import SearchStopSelect from './SearchStopSelect';
import { Station } from '@/lib/sl-stops';
import { useEffect, useState } from 'react';
import { Departures, TransportType, typeName } from '@/lib/sl-types';
import { getDepartures } from '@/lib/sl-departures';
import StationDepartures from './StationDepartures';

export default function Home() {
  const [station, setStation] = useState<Station | null>(null);
  const [departures, setDepartures] = useState<Departures | null>(null);
  const [type, setType] = useState<TransportType>(TransportType.Bus);

  function selectStation(station: Station | null) {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (station) {
        localStorage.setItem('currentStation', `${station.id}`);
      }
    }
    setStation(station);
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentStationId = localStorage.getItem('currentStation');
      if (currentStationId) {
        setStation({ id: parseInt(currentStationId), name: '', newid: 0 });
      }
    }
  }, []);

  useEffect(() => {
    const getDeps = async (id: number) => {
      const deps = await getDepartures(id);
      setDepartures(deps);

      if (deps && !deps.transports.some((t) => t.type == type) && deps.transports.length > 0) {
        setType(deps.transports[0].type);
      }
    };

    if (station) {
      getDeps(station.id);
    }
  }, [station]);

  return (
    <Box sx={{ mt: 2 }}>
      <SearchStopSelect
        stationSelected={async (station: Station | null) => {
          selectStation(station);
        }}
      />
      {departures ? (
        <>
          <ButtonGroup
            sx={{ display: departures.transports.length < 2 ? 'none' : 'inline-block', mt: 2 }}
          >
            {departures.transports.map((t) => (
              <Button
                variant={t.type == type ? 'contained' : 'outlined'}
                key={t.type}
                onClick={() => setType(t.type)}
                size="small"
              >
                {typeName(t.type)}
              </Button>
            ))}
          </ButtonGroup>
          <StationDepartures
            departures={departures.transports.find((t) => t.type == type)}
            time={departures.checkTime}
          />
        </>
      ) : null}
    </Box>
  );
}
