import React, { useState } from 'react';
import {
  Box,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Paper,
  IconButton,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  InsertDriveFileOutlined,
  FilterList,
} from '@mui/icons-material';
import { useProjectStore } from '../../store/projectStore';

interface SearchResult {
  file: string;
  line: number;
  content: string;
  matchStart: number;
  matchEnd: number;
}

const CodeSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [filters, setFilters] = useState({
    fileTypes: [] as string[],
    caseSensitive: false,
    regex: false,
  });
  const { currentProject, searchInProject } = useProjectStore();

  const handleSearch = async () => {
    if (!searchTerm || !currentProject) return;

    const searchResults = await searchInProject(
      currentProject.id,
      searchTerm,
      filters
    );
    setResults(searchResults);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderHighlightedText = (text: string, start: number, end: number) => {
    return (
      <>
        {text.substring(0, start)}
        <Box component="span" sx={{ backgroundColor: 'warning.light' }}>
          {text.substring(start, end)}
        </Box>
        {text.substring(end)}
      </>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search in files..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small">
                  <FilterList />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
          <Chip
            label={filters.caseSensitive ? 'Case Sensitive' : 'Case Insensitive'}
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                caseSensitive: !prev.caseSensitive,
              }))
            }
            variant={filters.caseSensitive ? 'filled' : 'outlined'}
            size="small"
          />
          <Chip
            label={filters.regex ? 'Regex' : 'Text'}
            onClick={() =>
              setFilters(prev => ({
                ...prev,
                regex: !prev.regex,
              }))
            }
            variant={filters.regex ? 'filled' : 'outlined'}
            size="small"
          />
        </Box>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {!currentProject ? (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              No project selected
            </Typography>
          </Box>
        ) : results.length === 0 ? (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? 'No results found'
                : 'Enter a search term to find in files'}
            </Typography>
          </Box>
        ) : (
          <List dense>
            {results.map((result, index) => (
              <ListItem key={`${result.file}-${result.line}-${index}`}>
                <ListItemIcon>
                  <InsertDriveFileOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={`${result.file}:${result.line}`}
                  secondary={renderHighlightedText(
                    result.content,
                    result.matchStart,
                    result.matchEnd
                  )}
                  secondaryTypographyProps={{
                    component: 'div',
                    sx: { fontFamily: 'monospace' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default CodeSearch;
