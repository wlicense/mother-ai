import { useState } from 'react'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
} from '@mui/material'
import FolderIcon from '@mui/icons-material/Folder'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export interface FileNode {
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  language?: string
}

interface FileTreeProps {
  files: FileNode[]
  onFileSelect?: (file: FileNode) => void
  selectedFile?: string
}

interface FileTreeItemProps {
  node: FileNode
  level: number
  onFileSelect?: (file: FileNode) => void
  selectedFile?: string
}

function FileTreeItem({ node, level, onFileSelect, selectedFile }: FileTreeItemProps) {
  const [open, setOpen] = useState(false)

  const handleToggle = () => {
    if (node.type === 'folder') {
      setOpen(!open)
    }
  }

  const handleFileClick = () => {
    if (node.type === 'file' && onFileSelect) {
      onFileSelect(node)
    } else {
      handleToggle()
    }
  }

  const isSelected = selectedFile === node.path

  return (
    <>
      <ListItemButton
        onClick={handleFileClick}
        selected={isSelected}
        sx={{
          pl: level * 2,
          py: 0.5,
          '&.Mui-selected': {
            bgcolor: 'primary.light',
            '&:hover': {
              bgcolor: 'primary.light',
            },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32 }}>
          {node.type === 'folder' ? (
            open ? (
              <ExpandMoreIcon fontSize="small" />
            ) : (
              <ChevronRightIcon fontSize="small" />
            )
          ) : null}
        </ListItemIcon>
        <ListItemIcon sx={{ minWidth: 32 }}>
          {node.type === 'folder' ? (
            open ? (
              <FolderOpenIcon fontSize="small" color="primary" />
            ) : (
              <FolderIcon fontSize="small" color="action" />
            )
          ) : (
            <InsertDriveFileIcon fontSize="small" color="action" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" noWrap>
              {node.name}
            </Typography>
          }
        />
      </ListItemButton>

      {node.type === 'folder' && node.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {node.children.map((child, index) => (
              <FileTreeItem
                key={`${child.path}-${index}`}
                node={child}
                level={level + 1}
                onFileSelect={onFileSelect}
                selectedFile={selectedFile}
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  )
}

export default function FileTree({ files, onFileSelect, selectedFile }: FileTreeProps) {
  if (!files || files.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ファイルがありません
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        bgcolor: 'background.paper',
      }}
    >
      <List dense disablePadding>
        {files.map((node, index) => (
          <FileTreeItem
            key={`${node.path}-${index}`}
            node={node}
            level={1}
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
          />
        ))}
      </List>
    </Box>
  )
}
