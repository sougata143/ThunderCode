import { Box } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Editor from './components/Editor/Editor';
import AIAssistant from './components/AIAssistant/AIAssistant';
import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { SnackbarProvider } from 'notistack';

function App() {
  const { loadProfile, isAuthenticated } = useAuthStore();
  const [code, setCode] = useState('// Start coding here...');
  
  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, loadProfile]);

  return (
    <SnackbarProvider maxSnack={3}>
      <Router>
        <MainLayout>
          <Box sx={{ display: 'flex', height: '100%', gap: 2, p: 2 }}>
            <Box sx={{ flexGrow: 1, height: '100%' }}>
              <Editor
                value={code}
                onChange={(value) => setCode(value || '')}
                language="javascript"
              />
            </Box>
            <Box sx={{ width: '100%', height: '100%' }}>
              <AIAssistant />
            </Box>
          </Box>
        </MainLayout>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
