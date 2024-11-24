import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  Search as SearchIcon,
  Extension as ExtensionIcon,
  BugReport as BugReportIcon,
  Source as SourceIcon,
  SmartToy as SmartToyIcon,
  Memory as MemoryIcon,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useState } from 'react';
import FileExplorer from '../Explorer/FileExplorer';
import CodeSearch from '../Search/CodeSearch';
import SourceControl from '../SourceControl/SourceControl';
import ExtensionsManager from '../Extensions/ExtensionsManager';
import DebugPanel from '../Debug/DebugPanel';
import AIAssistant from '../AIAssistant/AIAssistant';
import LocalLLM from '../LocalLLM/LocalLLM';
import Settings from '../Settings/Settings';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 56;
const PANEL_WIDTH = 300;

export type SidebarView = 
  'explorer' | 
  'search' | 
  'sourceControl' | 
  'extensions' | 
  'aiAssistant' | 
  'debug' | 
  'localLLM' | 
  'settings';

const Sidebar = () => {
  const theme = useTheme();
  const [activeView, setActiveView] = useState<SidebarView>('explorer');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'explorer', icon: <FolderIcon />, label: 'Explorer', view: 'explorer' as SidebarView },
    { id: 'search', icon: <SearchIcon />, label: 'Search', view: 'search' as SidebarView },
    { id: 'source-control', icon: <SourceIcon />, label: 'Source Control', view: 'sourceControl' as SidebarView },
    { id: 'debug', icon: <BugReportIcon />, label: 'Debug', view: 'debug' as SidebarView },
    { id: 'extensions', icon: <ExtensionIcon />, label: 'Extensions', view: 'extensions' as SidebarView },
    { id: 'ai-assistant', icon: <SmartToyIcon />, label: 'AI Assistant', view: 'aiAssistant' as SidebarView },
    { id: 'local-llm', icon: <MemoryIcon />, label: 'Local LLM', view: 'localLLM' as SidebarView },
    { id: 'settings', icon: <SettingsIcon />, label: 'Settings', view: 'settings' as SidebarView },
  ];

  const handleDrawerToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'explorer':
        return <FileExplorer />;
      case 'search':
        return <CodeSearch />;
      case 'sourceControl':
        return <SourceControl />;
      case 'extensions':
        return <ExtensionsManager />;
      case 'aiAssistant':
        return <AIAssistant />;
      case 'debug':
        return <DebugPanel />;
      case 'localLLM':
        return <LocalLLM />;
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100% - 64px)',
            backgroundColor: theme.palette.background.paper,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List>
            {menuItems.map((item) => (
              <Tooltip 
                key={item.id} 
                title={isCollapsed ? item.label : ''} 
                placement="right"
              >
                <ListItem
                  button
                  selected={activeView === item.view}
                  onClick={() => setActiveView(item.view)}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.action.selected,
                    },
                    '&.Mui-selected:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                    minHeight: 48,
                    px: isCollapsed ? 1.5 : 2,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: activeView === item.view
                        ? theme.palette.primary.main
                        : 'inherit',
                      minWidth: isCollapsed ? 0 : 40,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.label}
                      sx={{
                        '& .MuiTypography-root': {
                          color: activeView === item.view
                            ? theme.palette.primary.main
                            : 'inherit',
                          fontSize: '0.875rem',
                        },
                      }}
                    />
                  )}
                </ListItem>
              </Tooltip>
            ))}
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <List>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton onClick={handleDrawerToggle}>
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Box>
          </List>
        </Box>
      </Drawer>

      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: PANEL_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: PANEL_WIDTH,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100% - 64px)',
            left: isCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            backgroundColor: theme.palette.background.default,
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create(['left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Box sx={{ overflow: 'auto', height: '100%' }}>
          {renderContent()}
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
