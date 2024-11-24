import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LightMode,
  DarkMode,
  GitHub,
  Settings,
} from '@mui/icons-material';
import { useState } from 'react';

const TopBar = () => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          ThunderCode IDE
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            color="inherit"
            startIcon={<GitHub />}
            onClick={() => window.open('https://github.com', '_blank')}
          >
            GitHub
          </Button>
          
          <IconButton
            color="inherit"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
          
          <IconButton color="inherit">
            <Settings />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
