import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useProjectStore } from '../../store/projectStore';
import { useCodeGenerationStore } from '../../store/codeGenerationStore';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const LANGUAGE_OPTIONS = [
  'Python',
  'JavaScript',
  'TypeScript',
  'Java',
  'C++',
  'Go',
  'Rust',
];

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [prompt, setPrompt] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createProject = useProjectStore((state) => state.createProject);
  const generateProjectStructure = useCodeGenerationStore(
    (state) => state.generateProjectStructure
  );

  const handleSubmit = async () => {
    if (!name || !language) {
      return;
    }

    setIsLoading(true);
    try {
      // Create the project first
      const project = await createProject({
        name,
        description,
        programming_language: language,
        git_repo_url: gitRepo,
      });

      // If there's a prompt, generate the project structure
      if (prompt && project) {
        await generateProjectStructure({
          projectId: project.id,
          prompt,
          language,
        });
      }

      onClose();
      // You might want to navigate to the project here
    } catch (error) {
      console.error('Error creating project:', error);
      // Handle error (show notification, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setLanguage('');
    setPrompt('');
    setGitRepo('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <FormControl fullWidth required>
            <InputLabel>Programming Language</InputLabel>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label="Programming Language"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <MenuItem key={lang} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Git Repository URL (Optional)"
            value={gitRepo}
            onChange={(e) => setGitRepo(e.target.value)}
            fullWidth
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Project Generation Prompt (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Describe your project and its features. Our AI will generate a
              project structure based on your description.
            </Typography>
            <TextField
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              multiline
              rows={4}
              fullWidth
              placeholder="Example: Create a web application for managing personal tasks with user authentication, task categories, due dates, and priority levels..."
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || !language || isLoading}
        >
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Creating...
            </>
          ) : (
            'Create Project'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
