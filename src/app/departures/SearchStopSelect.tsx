'use client';

import * as React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { Station } from '@/lib/sl-stops';
import { debounce } from '@mui/material/utils';
import axios from 'axios';

type SearchStopSelectParams = {
  stationSelected?: (station: Station | null) => void;
};

export default function SearchStopSelect({ stationSelected }: SearchStopSelectParams) {
  const [value, setValue] = React.useState<Station | null>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<readonly Station[]>([]);

  let hostname = '127.0.0.1:3000';
  if (typeof window !== 'undefined') {
    hostname = window.location.hostname;
  }

  const fetch = React.useMemo(
    () =>
      debounce(async (name: string, callback: (results: readonly Station[]) => void) => {
        console.log(`debounce: ${name}`);
        console.log(`http://${hostname}:3000/api/search?name=${name}`);
        const params = {
          name: name
        };
        try {
          const res = await axios.get(`http://${hostname}:3000/api/search`, { params: params });
          const unique = res.data.filter(
            (item: any, index: number) => res.data.findIndex((i: any) => i.id == item.id) === index
          );
          callback(unique);
        } catch (error: any) {
          console.log(error.message);
          callback(JSON.parse('[]'));
        }
      }, 500),
    []
  );

  React.useEffect(() => {
    console.log(`run effect, value: ${value}`);
    let active = true;

    options.findIndex;

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
    } else {
      console.log(`SKIP fetch`);
    }

    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  return (
    <>
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
          console.log(`onChange: ${newValue}`);
          setValue(newValue);
          if (stationSelected) {
            await stationSelected(newValue);
          }
        }}
        onInputChange={(event, newInputValue) => {
          console.log(`onInputChange: ${newInputValue}`);
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
    </>
  );
}
