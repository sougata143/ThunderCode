import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '../../theme/theme';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <TopBar />
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
      </Box>
    </ThemeProvider>
  );
};

export default MainLayout;
