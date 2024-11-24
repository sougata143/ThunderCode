import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useLLMStore } from '../../stores/llmStore';
import LocalLLMManager from './LocalLLMManager';
import { useSnackbar } from 'notistack';
import { generateCode } from '../../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`llm-tabpanel-${index}`}
      aria-labelledby={`llm-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LocalLLM: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { activeModelId, models } = useLLMStore();
  const { enqueueSnackbar } = useSnackbar();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleGenerateCode = async () => {
    if (!activeModelId) {
      enqueueSnackbar('Please select a model first', { variant: 'warning' });
      return;
    }

    if (!prompt.trim()) {
      enqueueSnackbar('Please enter a prompt', { variant: 'warning' });
      return;
    }

    setIsGenerating(true);
    try {
      const code = await generateCode({
        prompt,
        maxLength: 2048,
        temperature: 0.7,
        topP: 0.95,
      });
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      enqueueSnackbar('Failed to generate code. Please try again.', {
        variant: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const activeModel = models.find((m) => m.id === activeModelId);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Generate Code" />
          <Tab label="Manage Models" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          {activeModel ? (
            <Alert severity="info">
              Using model: {activeModel.name}
            </Alert>
          ) : (
            <Alert severity="warning">
              No model selected. Please select a model from the "Manage Models" tab.
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the code you want to generate..."
          />

          <Button
            variant="contained"
            onClick={handleGenerateCode}
            disabled={isGenerating || !activeModelId}
            sx={{ alignSelf: 'flex-start' }}
          >
            {isGenerating ? <CircularProgress size={24} /> : 'Generate Code'}
          </Button>

          {generatedCode && (
            <Paper
              variant="outlined"
              sx={{
                flex: 1,
                p: 2,
                overflow: 'auto',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
              }}
            >
              <Typography
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  m: 0,
                }}
              >
                {generatedCode}
              </Typography>
            </Paper>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <LocalLLMManager />
      </TabPanel>
    </Box>
  );
};

export default LocalLLM;
