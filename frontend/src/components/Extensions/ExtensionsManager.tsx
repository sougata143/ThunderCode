import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExtensionOutlined,
  CloudDownload,
  Delete,
  Refresh,
} from '@mui/icons-material';

interface Extension {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  installed: boolean;
  icon?: string;
  downloads: number;
  rating: number;
}

const ExtensionsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [installedExtensions, setInstalledExtensions] = useState<Extension[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExtensions();
  }, []);

  const loadExtensions = async () => {
    setLoading(true);
    // TODO: Implement API call to fetch extensions
    const mockExtensions: Extension[] = [
      {
        id: '1',
        name: 'Python',
        description: 'Python language support',
        version: '1.0.0',
        author: 'Microsoft',
        installed: true,
        downloads: 1000000,
        rating: 4.8,
      },
      {
        id: '2',
        name: 'ESLint',
        description: 'JavaScript linting',
        version: '2.1.0',
        author: 'ESLint',
        installed: false,
        downloads: 500000,
        rating: 4.6,
      },
    ];
    setExtensions(mockExtensions);
    setInstalledExtensions(mockExtensions.filter(ext => ext.installed));
    setLoading(false);
  };

  const handleInstall = async (extension: Extension) => {
    // TODO: Implement extension installation
    setExtensions(prev =>
      prev.map(ext =>
        ext.id === extension.id ? { ...ext, installed: true } : ext
      )
    );
    setInstalledExtensions(prev => [...prev, { ...extension, installed: true }]);
  };

  const handleUninstall = async (extension: Extension) => {
    // TODO: Implement extension uninstallation
    setExtensions(prev =>
      prev.map(ext =>
        ext.id === extension.id ? { ...ext, installed: false } : ext
      )
    );
    setInstalledExtensions(prev =>
      prev.filter(ext => ext.id !== extension.id)
    );
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    // TODO: Implement extension search
  };

  const renderExtension = (extension: Extension) => (
    <ListItem
      key={extension.id}
      secondaryAction={
        extension.installed ? (
          <IconButton
            edge="end"
            color="error"
            onClick={() => handleUninstall(extension)}
          >
            <Delete />
          </IconButton>
        ) : (
          <IconButton
            edge="end"
            color="primary"
            onClick={() => handleInstall(extension)}
          >
            <CloudDownload />
          </IconButton>
        )
      }
    >
      <ListItemIcon>
        {extension.icon ? (
          <Avatar src={extension.icon} />
        ) : (
          <ExtensionOutlined />
        )}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {extension.name}
            <Chip
              label={extension.version}
              size="small"
              variant="outlined"
            />
            {extension.installed && (
              <Chip
                label="Installed"
                size="small"
                color="success"
                variant="outlined"
              />
            )}
          </Box>
        }
        secondary={
          <>
            <Typography variant="body2">{extension.description}</Typography>
            <Typography variant="caption" color="text.secondary">
              By {extension.author} • {extension.downloads.toLocaleString()} downloads • {extension.rating} ★
            </Typography>
          </>
        }
      />
    </ListItem>
  );

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Typography variant="h6" component="h2">
            Extensions
          </Typography>
          <IconButton size="small" onClick={loadExtensions}>
            <Refresh />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search extensions..."
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Installed ({installedExtensions.length})
          </Typography>
          <List>
            {installedExtensions.map(renderExtension)}
          </List>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Available
          </Typography>
          <List>
            {extensions
              .filter(ext => !ext.installed)
              .filter(ext =>
                ext.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ext.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(renderExtension)}
          </List>
        </Box>
      </Box>
    </Paper>
  );
};

export default ExtensionsManager;
