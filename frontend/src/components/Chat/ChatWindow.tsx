import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, Typography, CircularProgress, Alert, AlertTitle } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { chatService, ChatMessage } from '../../services/ChatService';

export const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(userMessage);
      setMessages(prev => [...prev, response]);
      setConfigError(null);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to send message';
      if (error.response?.status === 503) {
        setConfigError(error.response.data.error || 'Service temporarily unavailable');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, p: 2, overflow: 'auto' }}>
        {configError && (
          <Alert 
            severity="warning" 
            sx={{ mb: 2 }}
            onClose={() => setConfigError(null)}
          >
            <AlertTitle>Configuration Error</AlertTitle>
            {configError}
          </Alert>
        )}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {messages.map((msg, index) => (
          <Box key={index} sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              You:
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {msg.message}
            </Typography>
            {msg.response && (
              <>
                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Assistant:
                </Typography>
                <Typography variant="body1">
                  {msg.response}
                </Typography>
              </>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={configError ? 'Chat is currently unavailable' : 'Type your message...'}
            disabled={loading || !!configError}
            sx={{ mr: 1 }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend}
            disabled={loading || !input.trim() || !!configError}
          >
            {loading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};
