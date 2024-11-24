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
  FolderOutlined,
  SearchOutlined,
  ExtensionOutlined,
  BugReportOutlined,
  SmartToyOutlined,
  Source,
  ChevronLeft,
  ChevronRight,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import FileExplorer from '../Explorer/FileExplorer';
import CodeSearch from '../Search/CodeSearch';
import SourceControl from '../SourceControl/SourceControl';
import ExtensionsManager from '../Extensions/ExtensionsManager';
import DebugPanel from '../Debug/DebugPanel';
import AIAssistant from '../AIAssistant/AIAssistant';
import Settings from '../Settings/Settings';

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 56;
const PANEL_WIDTH = 300;

export type SidebarView = 'explorer' | 'search' | 'sourceControl' | 'extensions' | 'aiAssistant' | 'debug' | 'settings';

const Sidebar = () => {
  const theme = useTheme();
  const [activeView, setActiveView] = useState<SidebarView>('explorer');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { text: 'Explorer', icon: <FolderOutlined />, view: 'explorer' as SidebarView },
    { text: 'Search', icon: <SearchOutlined />, view: 'search' as SidebarView },
    { text: 'Source Control', icon: <Source />, view: 'sourceControl' as SidebarView },
    { text: 'Extensions', icon: <ExtensionOutlined />, view: 'extensions' as SidebarView },
    { text: 'AI Assistant', icon: <SmartToyOutlined />, view: 'aiAssistant' as SidebarView },
    { text: 'Debug', icon: <BugReportOutlined />, view: 'debug' as SidebarView },
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
                key={item.text} 
                title={isCollapsed ? item.text : ''} 
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
                      primary={item.text}
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
            <Tooltip 
              title={isCollapsed ? 'Settings' : ''} 
              placement="right"
            >
              <ListItem
                button
                selected={activeView === 'settings'}
                onClick={() => setActiveView('settings')}
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
                    color: activeView === 'settings'
                      ? theme.palette.primary.main
                      : 'inherit',
                    minWidth: isCollapsed ? 0 : 40,
                    mr: isCollapsed ? 0 : 2,
                    justifyContent: 'center',
                  }}
                >
                  <SettingsIcon />
                </ListItemIcon>
                {!isCollapsed && (
                  <ListItemText
                    primary="Settings"
                    sx={{
                      '& .MuiTypography-root': {
                        color: activeView === 'settings'
                          ? theme.palette.primary.main
                          : 'inherit',
                        fontSize: '0.875rem',
                      },
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
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
