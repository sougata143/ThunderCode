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
  Snackbar,
  Alert,
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
  const [language, setLanguage] = useState<string>('');
  const [aiModel, setAIModel] = useState('gpt-4');
  const [prompt, setPrompt] = useState('');
  const [gitRepo, setGitRepo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProject = useProjectStore((state) => state.createProject);
  const generateProjectStructure = useCodeGenerationStore(
    (state) => state.generateProjectStructure
  );

  const handleSubmit = async () => {
    if (!name || !description || !language) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const projectStructure = await generateProjectStructure({
        prompt: `Create a ${language} project named "${name}" with the following description: ${description}. ${prompt}`,
        language,
        aiModel,
        projectId: 0
      });

      await createProject({
        name,
        description,
        programming_language: language,
        git_repo_url: gitRepo,
        files: projectStructure.files,
        dependencies: Object.entries(projectStructure.dependencies).map(([key, value]) => ({ 
          name: key, 
          version: value 
        })),
        setup_instructions: projectStructure.setup_instructions,
        version: `0.1.0-${new Date().toISOString().split('T')[0]}`,
      });

      handleClose();
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
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
    setError(null);
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
              onChange={(e) => setLanguage(Array.isArray(e.target.value) ? e.target.value[0] : e.target.value)}
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

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};
