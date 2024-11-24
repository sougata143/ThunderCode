import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  InsertDriveFile,
  MoreVert,
  Add,
  CreateNewFolder,
  NoteAdd,
} from '@mui/icons-material';
import { useState } from 'react';
import { useFileSystemStore } from '../../store/fileSystemStore';
import { useEditorStore } from '../../store/editorStore';
import { fileSystemService } from '../../services/FileSystemService';

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  isExpanded?: boolean;
  children?: FileNode[];
}

const FileExplorer = () => {
  const {
    fileTree,
    currentPath,
    selectedPath,
    isLoading,
    error,
    loadDirectory,
    createFile,
    createDirectory,
    deleteItem,
    renameItem,
    toggleDirectory,
    setSelectedPath,
  } = useFileSystemStore();

  const { addTab } = useEditorStore();

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    node?: FileNode;
  } | null>(null);

  const [newItemDialog, setNewItemDialog] = useState<{
    open: boolean;
    type: 'file' | 'directory';
  } | null>(null);

  const [newItemName, setNewItemName] = useState('');
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; node?: FileNode }>({
    open: false,
  });
  const [newName, setNewName] = useState('');

  const handleContextMenu = (
    event: React.MouseEvent,
    node: FileNode
  ) => {
    event.preventDefault();
    setContextMenu({
      mouseX: event.clientX,
      mouseY: event.clientY,
      node,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleNewItem = (type: 'file' | 'directory') => {
    setNewItemDialog({ open: true, type });
    handleCloseContextMenu();
  };

  const handleCreateItem = async () => {
    if (!newItemName.trim()) return;

    const path = `${currentPath}/${newItemName}`;
    if (newItemDialog?.type === 'file') {
      await createFile(path, '');
    } else {
      await createDirectory(path);
    }

    setNewItemDialog(null);
    setNewItemName('');
  };

  const handleDelete = async () => {
    if (contextMenu?.node) {
      await deleteItem(contextMenu.node.path);
      handleCloseContextMenu();
    }
  };

  const handleRename = () => {
    if (contextMenu?.node) {
      setRenameDialog({ open: true, node: contextMenu.node });
      setNewName(contextMenu.node.name);
      handleCloseContextMenu();
    }
  };

  const handleRenameConfirm = async () => {
    if (renameDialog.node && newName.trim()) {
      const oldPath = renameDialog.node.path;
      const newPath = `${currentPath}/${newName}`;
      await renameItem(oldPath, newPath);
      setRenameDialog({ open: false });
      setNewName('');
    }
  };

  const handleFileClick = async (node: FileNode) => {
    if (node.type === 'directory') {
      await toggleDirectory(node.path);
    } else {
      setSelectedPath(node.path);
      const content = await fileSystemService.readFile(node.path);
      addTab({
        filename: node.name,
        language: content.language,
        content: content.content,
      });
    }
  };

  const renderTree = (nodes: FileNode[]) => (
    <List>
      {nodes.map((node) => (
        <ListItem
          key={node.path}
          disablePadding
          onContextMenu={(e) => handleContextMenu(e, node)}
          secondaryAction={
            <IconButton
              edge="end"
              size="small"
              onClick={(e) => handleContextMenu(e, node)}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          }
        >
          <ListItemButton
            selected={selectedPath === node.path}
            onClick={() => handleFileClick(node)}
          >
            <ListItemIcon>
              {node.type === 'directory' ? (
                node.isExpanded ? (
                  <FolderOpen />
                ) : (
                  <Folder />
                )
              ) : (
                <InsertDriveFile />
              )}
            </ListItemIcon>
            <ListItemText primary={node.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 1,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1">Explorer</Typography>
        <Box>
          <IconButton size="small" onClick={() => handleNewItem('file')}>
            <NoteAdd fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleNewItem('directory')}>
            <CreateNewFolder fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ p: 1 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          renderTree(fileTree)
        )}
      </Box>

      <Menu
        open={!!contextMenu}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleNewItem('file')}>New File</MenuItem>
        <MenuItem onClick={() => handleNewItem('directory')}>New Folder</MenuItem>
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>

      <Dialog
        open={!!newItemDialog?.open}
        onClose={() => setNewItemDialog(null)}
      >
        <DialogTitle>
          New {newItemDialog?.type === 'file' ? 'File' : 'Folder'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewItemDialog(null)}>Cancel</Button>
          <Button onClick={handleCreateItem}>Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={renameDialog.open}
        onClose={() => setRenameDialog({ open: false })}
      >
        <DialogTitle>Rename</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialog({ open: false })}>
            Cancel
          </Button>
          <Button onClick={handleRenameConfirm}>Rename</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileExplorer;
