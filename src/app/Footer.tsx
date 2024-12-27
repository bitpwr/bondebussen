'use client';

import { Box, Link, Stack, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? theme.palette.grey[50] : theme.palette.grey[800],
        p: 6
      }}
    >
      <Stack direction="column" spacing={2}>
        <Typography variant="body1" color="text.secondary" align="center">
          <Link color="inherit" href="/about">
            Om
          </Link>{' '}
          Bondebussen.
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {'Presenteras av '}
          <Link color="inherit" href="https://hsolutions.se">
            {'Holtmo Solutions'}
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
      </Stack>
    </Box>
  );
}
