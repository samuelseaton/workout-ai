import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { Box, Typography } from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import { Navigate } from 'react-router-dom';

export default function LoginPage() {
  const { authStatus } = useAuthenticator();

  if (authStatus === 'authenticated') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        px: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <FitnessCenterIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Workout AI
        </Typography>
      </Box>

      <Authenticator hideSignUp />
    </Box>
  );
}
