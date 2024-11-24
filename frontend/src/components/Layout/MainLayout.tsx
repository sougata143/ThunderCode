import { Box, CssBaseline, ThemeProvider, Drawer } from '@mui/material';
import { theme } from '../../theme/theme';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ReactNode, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import LoginDialog from '../Auth/LoginDialog';
import { ChatWindow } from '../Chat/ChatWindow';

interface MainLayoutProps {
  children: ReactNode;
}

const CHAT_DRAWER_WIDTH = 400;

const MainLayout = ({ children }: MainLayoutProps) => {
  const { isAuthenticated } = useAuthStore();
  const [chatOpen, setChatOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginDialog />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <TopBar onChatToggle={() => setChatOpen(prev => !prev)} />
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',
            pt: '64px', // Height of TopBar
          }}
        >
          {children}
        </Box>
        <Drawer
          variant="persistent"
          anchor="right"
          open={chatOpen}
          sx={{
            width: CHAT_DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: CHAT_DRAWER_WIDTH,
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100vh - 64px)',
            },
          }}
        >
          <ChatWindow />
        </Drawer>
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
