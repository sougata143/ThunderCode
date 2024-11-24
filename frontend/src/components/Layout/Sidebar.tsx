import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
} from '@mui/material';
import {
  FolderOutlined,
  SearchOutlined,
  ExtensionOutlined,
  BugReportOutlined,
  SmartToyOutlined,
  Source,
} from '@mui/icons-material';

const DRAWER_WIDTH = 240;

const Sidebar = () => {
  const theme = useTheme();

  const menuItems = [
    { text: 'Explorer', icon: <FolderOutlined /> },
    { text: 'Search', icon: <SearchOutlined /> },
    { text: 'Source Control', icon: <Source /> },
    { text: 'Extensions', icon: <ExtensionOutlined /> },
    { text: 'AI Assistant', icon: <SmartToyOutlined /> },
    { text: 'Debug', icon: <BugReportOutlined /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          top: '64px',
          height: 'calc(100% - 64px)',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem button key={item.text}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
