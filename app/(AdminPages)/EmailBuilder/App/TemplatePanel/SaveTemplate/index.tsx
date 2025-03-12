import React, { useState } from 'react';
import { 
  Save, 
  Close as CloseIcon 
} from '@mui/icons-material';
import { 
  IconButton, 
  Tooltip, 
  CircularProgress, 
  Snackbar, 
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import { useDocument } from '../../../documents/editor/EditorContext';
import { createEmailTemplate, updateEmailTemplate } from '@/app/lib/emailTemplates';

interface SaveToDatabaseProps {
  templateId?: string;
  initialName?: string;
}

export default function SaveToDatabase({ templateId, initialName }: SaveToDatabaseProps) {
  const doc = useDocument();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [templateName, setTemplateName] = useState(initialName || 'New Email Template');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      setSnackbar({
        open: true,
        message: 'Template name cannot be empty',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    handleCloseDialog();

    try {
      const templateData = {
        name: templateName,
        content: doc
      };

      let response;
      if (templateId) {
        // Update existing template
        response = await updateEmailTemplate(templateId, templateData);
      } else {
        // Create new template
        response = await createEmailTemplate(templateData);
      }

      if (response.success) {
        setSnackbar({
          open: true,
          message: templateId ? 'Template updated successfully' : 'Template saved successfully',
          severity: 'success'
        });
      } else {
        throw new Error(response.error || 'Failed to save template');
      }
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.message || 'An error occurred while saving the template',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Tooltip title="Save template to database">
        <IconButton onClick={handleOpenDialog} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : <Save fontSize="small" />}
        </IconButton>
      </Tooltip>

      {/* Template naming dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {templateId ? 'Update Email Template' : 'Save Email Template'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Template Name"
            type="text"
            fullWidth
            variant="outlined"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={closeSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}