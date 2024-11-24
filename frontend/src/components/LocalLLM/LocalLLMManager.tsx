import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useLLMStore, LLMModel } from '../../stores/llmStore';
import { useSnackbar } from 'notistack';

const ModelCard: React.FC<{
  model: LLMModel;
  onDownload: (modelId: string) => void;
  onDelete: (modelId: string) => void;
  onSelect: (modelId: string) => void;
  isActive: boolean;
}> = ({ model, onDownload, onDelete, onSelect, isActive }) => {
  const getStatusColor = () => {
    switch (model.status) {
      case 'downloaded':
        return 'success.main';
      case 'downloading':
        return 'primary.main';
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        border: (theme) =>
          isActive ? `2px solid ${theme.palette.primary.main}` : undefined,
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {model.name}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Size: {model.size}
        </Typography>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant="body2"
            sx={{ color: getStatusColor(), flexGrow: 1 }}
          >
            Status: {model.status.replace('_', ' ')}
          </Typography>
          {model.status === 'downloading' && (
            <Box sx={{ width: '100%', mt: 1 }}>
              <LinearProgress
                variant="determinate"
                value={model.downloadProgress || 0}
              />
            </Box>
          )}
        </Box>
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          {model.status === 'not_downloaded' && (
            <Button
              startIcon={<DownloadIcon />}
              variant="contained"
              onClick={() => onDownload(model.id)}
              size="small"
            >
              Download
            </Button>
          )}
          {model.status === 'downloaded' && (
            <>
              <Button
                variant="contained"
                onClick={() => onSelect(model.id)}
                size="small"
                color={isActive ? 'success' : 'primary'}
              >
                {isActive ? 'Active' : 'Use Model'}
              </Button>
              <IconButton
                size="small"
                color="error"
                onClick={() => onDelete(model.id)}
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
          {model.status === 'error' && (
            <Tooltip title={model.error}>
              <IconButton size="small" color="error">
                <ErrorIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const LocalLLMManager: React.FC = () => {
  const { models, activeModelId, updateModel, setActiveModel } = useLLMStore();
  const { enqueueSnackbar } = useSnackbar();

  const handleDownload = async (modelId: string) => {
    try {
      // Update model status to downloading
      updateModel(modelId, { status: 'downloading', downloadProgress: 0 });

      // Simulate download progress
      const interval = setInterval(() => {
        updateModel(modelId, (prevModel: LLMModel) => ({
          downloadProgress: Math.min(
            ((prevModel.downloadProgress || 0) + 10),
            100
          ),
        }));
      }, 1000);

      // Simulate download completion after 10 seconds
      setTimeout(() => {
        clearInterval(interval);
        updateModel(modelId, {
          status: 'downloaded',
          downloadProgress: 100,
        });
        enqueueSnackbar('Model downloaded successfully', { variant: 'success' });
      }, 10000);
    } catch (error) {
      updateModel(modelId, {
        status: 'error',
        error: 'Failed to download model',
      });
      enqueueSnackbar('Failed to download model', { variant: 'error' });
    }
  };

  const handleDelete = (modelId: string) => {
    if (activeModelId === modelId) {
      setActiveModel(null);
    }
    updateModel(modelId, { status: 'not_downloaded', downloadProgress: 0 });
    enqueueSnackbar('Model deleted successfully', { variant: 'success' });
  };

  const handleSelect = (modelId: string) => {
    setActiveModel(modelId);
    enqueueSnackbar('Model activated successfully', { variant: 'success' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Local LLM Models
      </Typography>
      <Typography color="text.secondary" paragraph>
        Download and manage local LLM models for offline code generation
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {models.map((model) => (
          <Grid item xs={12} sm={6} md={4} key={model.id}>
            <ModelCard
              model={model}
              onDownload={handleDownload}
              onDelete={handleDelete}
              onSelect={handleSelect}
              isActive={model.id === activeModelId}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default LocalLLMManager;
