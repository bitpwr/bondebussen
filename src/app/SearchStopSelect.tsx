'use client';

import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Station } from '@/lib/sl-stops';
import { debounce } from '@mui/material/utils';
import axios from 'axios';

type SearchStopSelectParams = {
  stationSelected?: (station: Station | null) => void;
};

export default function SearchStopSelect({ stationSelected }: Readonly<SearchStopSelectParams>) {
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
          const unique = res.data.filter(
            (item: any, index: number) => res.data.findIndex((i: any) => i.id == item.id) === index
          );
          callback(unique);
        } catch (error: any) {
          console.log(error.message);
          callback(JSON.parse('[]'));
        }
      }, 400),
    [url]
  );

  React.useEffect(() => {
    let active = true;

    if (inputValue.length < 3) {
      setOptions([]);
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
        return (
          <li {...props} key={option.id}>
            {option.name}
          </li>
        );
      }}
    />
  );
}
