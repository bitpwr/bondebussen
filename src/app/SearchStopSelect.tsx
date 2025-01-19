'use client';

import * as React from 'react';
import { Autocomplete, Box, Stack, TextField } from '@mui/material';
import { Station } from '@/lib/sl-stops';
import { debounce } from '@mui/material/utils';
import axios from 'axios';
import { isStationInList } from '@/lib/ui-tools';
import { Favorite } from '@mui/icons-material';

type SearchStopSelectParams = {
  favorites: Station[];
  stationSelected?: (station: Station | null) => void;
};

export default function SearchStopSelect({
  favorites,
  stationSelected
}: Readonly<SearchStopSelectParams>) {
  const [value, setValue] = React.useState<Station | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<readonly Station[]>([]);
  const [url, setUrl] = React.useState<string>('http://127.0.0.1');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setUrl(`${window.location.protocol}//${window.location.hostname}:${window.location.port}`);
    }
  }, []);

  const fetch = React.useMemo(
    () =>
      debounce(async (name: string, callback: (results: readonly Station[]) => void) => {
        const params = {
          name: name
        };
        try {
          const res = await axios.get(`${url}/api/search`, { params: params });
          // Keep favorites on top and remove duplicates
          let stations: Station[] = [...favorites, ...res.data];
          stations = stations.filter(
            (item: any, index: number) => stations.findIndex((i: any) => i.id == item.id) === index
          );

          callback(stations);
        } catch (error: any) {
          console.log(error.message);
          callback(JSON.parse('[]'));
        }
      }, 400),
    [favorites, url]
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue.length < 3) {
      setOptions(favorites);
      return undefined;
    }

    if (inputValue.length > 2 && !options.some((station) => station.name == inputValue)) {
      fetch(inputValue, (results: readonly Station[]) => {
        if (active) {
          setOptions(results);
        }
      });
    }

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <Autocomplete
      filterOptions={(x) => x}
      options={options}
      getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
      autoComplete
      includeInputInList
      filterSelectedOptions
      fullWidth
      value={value}
      noOptionsText=" "
      onChange={async (event: any, newValue: Station | null) => {
        setValue(newValue);
        if (stationSelected) {
          stationSelected(newValue);
        }
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      isOptionEqualToValue={(option: Station, value: Station) => option.id == value.id}
      renderInput={(params) => <TextField {...params} label="Hållplats" fullWidth />}
      renderOption={(props: React.HTMLAttributes<HTMLLIElement>, option: Station) => {
        const isFavorite = isStationInList(option, favorites);
        return (
          <li {...props} key={option.id}>
            <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between' }}>
              <Box sx={{ fontWeight: isFavorite ? 'medium' : 'normaal' }}>{option.name}</Box>
              {isFavorite ? (
                <>
                  <Favorite color="primary" />
                </>
              ) : null}
            </Stack>
          </li>
        );
      }}
    />
  );
}
