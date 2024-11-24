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
import { sendChatMessage } from '../../services/aiService';

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

    const userMessage = {
      role: 'user' as const,
      content: input,
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const { response } = await sendChatMessage(input);
      
      addMessage({
        role: 'assistant',
        content: response,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '800px', mx: 'auto' }}>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        <List sx={{ width: '100%' }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
                width: '100%',
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  width: '95%',
                  bgcolor:
                    message.role === 'user'
                      ? theme.palette.primary.main
                      : theme.palette.background.paper,
                  color:
                    message.role === 'user'
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  '& pre': {
                    maxWidth: '100%',
                    overflow: 'auto',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: theme.palette.action.hover,
                  },
                  '& code': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {message.content}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', mt: 1, opacity: 0.7 }}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </ListItem>
          ))}
        </List>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, maxWidth: '100%' }}>
          {messages.length > 0 && (
            <IconButton
              onClick={clearMessages}
              color="default"
              sx={{ alignSelf: 'flex-end' }}
            >
              <DeleteIcon />
            </IconButton>
          )}
          <TextField
            fullWidth
            multiline
            maxRows={4}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about coding..."
            disabled={isLoading}
            sx={{
              flexGrow: 1,
              '& .MuiInputBase-root': {
                backgroundColor: theme.palette.background.default,
              }
            }}
          />
          <IconButton
            onClick={handleSend}
            color="primary"
            disabled={!input.trim() || isLoading}
            sx={{ alignSelf: 'flex-end' }}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AIAssistant;
