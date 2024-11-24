import {
  Box,
  Tab,
  Tabs,
  IconButton,
  styled,
  useTheme,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useEditorStore } from '../../store/editorStore';

const StyledTab = styled(Tab)(({ theme }) => ({
  minHeight: 35,
  padding: '0 16px',
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.text.primary,
  },
}));

const TabBar = () => {
  const theme = useTheme();
  const { tabs, activeTabId, closeTab, setActiveTab } = useEditorStore();

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleClose = (
    event: React.MouseEvent,
    id: string
  ) => {
    event.stopPropagation();
    closeTab(id);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Tabs
        value={activeTabId}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minHeight: 35 }}
      >
        {tabs.map((tab) => (
          <StyledTab
            key={tab.id}
            value={tab.id}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{tab.filename}{tab.isDirty ? ' •' : ''}</span>
                <IconButton
                  size="small"
                  onClick={(e) => handleClose(e, tab.id)}
                  sx={{
                    padding: 0.5,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabBar;
