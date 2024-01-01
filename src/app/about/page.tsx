import { Box, Link, Stack, Typography } from '@mui/material';

export default function About() {
  return (
    <Box sx={{ my: 5 }}>
      <Stack spacing={4}>
        <Typography variant="body1">
          Bondebussen är att ett snabbt och smidigt sätt hitta aktuella avgångstider från sin
          favorithållplats i Stockholm. Inga onödiga inställningar och eventuella förseningar
          framgår tydligt.
        </Typography>

        <Typography variant="body1">
          Idén till bondebussen började vid Bondevägen i Järfälla, därav namnet, men man kan söka
          efter alla hållplatser som trafikeras av <Link href="https://sl.se">SL</Link>.
        </Typography>

        <Typography variant="body1">
          Kommentarer och förslag till förbättringar får ni gärna skicka till{' '}
          <Link href="mailto:bondebussen@gmail.com?Subject=Feedback">bondebussen@gmail.com</Link>.
        </Typography>
      </Stack>
    </Box>
  );
}
