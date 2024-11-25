import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  FormControlLabel,
  Switch,
  Tooltip,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { generateCode } from '../../services/api';
import { useSnackbar } from 'notistack';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useLocalLLM, setUseLocalLLM] = useState(true);
  const { enqueueSnackbar } = useSnackbar();

  const handleGenerateCode = async () => {
    if (!prompt.trim()) {
      enqueueSnackbar('Please enter a prompt', { variant: 'warning' });
      return;
    }

    setIsLoading(true);
    try {
      const code = await generateCode({
        prompt,
        temperature: 0.7,
        topP: 0.95,
        maxLength: 2048,
        useLocalLLM,
      });
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      enqueueSnackbar('Failed to generate code. Please try again.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    enqueueSnackbar('Code copied to clipboard', { variant: 'success' });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          AI Assistant
        </Typography>
        <Tooltip title="Use local LLM for code generation">
          <FormControlLabel
            control={
              <Switch
                checked={useLocalLLM}
                onChange={(e) => setUseLocalLLM(e.target.checked)}
                color="primary"
              />
            }
            label="Local LLM"
          />
        </Tooltip>
      </Box>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        label="Enter your prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the code you want to generate..."
      />
      
      <Button
        variant="contained"
        onClick={handleGenerateCode}
        disabled={isLoading || !prompt.trim()}
        sx={{ alignSelf: 'flex-start' }}
      >
        {isLoading ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            Generating...
          </>
        ) : (
          'Generate Code'
        )}
      </Button>

      {generatedCode && (
        <Paper
          variant="outlined"
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            backgroundColor: 'grey.900',
            position: 'relative',
          }}
        >
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Tooltip title="Copy code">
              <IconButton onClick={handleCopyCode} size="small" sx={{ color: 'grey.300' }}>
                <ContentCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            component="pre"
            sx={{
              margin: 0,
              padding: 2,
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '14px',
              color: 'grey.100',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {generatedCode}
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AIAssistant;
