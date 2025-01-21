'use client';

import { Box, Button, ButtonGroup } from '@mui/material';
import SearchStopSelect from './SearchStopSelect';
import { Station } from '@/lib/sl-stops';
import { useEffect, useState } from 'react';
import { Departures, TransportType, typeName } from '@/lib/sl-types';
import { getDepartures } from '@/lib/sl-departures';
import StationDepartures from './StationDepartures';
import { isStationInList } from '@/lib/ui-tools';

export default function Home() {
  const [station, setStation] = useState<Station | null>(null);
  const [departures, setDepartures] = useState<Departures | null>(null);
  const [type, setType] = useState<TransportType>(TransportType.Bus);
  const [favorite, setFavorite] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Station[]>([]);

  function selectStation(station: Station | null) {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (station) {
        localStorage.setItem('currentStation', `${station.id}`);
      }
    }
    if (station) {
      setStation(station);
    }
  }

  function updateFavoriteStation(name: string | undefined, isFavorite: boolean) {
    if (!station || !name || name === '') {
      console.error('No station name when setting favorite');
      return;
    }

    const favoriteStation: Station = { id: station.id, name: name };

    setFavorite(isFavorite);
    const wasFavorite = isStationInList(favoriteStation, favorites);
    let newFavorites: Station[] | null = null;
    if (isFavorite && !wasFavorite) {
      newFavorites = [...favorites, favoriteStation];
    } else if (!isFavorite && wasFavorite) {
      newFavorites = favorites.filter((s) => s.id !== favoriteStation.id);
    }

    if (newFavorites != null) {
      setFavorites(newFavorites);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('favorites', JSON.stringify(newFavorites));
      }
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const currentStationId = localStorage.getItem('currentStation');
      if (currentStationId) {
        setStation({ id: parseInt(currentStationId), name: '' });
      }
      const favs = localStorage.getItem('favorites');
      if (favs) {
        setFavorites(JSON.parse(favs));
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
      setFavorite(isStationInList(station, favorites));
    } else {
      console.error('No station selected when station changed');
    }
  }, [station]);

  return (
    <Box sx={{ mt: 2 }}>
      <SearchStopSelect
        favorites={favorites}
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
            favorite={favorite}
            favoriteChanged={async (name: string | undefined, checked: boolean) => {
              updateFavoriteStation(name, checked);
            }}
          />
        </>
      ) : null}
    </Box>
  );
}
