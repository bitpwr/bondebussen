import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function HomePage() {
  return (
    <Box sx={{ display: 'flex' }}>
      <div>
        <Typography variant="h3" color="text.secondary">
          Bondebussen
        </Typography>
        <Typography variant="subtitle1">Catch your bus in time.</Typography>
      </div>
    </Box>
  );
}
