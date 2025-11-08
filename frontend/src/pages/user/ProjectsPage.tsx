import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import FolderIcon from '@mui/icons-material/Folder'
import DeleteIcon from '@mui/icons-material/Delete'
import { useProjects, useCreateProject, useDeleteProject } from '../../hooks/useProjects'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const { data: projects, isLoading, error } = useProjects()
  const createProjectMutation = useCreateProject()
  const deleteProjectMutation = useDeleteProject()

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      return
    }

    try {
      const newProject = await createProjectMutation.mutateAsync({
        name: newProjectName,
        description: newProjectDescription,
      })
      setOpen(false)
      setNewProjectName('')
      setNewProjectDescription('')
      // 作成したプロジェクトの詳細ページに自動遷移
      navigate(`/projects/${newProject.id}`)
    } catch (error) {
      console.error('プロジェクト作成エラー:', error)
    }
  }

  const handleDeleteClick = (projectId: string, projectName: string) => {
    setProjectToDelete({ id: projectId, name: projectName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return

    try {
      await deleteProjectMutation.mutateAsync(projectToDelete.id)
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
    } catch (error) {
      console.error('プロジェクト削除エラー:', error)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setProjectToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'in_progress':
        return 'primary'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完了'
      case 'in_progress':
        return '進行中'
      default:
        return '不明'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          プロジェクト一覧
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          新規プロジェクト
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          プロジェクト一覧の取得に失敗しました
        </Alert>
      )}

      {!isLoading && !error && projects && projects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }} data-testid="empty-projects-message">
          <Typography variant="body1" color="text.secondary">
            プロジェクトがありません。新規作成してください。
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {!isLoading && projects && projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} data-testid="project-card">
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="h2">
                    {project.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {project.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getStatusText(project.status)}
                    color={getStatusColor(project.status)}
                    size="small"
                  />
                  <Chip label={`Phase ${project.current_phase}`} size="small" variant="outlined" />
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate(`/projects/${project.id}`)}>
                  詳細を見る
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteClick(project.id, project.name)}
                >
                  削除
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 新規プロジェクト作成ダイアログ */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新規プロジェクト作成</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="プロジェクト名"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="プロジェクト概要"
            multiline
            rows={3}
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={createProjectMutation.isPending}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateProject}
            disabled={createProjectMutation.isPending || !newProjectName.trim()}
            startIcon={createProjectMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {createProjectMutation.isPending ? '作成中...' : '作成'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* プロジェクト削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} maxWidth="sm" fullWidth>
        <DialogTitle>プロジェクトの削除</DialogTitle>
        <DialogContent>
          <Typography>
            本当に「{projectToDelete?.name}」を削除しますか？
            <br />
            この操作は取り消せません。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleteProjectMutation.isPending}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirm}
            disabled={deleteProjectMutation.isPending}
            startIcon={deleteProjectMutation.isPending ? <CircularProgress size={20} /> : null}
          >
            {deleteProjectMutation.isPending ? '削除中...' : '削除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
