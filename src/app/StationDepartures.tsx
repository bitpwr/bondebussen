import {
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import {
  Departure,
  DeviationType,
  StopDepartures,
  TransportDepartures,
  typeColor,
  typeIcon
} from '@/lib/sl-types';
import { useEffect, useState } from 'react';
import { Favorite, FavoriteBorder, Refresh } from '@mui/icons-material';

const secondaryItem = (departure: Departure) => {
  if (!departure.delayedMinutes && !departure.deviation) {
    return null;
  }

  return (
    <Stack direction="column" alignItems="flex-start">
      {departure.delayedMinutes && departure.delayedMinutes > 0 ? (
        <Typography
          variant="body2"
          color="text.main"
          sx={{ bgcolor: 'warning.light' }}
        >{`Försenad ${departure.delayedMinutes} min`}</Typography>
      ) : null}
      {departure.deviation ? (
        <Typography
          variant="body2"
          color="text.main"
          sx={{
            bgcolor: departure.deviation.type == DeviationType.Information ? null : 'warning.light'
          }}
        >
          {departure.deviation.text}
        </Typography>
      ) : null}
    </Stack>
  );
};

const uniqueLines = (departures: TransportDepartures | undefined): string[] => {
  let lines: string[] = [];

  if (!departures) {
    return lines;
  }

  departures.departures.forEach((d) => d.departures.forEach((d2) => lines.push(d2.lineNumber)));
  return lines
    .filter((value: string, index: number, array: string[]) => array.indexOf(value) === index)
    .sort();
};

type StationDeparturesProps = {
  departures: TransportDepartures | undefined;
  time: string;
  favorite: boolean;
  favoriteChanged: (name: string | undefined, favorite: boolean) => void;
  refreshRequested: () => void;
};

export default function StationDepartures({
  departures,
  time,
  favorite,
  favoriteChanged,
  refreshRequested
}: StationDeparturesProps) {
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>(uniqueLines(departures));
  const [isFavorite, setIsFavorite] = useState<boolean>(favorite);

  useEffect(() => {
    setSelectedLine(null);
    setLines(uniqueLines(departures));
  }, [departures]);

  const selectedDepartures = (stop: StopDepartures): Departure[] => {
    return stop.departures.filter((d) => (selectedLine ?? d.lineNumber) == d.lineNumber);
  };

  if (!departures) {
    return (
      <Box>
        <Typography variant="h4">Hittade inga avgångar</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between', mt: 1.5 }}>
        <Typography variant="h4">{departures.stationName}</Typography>
        <Checkbox
          checked={favorite}
          icon={<FavoriteBorder />}
          checkedIcon={<Favorite />}
          onChange={(event) => favoriteChanged(departures?.stationName, event.target.checked)}
        />
      </Stack>
      <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between' }}>
        <Box sx={{ fontSize: 20 }}>Avgångar efter {time.substring(0, 5)}</Box>
        <IconButton sx={{ color: '#555555' }} onClick={refreshRequested}>
          <Refresh />
        </IconButton>
      </Stack>
      <ButtonGroup sx={{ display: lines.length < 2 ? 'none' : 'inline-block', mt: 1 }}>
        {lines.map((line) => (
          <Button
            variant={line == selectedLine ? 'contained' : 'outlined'}
            key={line}
            onClick={() => {
              selectedLine == line ? setSelectedLine(null) : setSelectedLine(line);
            }}
            size="small"
          >
            {line}
          </Button>
        ))}
      </ButtonGroup>

      {departures.departures
        .filter((stop) => selectedDepartures(stop).length > 0)
        .map((stop) => (
          <Box key={stop.stopId} sx={{ mt: 2 }}>
            <Typography variant="h5">Till {stop.destinations.join(', ')}</Typography>
            <Divider sx={{ bgcolor: typeColor(departures.type) }} />
            <List dense={true}>
              {selectedDepartures(stop).map((dep) => (
                <ListItem
                  key={dep.lineNumber + dep.plannedTime}
                  divider={true}
                  disableGutters={true}
                  sx={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: 1,
                    mb: 1,
                    pl: 0.5
                  }}
                  secondaryAction={
                    <Typography variant="h5" sx={{ mr: 0.5 }}>
                      {dep.expectedTime}
                    </Typography>
                  }
                >
                  <ListItemIcon>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 90 }}>
                      <SvgIcon
                        component={typeIcon(departures.type)}
                        sx={{ color: typeColor(departures.type) }}
                      />
                      <Typography variant="h5" color="text.primary">
                        {dep.lineNumber}
                      </Typography>
                    </Stack>
                  </ListItemIcon>
                  <ListItemText
                    sx={{ ml: 1, mr: 2.5 }}
                    disableTypography={true}
                    primary={dep.destination}
                    secondary={secondaryItem(dep)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
    </Box>
  );
}
