import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Box,
  useTheme,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  LightMode,
  DarkMode,
  GitHub,
  Settings,
  AccountCircle,
  ExitToApp,
  Chat,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';

interface TopBarProps {
  onChatToggle: () => void;
}

const TopBar = ({ onChatToggle }: TopBarProps) => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { user, logout } = useAuthStore();

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

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

          <IconButton
            color="inherit"
            onClick={onChatToggle}
            sx={{ mr: 2 }}
          >
            <Chat />
          </IconButton>

          <IconButton
            onClick={handleMenu}
            color="inherit"
            sx={{ ml: 1 }}
          >
            {user?.avatar ? (
              <Avatar src={user.avatar} alt={user.username} sx={{ width: 32, height: 32 }} />
            ) : (
              <AccountCircle />
            )}
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>
              <Typography variant="body1">
                {user?.username}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleClose}>
              <Settings fontSize="small" sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp fontSize="small" sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
