import { Box } from '@mui/material';
import { BrowserRouter as Router } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import Editor from './components/Editor/Editor';
import AIAssistant from './components/AIAssistant/AIAssistant';
import { useState } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [code, setCode] = useState('// Start coding here...');

  return (
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
          <Box sx={{ width: '400px', height: '100%' }}>
            <AIAssistant />
          </Box>
        </Box>
      </MainLayout>
    </Router>
  );
}

export default App;
