import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  Typography,
  Paper,
  Collapse,
} from '@mui/material';
import {
  FolderOutlined,
  InsertDriveFileOutlined,
  ExpandMore,
  ChevronRight,
  CreateNewFolder,
  NoteAdd,
  Refresh,
} from '@mui/icons-material';
import { useProjectStore } from '../../store/projectStore';

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
}

const FileExplorer = () => {
  const [expanded, setExpanded] = useState<string[]>([]);
  const { currentProject, loadProjectFiles, createFile, createDirectory } = useProjectStore();
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);

  useEffect(() => {
    if (currentProject) {
      refreshFiles();
    }
  }, [currentProject]);

  const refreshFiles = async () => {
    if (currentProject) {
      const files = await loadProjectFiles(currentProject.id);
      setFileStructure(files);
    }
  };

  const handleToggle = (path: string) => {
    setExpanded(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleCreateFile = async (parentPath: string) => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      await createFile(currentProject!.id, `${parentPath}/${fileName}`);
      refreshFiles();
    }
  };

  const handleCreateDirectory = async (parentPath: string) => {
    const dirName = prompt('Enter directory name:');
    if (dirName) {
      await createDirectory(currentProject!.id, `${parentPath}/${dirName}`);
      refreshFiles();
    }
  };

  const renderFileTree = (node: FileNode, level: number = 0) => {
    const isExpanded = expanded.includes(node.path);

    return (
      <Box key={node.path}>
        <ListItem
          disablePadding
          sx={{ pl: level * 2 }}
          secondaryAction={
            node.type === 'directory' && (
              <Box>
                <IconButton size="small" onClick={() => handleCreateFile(node.path)}>
                  <NoteAdd fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleCreateDirectory(node.path)}>
                  <CreateNewFolder fontSize="small" />
                </IconButton>
              </Box>
            )
          }
        >
          <ListItemButton onClick={() => node.type === 'directory' && handleToggle(node.path)}>
            <ListItemIcon>
              {node.type === 'directory' ? (
                isExpanded ? <ExpandMore /> : <ChevronRight />
              ) : (
                <InsertDriveFileOutlined />
              )}
            </ListItemIcon>
            <ListItemText primary={node.name} />
          </ListItemButton>
        </ListItem>
        {node.type === 'directory' && node.children && (
          <Collapse in={isExpanded}>
            <List disablePadding>
              {node.children.map(child => renderFileTree(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

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
        overflow: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle2">{currentProject.name}</Typography>
        <IconButton size="small" onClick={refreshFiles}>
          <Refresh fontSize="small" />
        </IconButton>
      </Box>
      <List dense>
        {fileStructure.map(node => renderFileTree(node))}
      </List>
    </Paper>
  );
};

export default FileExplorer;
