import { getDepartures } from '@/lib/sl-departures';
import {
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography
} from '@mui/material';
import Box from '@mui/material/Box';
import DirectionsBus from '@mui/icons-material/DirectionsBus';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const departures = await getDepartures(5812, (msg) => {
    console.log(`PAGE GOT ERROR: ${msg}`);
  });

  if (!departures) {
    return <Typography variant="h4">Error</Typography>;
  }

  const departureText = (time: string): string => {
    if (time == 'Nu') {
      return 'Avgår nu';
    }
    return `Avgår om ${time}`;
  };

  const secondaryItem = (display?: string, delay?: number) => {
    if (!display && !delay) {
      return null;
    }

    return (
      <Stack direction="column">
        {display ? (
          <Typography variant="body2" color="text.secondary">
            {departureText(display)}
          </Typography>
        ) : null}
        {delay && delay > 0 ? (
          <Typography variant="body2" color="text.secondary">{`Försenad ${delay} min`}</Typography>
        ) : null}
      </Stack>
    );
  };

  return (
    <Box>
      <div>
        <Stack direction="row" sx={{ width: '100%', justifyContent: 'space-between', my: 2 }}>
          <Typography variant="h4">{departures.busStation}</Typography>
          <Typography variant="h4">{departures.checkTime.substring(0, 5)}</Typography>
        </Stack>
        {departures.busStops.map((stop) => (
          <Box key={stop.stopId}>
            <Typography variant="h5">{stop.destinations.join(', ')}</Typography>
            <Divider sx={{ bgcolor: '#F44' }} />
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
                      <DirectionsBus sx={{ color: '#F44' }} />
                      <Typography variant="h5" color="text.primary">
                        {dep.lineNumber}
                      </Typography>
                    </Stack>
                  </ListItemIcon>
                  <ListItemText
                    sx={{ ml: 1 }}
                    disableTypography={true}
                    primary={dep.destination}
                    secondary={secondaryItem(dep.display, dep.delayedMinutes)}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ))}
      </div>
    </Box>
  );
}
