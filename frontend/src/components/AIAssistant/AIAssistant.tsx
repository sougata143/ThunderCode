import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Alert,
} from '@mui/material';
import { Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAIStore } from '../../store/aiStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useState } from 'react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIAssistant = () => {
  const theme = useTheme();
  const settings = useSettingsStore();
  const {
    messages,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
    clearMessages,
  } = useAIStore();
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    addMessage({
      id: messages.length,
      role: 'user',
      content: input,
      timestamp: new Date(),
    });

    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      
      addMessage({
        id: messages.length + 1,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!settings.aiSuggestions) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Typography color="text.secondary">
          AI suggestions are currently disabled
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">AI Assistant</Typography>
        <IconButton
          onClick={clearMessages}
          disabled={messages.length === 0}
          color="inherit"
        >
          <DeleteIcon />
        </IconButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <ListItem
            key={message.id}
            sx={{
              flexDirection: 'column',
              alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 2,
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '80%',
                backgroundColor:
                  message.role === 'user'
                    ? theme.palette.primary.main
                    : theme.palette.background.paper,
              }}
            >
              <ListItemText
                primary={message.content}
                secondary={message.timestamp.toLocaleTimeString()}
              />
            </Paper>
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <IconButton
            color="primary"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistant;
