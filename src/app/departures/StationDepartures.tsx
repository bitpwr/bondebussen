import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import { TransportDepartures, typeColor, typeIcon } from '@/lib/sl-types';

// const departureText = (time: string): string => {
//   if (time == 'Nu') {
//     return 'Avgår nu';
//   }
//   return `Avgår om ${time}`;
// };

const secondaryItem = (delay?: number) => {
  if (!delay) {
    return null;
  }

  return (
    <>
      {delay && delay > 0 ? (
        <Stack direction="row">
          <Typography
            variant="body2"
            color="text.main"
            sx={{ bgcolor: 'warning.light' }}
          >{`Försenad ${delay} min`}</Typography>
        </Stack>
      ) : null}
    </>
  );
};

type StationDeparturesProps = {
  departures: TransportDepartures | undefined;
  time: string;
};

export default function StationDepartures({ departures, time }: StationDeparturesProps) {
  if (!departures) {
    return (
      <Box>
        <Typography variant="h4">Hittade inga avgångar</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between', my: 2 }}>
        <Typography variant="h4">{departures.stationName}</Typography>
        <Typography variant="h4">{time.substring(0, 5)}</Typography>
      </Stack>
      {departures.departures.map((stop) => (
        <Box key={stop.stopId} sx={{ mt: 2 }}>
          <Typography variant="h5">Till {stop.destinations.join(', ')}</Typography>
          <Divider sx={{ bgcolor: typeColor(departures.type) }} />
          <List dense={true}>
            {stop.departures.map((dep) => (
              <ListItem
                key={dep.lineNumber + dep.plannedTime}
                divider={true}
                disableGutters={true}
                sx={{ backgroundColor: '#F5F5F5', borderRadius: 1, mb: 1, pl: 0.5 }}
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
                  sx={{ ml: 1, mr: 2 }}
                  disableTypography={true}
                  primary={dep.destination}
                  secondary={secondaryItem(dep.delayedMinutes)}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}
