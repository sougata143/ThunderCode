import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Commit as CommitIcon,
  Refresh as RefreshIcon,
  ArrowUpward as PushIcon,
  ArrowDownward as PullIcon,
  AccountTree as BranchIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { GitFile, GitStatus } from '../../types/git';

interface CommitDialogProps {
  open: boolean;
  onClose: () => void;
  onCommit: (message: string) => void;
}

const CommitDialog: React.FC<CommitDialogProps> = ({ open, onClose, onCommit }) => {
  const [message, setMessage] = useState('');

  const handleCommit = () => {
    if (message.trim()) {
      onCommit(message);
      setMessage('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Commit Changes</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Commit Message"
          fullWidth
          multiline
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCommit} variant="contained" color="primary">
          Commit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SourceControl = () => {
  const { currentProject } = useProjectStore();
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [commitDialogOpen, setCommitDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGitStatus = async () => {
    if (!currentProject) return;
    
    setLoading(true);
    setError(null);
    try {
      const status = await useProjectStore.getState().getGitStatus(currentProject.id);
      setGitStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch git status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitStatus();
  }, [currentProject]);

  const handleStage = async (file: GitFile) => {
    if (!currentProject) return;
    
    try {
      await useProjectStore.getState().stageFile(currentProject.id, file.path);
      fetchGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stage file');
    }
  };

  const handleUnstage = async (file: GitFile) => {
    if (!currentProject) return;
    
    try {
      await useProjectStore.getState().unstageFile(currentProject.id, file.path);
      fetchGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unstage file');
    }
  };

  const handleCommit = async (message: string) => {
    if (!currentProject) return;
    
    try {
      await useProjectStore.getState().commitChanges(currentProject.id, message);
      fetchGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit changes');
    }
  };

  const handlePush = async () => {
    if (!currentProject) return;
    
    try {
      await useProjectStore.getState().pushChanges(currentProject.id);
      fetchGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to push changes');
    }
  };

  const handlePull = async () => {
    if (!currentProject) return;
    
    try {
      await useProjectStore.getState().pullChanges(currentProject.id);
      fetchGitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pull changes');
    }
  };

  if (!currentProject) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>No project selected</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Source Control</Typography>
        <Box>
          <IconButton onClick={fetchGitStatus} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Branch Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <BranchIcon />
        <Typography>{gitStatus?.branch || 'No branch'}</Typography>
        {gitStatus && (
          <Typography variant="body2" color="text.secondary">
            {gitStatus.ahead > 0 && `↑${gitStatus.ahead}`}
            {gitStatus.behind > 0 && `↓${gitStatus.behind}`}
          </Typography>
        )}
      </Box>

      <Divider />

      {/* Changes */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* Staged Changes */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Staged Changes
          </Typography>
          <List dense>
            {gitStatus?.staged.map((file) => (
              <ListItem
                key={file.path}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleUnstage(file)}>
                    <RemoveIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={file.path}
                  secondary={file.status}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Changes */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Changes
          </Typography>
          <List dense>
            {gitStatus?.unstaged.map((file) => (
              <ListItem
                key={file.path}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleStage(file)}>
                    <AddIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={file.path}
                  secondary={file.status}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<CommitIcon />}
          onClick={() => setCommitDialogOpen(true)}
          disabled={!gitStatus?.staged.length}
        >
          Commit
        </Button>
        <Button
          variant="outlined"
          startIcon={<PushIcon />}
          onClick={handlePush}
          disabled={!gitStatus?.ahead}
        >
          Push
        </Button>
        <Button
          variant="outlined"
          startIcon={<PullIcon />}
          onClick={handlePull}
          disabled={!gitStatus?.behind}
        >
          Pull
        </Button>
      </Box>

      {/* Commit Dialog */}
      <CommitDialog
        open={commitDialogOpen}
        onClose={() => setCommitDialogOpen(false)}
        onCommit={handleCommit}
      />
    </Box>
  );
};

export default SourceControl;
