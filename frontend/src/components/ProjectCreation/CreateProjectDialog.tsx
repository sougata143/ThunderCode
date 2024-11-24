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

const AI_MODEL_OPTIONS = [
  { value: 'gpt-4', label: 'GPT-4 (Most Capable)', description: 'Best for complex projects and advanced code generation' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and cost-effective for simpler projects' },
  { value: 'codellama-34b', label: 'CodeLlama 34B', description: 'Specialized in code generation and completion' },
  { value: 'anthropic-claude-2', label: 'Claude 2', description: 'Advanced reasoning and code understanding' },
  { value: 'qwen-72b', label: 'Qwen 72B', description: 'Multilingual code generation with strong performance in Asian languages' },
];

export const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  open,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [aiModel, setAIModel] = useState('gpt-4');
  const [prompt, setPrompt] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const createProject = useProjectStore((state) => state.createProject);
  const generateProjectStructure = useCodeGenerationStore(
    (state) => state.generateProjectStructure
  );

  const handleSubmit = async () => {
    if (!name || !description || !language) {
      return;
    }

    setIsLoading(true);
    try {
      const projectStructure = await generateProjectStructure({
        name,
        description,
        language,
        aiModel,
        prompt,
      });

      await createProject({
        name,
        description,
        language,
        gitRepo,
        files: projectStructure.files,
        dependencies: projectStructure.dependencies,
        setupInstructions: projectStructure.setupInstructions,
      });

      onClose();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setLanguage('');
    setAIModel('gpt-4');
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
          />
          
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            required
          />

          <FormControl required>
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

          <FormControl>
            <InputLabel>AI Model</InputLabel>
            <Select
              value={aiModel}
              onChange={(e) => setAIModel(e.target.value)}
              label="AI Model"
            >
              {AI_MODEL_OPTIONS.map((model) => (
                <MenuItem key={model.value} value={model.value}>
                  <Box>
                    <Typography variant="subtitle1">{model.label}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {model.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Additional Instructions (Optional)"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            multiline
            rows={3}
            placeholder="Add any specific requirements or preferences for your project structure..."
          />

          <TextField
            label="Git Repository URL (Optional)"
            value={gitRepo}
            onChange={(e) => setGitRepo(e.target.value)}
            placeholder="https://github.com/username/repository"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !name || !description || !language}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
