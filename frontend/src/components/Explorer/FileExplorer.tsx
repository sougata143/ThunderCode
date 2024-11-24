import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Collapse,
  IconButton,
  Typography,
  Toolbar,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  TextareaAutosize,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

interface FileExplorerProps {
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1e1e1e',
      paper: '#252526'
    },
    text: {
      primary: '#cccccc',
      secondary: '#858585'
    },
    divider: '#404040'
  },
  components: {
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
          height: '28px',
          padding: '0 8px',
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: '20px',
          marginRight: '4px',
          color: '#858585',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#858585',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: '#ffffff',
          },
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '38px !important',
          borderBottom: '1px solid #404040',
          backgroundColor: '#333333',
        },
      },
    },
  },
  typography: {
    fontFamily: "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', monospace",
    fontSize: 13,
  },
});

const FileExplorer: React.FC<FileExplorerProps> = () => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [fileHandles] = useState<Map<string, File>>(new Map());
  const [selectedFile, setSelectedFile] = useState<{
    file: FileNode | null;
    content: string;
  }>({
    file: null,
    content: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    console.log('FileStructure updated:', fileStructure);
    console.log('Expanded state:', expanded);
  }, [fileStructure, expanded]);

  const handleToggle = (path: string) => {
    setExpanded(prev => 
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleFileClick = async (node: FileNode) => {
    try {
      const file = fileHandles.get(node.path);
      if (!file) {
        throw new Error('File not found');
      }

      const content = await readFileContent(file);
      setSelectedFile({
        file: node,
        content,
      });
    } catch (error) {
      console.error('Error reading file:', error);
      enqueueSnackbar('Failed to read file', { variant: 'error' });
    }
  };

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedFile(prev => ({
      ...prev,
      content: event.target.value
    }));
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else if (content instanceof ArrayBuffer) {
          const bytes = new Uint8Array(content);
          if (isTextFile(file.name)) {
            const text = new TextDecoder().decode(bytes);
            resolve(text);
          } else {
            // For binary files, convert to data URL
            const blob = new Blob([bytes]);
            const url = URL.createObjectURL(blob);
            resolve(url);
          }
        } else {
          reject(new Error('Unsupported file content'));
        }
      };
      
      reader.onerror = () => reject(reader.error);
      
      if (isTextFile(file.name)) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const isTextFile = (filename: string): boolean => {
    const textExtensions = [
      '.txt', '.js', '.jsx', '.ts', '.tsx', '.md', '.json', '.css', '.scss',
      '.html', '.xml', '.yaml', '.yml', '.sh', '.bash', '.zsh', '.py', '.rb',
      '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.swift',
      '.kt', '.kts', '.php', '.pl', '.pm', '.r', '.dart', '.lua', '.sql',
      '.conf', '.ini', '.env', '.gitignore', '.dockerignore', '.editorconfig'
    ];
    return textExtensions.some(ext => filename.toLowerCase().endsWith(ext)) ||
           !filename.includes('.'); // Files without extension are treated as text
  };

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.svg', '.ico'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const isPDFFile = (filename: string): boolean => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  const handleOpenLocalFolder = useCallback(async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.setAttribute('webkitdirectory', '');
      input.setAttribute('directory', '');
      
      input.onchange = async (e: Event) => {
        const files = (e.target as HTMLInputElement).files;
        if (!files || files.length === 0) return;

        console.log('Files selected:', files.length);

        const structure: FileNode[] = [];
        const pathMap = new Map<string, FileNode>();
        fileHandles.clear();

        const rootPath = files[0].webkitRelativePath.split('/')[0];
        console.log('Root path:', rootPath);
        
        const rootNode: FileNode = {
          name: rootPath,
          type: 'directory',
          path: rootPath,
          children: []
        };
        structure.push(rootNode);
        pathMap.set(rootPath, rootNode);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const pathParts = file.webkitRelativePath.split('/');
          console.log('Processing file:', file.webkitRelativePath);
          
          let currentPath = pathParts[0];
          
          for (let j = 1; j < pathParts.length; j++) {
            const part = pathParts[j];
            const parentPath = currentPath;
            currentPath = `${currentPath}/${part}`;
            
            if (!pathMap.has(currentPath)) {
              const isFile = j === pathParts.length - 1;
              const node: FileNode = {
                name: part,
                type: isFile ? 'file' : 'directory',
                path: currentPath,
                children: isFile ? undefined : []
              };
              
              if (isFile) {
                fileHandles.set(currentPath, file);
              }
              
              const parent = pathMap.get(parentPath);
              if (parent && parent.children) {
                parent.children.push(node);
                console.log('Added node to parent:', currentPath);
              }
              
              pathMap.set(currentPath, node);
            }
          }
        }

        console.log('Setting file structure:', structure);
        setFileStructure(structure);
        setExpanded([rootPath]);
        enqueueSnackbar('Folder loaded successfully', { variant: 'success' });
      };

      input.click();
    } catch (error) {
      console.error('Error opening folder:', error);
      enqueueSnackbar('Failed to open folder', { variant: 'error' });
    }
  }, [enqueueSnackbar, fileHandles]);

  const renderFileTree = useCallback((node: FileNode) => {
    console.log('Rendering node:', node);
    return (
      <Box key={node.path} sx={{ width: '100%' }}>
        <ListItem
          disablePadding
          sx={{
            pl: node.type === 'file' ? 4 : 2,
            '& .MuiListItemIcon-root': {
              color: node.type === 'directory' ? '#6997d5' : '#cccccc',
            },
          }}
        >
          <ListItemButton
            onClick={() => node.type === 'directory' ? handleToggle(node.path) : handleFileClick(node)}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              },
            }}
          >
            <ListItemIcon>
              {node.type === 'directory' ? (
                expanded.includes(node.path) ? (
                  <ExpandMoreIcon sx={{ fontSize: 18 }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: 18 }} />
                )
              ) : (
                <FileIcon sx={{ fontSize: 16 }} />
              )}
            </ListItemIcon>
            <ListItemText 
              primary={node.name} 
              sx={{
                '& .MuiTypography-root': {
                  fontSize: '0.85rem',
                  fontWeight: node.type === 'directory' ? 600 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }
              }}
            />
          </ListItemButton>
        </ListItem>

        {node.type === 'directory' && node.children && (
          <Collapse in={expanded.includes(node.path)} timeout="auto" unmountOnExit>
            <List 
              component="div" 
              disablePadding
              sx={{
                borderLeft: '1px solid #404040',
                ml: 2,
              }}
            >
              {node.children.map((childNode) => renderFileTree(childNode))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  }, [expanded]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        {/* File Explorer Sidebar */}
        <Box
          sx={{
            width: '250px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRight: 1,
            borderColor: 'divider',
          }}
        >
          <Toolbar 
            variant="dense" 
            sx={{ 
              px: 1,
              gap: 1,
              display: 'flex',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <IconButton 
              onClick={handleOpenLocalFolder} 
              title="Open Local Folder"
              size="small"
              sx={{
                padding: '4px',
                borderRadius: '4px',
              }}
            >
              <FolderOpenIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Toolbar>

          <Box 
            sx={{ 
              flexGrow: 1, 
              overflow: 'auto',
              bgcolor: 'background.paper',
            }}
          >
            {fileStructure.length > 0 ? (
              <List sx={{ width: '100%', p: 0 }}>
                {fileStructure.map((node) => renderFileTree(node))}
              </List>
            ) : (
              <Box 
                p={2} 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  gap: 2,
                }}
              >
                <FolderOpenIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No files loaded. Click the folder icon to open a local folder.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box 
          sx={{ 
            flexGrow: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
          }}
        >
          {selectedFile.file ? (
            <Box 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 2,
              }}
            >
              <Typography variant="h6" color="text.primary" sx={{ mb: 1 }}>
                {selectedFile.file.name}
              </Typography>
              {isTextFile(selectedFile.file.name) ? (
                <TextareaAutosize 
                  value={selectedFile.content} 
                  onChange={handleContentChange} 
                  style={{
                    width: '100%',
                    height: '100%',
                    padding: '8px',
                    fontSize: '0.85rem',
                    fontFamily: "'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', monospace",
                    backgroundColor: 'background.paper',
                    border: '1px solid #404040',
                    borderRadius: '4px',
                  }}
                />
              ) : isImageFile(selectedFile.file.name) ? (
                <img 
                  src={selectedFile.content} 
                  alt={selectedFile.file.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : isPDFFile(selectedFile.file.name) ? (
                <iframe 
                  src={selectedFile.content} 
                  title={selectedFile.file.name} 
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  File preview not supported for this file type.
                </Typography>
              )}
            </Box>
          ) : (
            <Box 
              sx={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Select a file to view and edit its content
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default FileExplorer;
