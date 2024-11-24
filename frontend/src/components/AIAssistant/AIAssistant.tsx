import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress } from '@mui/material';
import { generateCode } from '../../services/api';
import { useSnackbar } from 'notistack';

const AIAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
      });
      setGeneratedCode(code);
    } catch (error) {
      console.error('Error generating code:', error);
      enqueueSnackbar('Failed to generate code. Please try again.', { variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6" component="h2">
        AI Assistant
      </Typography>
      
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
        disabled={isLoading}
        sx={{ alignSelf: 'flex-start' }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Generate Code'}
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
  );
};

export default AIAssistant;
