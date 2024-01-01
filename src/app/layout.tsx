import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import DirectionsBus from '@mui/icons-material/DirectionsBus';
import ThemeRegistry from '@/theme/ThemeRegistry';
import { TransportType, typeColor } from '@/lib/sl-types';
import Footer from './Footer';

export const metadata = {
  title: 'Bondebussen',
  description: 'Missa inte bussen'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AppBar position="fixed" sx={{ zIndex: 2000 }}>
            <Toolbar sx={{ backgroundColor: 'background.paper' }}>
              <DirectionsBus sx={{ color: typeColor(TransportType.Bus), mr: 2 }} />
              <Typography
                variant="h5"
                color="text.secondary"
                fontWeight="regular"
                letterSpacing={4}
                component="a"
                href="/"
                sx={{ textDecoration: 'none' }}
              >
                Bondebussen
              </Typography>
            </Toolbar>
          </AppBar>
          <Container
            maxWidth="sm"
            sx={{
              flexGrow: 1,
              bgcolor: 'background.default',
              mt: ['48px', '64px'],
              p: 1
            }}
          >
            {children}
          </Container>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
