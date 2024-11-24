import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Switch,
  Typography,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  Code,
  Storage,
  Terminal,
  Notifications,
  Security,
  Language,
} from '@mui/icons-material';
import { useThemeStore } from '../../stores/themeStore';

interface SettingsOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  type: 'switch' | 'select';
  value?: boolean | string;
  options?: { value: string; label: string }[];
  onChange: (value: any) => void;
}

const Settings: React.FC = () => {
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useThemeStore();
  const [autoSave, setAutoSave] = useState(true);
  const [defaultLanguage, setDefaultLanguage] = useState('typescript');
  const [terminalFont, setTerminalFont] = useState('monospace');
  const [notifications, setNotifications] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const settingsOptions: SettingsOption[] = [
    {
      id: 'theme',
      title: 'Dark Mode',
      icon: isDarkMode ? <DarkMode /> : <LightMode />,
      type: 'switch',
      value: isDarkMode,
      onChange: toggleTheme,
    },
    {
      id: 'language',
      title: 'Default Language',
      icon: <Code />,
      type: 'select',
      value: defaultLanguage,
      options: [
        { value: 'typescript', label: 'TypeScript' },
        { value: 'javascript', label: 'JavaScript' },
        { value: 'python', label: 'Python' },
        { value: 'java', label: 'Java' },
        { value: 'go', label: 'Go' },
      ],
      onChange: setDefaultLanguage,
    },
    {
      id: 'autosave',
      title: 'Auto Save',
      icon: <Storage />,
      type: 'switch',
      value: autoSave,
      onChange: setAutoSave,
    },
    {
      id: 'terminal',
      title: 'Terminal Font',
      icon: <Terminal />,
      type: 'select',
      value: terminalFont,
      options: [
        { value: 'monospace', label: 'Monospace' },
        { value: 'fira-code', label: 'Fira Code' },
        { value: 'source-code-pro', label: 'Source Code Pro' },
        { value: 'jetbrains-mono', label: 'JetBrains Mono' },
      ],
      onChange: setTerminalFont,
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Notifications />,
      type: 'switch',
      value: notifications,
      onChange: setNotifications,
    },
    {
      id: '2fa',
      title: 'Two-Factor Auth',
      icon: <Security />,
      type: 'switch',
      value: twoFactorAuth,
      onChange: setTwoFactorAuth,
    },
  ];

  const renderSettingControl = (option: SettingsOption) => {
    if (option.type === 'switch') {
      return (
        <Switch
          checked={option.value as boolean}
          onChange={(e) => option.onChange(e.target.checked)}
          color="primary"
        />
      );
    }

    if (option.type === 'select') {
      return (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={option.value}
            onChange={(e) => option.onChange(e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                py: 1,
              },
            }}
          >
            {option.options?.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      );
    }
  };

  return (
    <Box
      sx={{
        height: '100%',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Typography variant="h6" color="primary">
          Settings
        </Typography>
      </Box>
      <List sx={{ p: 2 }}>
        {settingsOptions.map((option, index) => (
          <React.Fragment key={option.id}>
            <ListItem
              disablePadding
              sx={{
                mb: 1,
                backgroundColor: theme.palette.background.paper,
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              <ListItemButton>
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                  {option.icon}
                </ListItemIcon>
                <ListItemText
                  primary={option.title}
                  sx={{ mr: 2 }}
                />
                {renderSettingControl(option)}
              </ListItemButton>
            </ListItem>
            {index < settingsOptions.length - 1 && (
              <Divider sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Settings;
