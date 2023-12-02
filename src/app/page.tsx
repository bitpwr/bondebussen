import { Button, Typography } from '@mui/material';
import Box from '@mui/material/Box';

export const dynamic = 'force-dynamic';

export default async function Home() {
  return (
    <Box>
      <Typography variant="subtitle1">
        Bondebussen hjälper dig att hinna med din transport med SL.
      </Typography>
      <Typography variant="body1">
        Lägg till dina favorithållplatser och följ dina avgångar.
      </Typography>
      <Button variant="contained" disableElevation href="/departures">
        Avgångar
      </Button>
      <Typography variant="body1">Här visas aktuell trafikinformation.</Typography>
    </Box>
  );
}
