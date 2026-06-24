import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthenticator();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Toolbar>
          <FitnessCenterIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', fontWeight: 700 }}
          >
            Workout AI
          </Typography>

          <Button color="inherit" component={Link} to="/" sx={{ mr: 1 }}>
            Generate
          </Button>
          <Button color="inherit" component={Link} to="/history">
            History
          </Button>

          <IconButton
            color="inherit"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <AccountCircleIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem disabled>
              <Typography variant="body2" color="text.secondary">
                {user?.signInDetails?.loginId ?? 'Account'}
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                handleSignOut();
              }}
            >
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ maxWidth: 900, mx: 'auto', px: 2, py: 4 }}>
        {children}
      </Box>
    </Box>
  );
}
