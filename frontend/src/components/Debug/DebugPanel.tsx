import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  TextField,
  Collapse,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Pause,
  SkipNext,
  BugReport,
  RestartAlt,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { useProjectStore } from '../../store/projectStore';

interface DebugVariable {
  name: string;
  value: string;
  type: string;
}

interface DebugBreakpoint {
  file: string;
  line: number;
  enabled: boolean;
}

interface DebugCallStack {
  name: string;
  file: string;
  line: number;
}

const DebugPanel = () => {
  const [debugState, setDebugState] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [variables, setVariables] = useState<DebugVariable[]>([]);
  const [breakpoints, setBreakpoints] = useState<DebugBreakpoint[]>([]);
  const [callStack, setCallStack] = useState<DebugCallStack[]>([]);
  const [watchExpressions, setWatchExpressions] = useState<string[]>([]);
  const [newWatch, setNewWatch] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    variables: true,
    breakpoints: true,
    callStack: true,
    watch: true,
  });

  const { currentProject } = useProjectStore();

  const handleStartDebug = () => {
    setDebugState('running');
    // TODO: Implement debug start
  };

  const handleStopDebug = () => {
    setDebugState('stopped');
    // TODO: Implement debug stop
  };

  const handlePauseDebug = () => {
    setDebugState('paused');
    // TODO: Implement debug pause
  };

  const handleStepOver = () => {
    // TODO: Implement step over
  };

  const handleRestart = () => {
    // TODO: Implement debug restart
  };

  const handleAddWatch = () => {
    if (newWatch.trim()) {
      setWatchExpressions(prev => [...prev, newWatch.trim()]);
      setNewWatch('');
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderSectionHeader = (
    title: string,
    section: keyof typeof expandedSections,
    count?: number
  ) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 1,
        cursor: 'pointer',
        '&:hover': { backgroundColor: 'action.hover' },
      }}
      onClick={() => toggleSection(section)}
    >
      {expandedSections[section] ? <ExpandMore /> : <ChevronRight />}
      <Typography variant="subtitle2">
        {title} {count !== undefined && `(${count})`}
      </Typography>
    </Box>
  );

  if (!currentProject) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          No project selected
        </Typography>
      </Box>
    );
  }

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
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {debugState === 'stopped' ? (
          <IconButton color="primary" onClick={handleStartDebug}>
            <PlayArrow />
          </IconButton>
        ) : (
          <>
            <IconButton color="error" onClick={handleStopDebug}>
              <Stop />
            </IconButton>
            <IconButton
              onClick={debugState === 'running' ? handlePauseDebug : handleStartDebug}
            >
              {debugState === 'running' ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton onClick={handleStepOver}>
              <SkipNext />
            </IconButton>
            <IconButton onClick={handleRestart}>
              <RestartAlt />
            </IconButton>
          </>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Variables Section */}
        <Box>
          {renderSectionHeader('Variables', 'variables', variables.length)}
          <Collapse in={expandedSections.variables}>
            <List dense>
              {variables.map((variable, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={variable.name}
                    secondary={`${variable.value} (${variable.type})`}
                  />
                </ListItem>
              ))}
              {variables.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="No variables to display"
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        </Box>

        <Divider />

        {/* Breakpoints Section */}
        <Box>
          {renderSectionHeader('Breakpoints', 'breakpoints', breakpoints.length)}
          <Collapse in={expandedSections.breakpoints}>
            <List dense>
              {breakpoints.map((breakpoint, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <BugReport color={breakpoint.enabled ? 'error' : 'disabled'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${breakpoint.file}:${breakpoint.line}`}
                  />
                </ListItem>
              ))}
              {breakpoints.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="No breakpoints set"
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        </Box>

        <Divider />

        {/* Call Stack Section */}
        <Box>
          {renderSectionHeader('Call Stack', 'callStack', callStack.length)}
          <Collapse in={expandedSections.callStack}>
            <List dense>
              {callStack.map((frame, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={frame.name}
                    secondary={`${frame.file}:${frame.line}`}
                  />
                </ListItem>
              ))}
              {callStack.length === 0 && (
                <ListItem>
                  <ListItemText
                    secondary="Not paused"
                    sx={{ color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          </Collapse>
        </Box>

        <Divider />

        {/* Watch Section */}
        <Box>
          {renderSectionHeader('Watch', 'watch', watchExpressions.length)}
          <Collapse in={expandedSections.watch}>
            <Box sx={{ p: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={newWatch}
                onChange={(e) => setNewWatch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWatch()}
                placeholder="Add expression..."
                sx={{ mb: 1 }}
              />
              <List dense>
                {watchExpressions.map((expr, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={expr} secondary="Not available" />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>
        </Box>
      </Box>
    </Paper>
  );
};

export default DebugPanel;
