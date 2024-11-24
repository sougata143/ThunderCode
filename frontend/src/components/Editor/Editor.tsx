import { Box } from '@mui/material';
import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useTheme } from '@mui/material/styles';
import { useEditorStore } from '../../store/editorStore';
import { useSettingsStore } from '../../store/settingsStore';
import TabBar from './TabBar';

interface EditorProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  language?: string;
}

const Editor: React.FC<EditorProps> = ({ 
  value: externalValue, 
  onChange: externalOnChange, 
  language: externalLanguage 
}) => {
  const theme = useTheme();
  const settings = useSettingsStore();
  const { tabs, activeTabId, updateTabContent } = useEditorStore();
  
  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  const handleEditorChange = (value: string | undefined) => {
    if (activeTabId && value !== undefined) {
      updateTabContent(activeTabId, value);
    }
    if (externalOnChange) {
      externalOnChange(value);
    }
  };

  if (!activeTab && !externalValue) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        No file is open
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {activeTab && <TabBar />}
      <Box sx={{ flexGrow: 1 }}>
        <MonacoEditor
          height="100%"
          language={externalLanguage || activeTab?.language}
          theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
          value={externalValue || activeTab?.content}
          onChange={handleEditorChange}
          options={{
            fontSize: settings.fontSize,
            minimap: { enabled: settings.minimap },
            wordWrap: settings.wordWrap ? 'on' : 'off',
            lineNumbers: settings.lineNumbers ? 'on' : 'off',
            tabSize: settings.tabSize,
            fontFamily: '"Fira Code", "Roboto Mono", monospace',
            bracketPairColorization: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            autoIndent: 'full',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            scrollBeyondLastLine: false,
          }}
        />
      </Box>
    </Box>
  );
};

export default Editor;
