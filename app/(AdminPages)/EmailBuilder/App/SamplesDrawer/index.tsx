import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  CircularProgress,
  Divider, 
  Drawer, 
  Stack, 
  Typography,
  Alert,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useSamplesDrawerOpen, resetDocument } from '../../documents/editor/EditorContext';
import SidebarButton from './SidebarButton';
import { getEmailTemplates, getEmailTemplate, deleteEmailTemplate } from '@/app/lib/emailTemplates';
import { IEmailTemplate } from '@/app/models/EmailTemplate';
import EMPTY_EMAIL_MESSAGE from '../../getConfiguration/sample/empty-email-message';

import validateTextAreaValue from './validateJsonStringValue';

export const SAMPLES_DRAWER_WIDTH = 240;

export default function TemplatesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const [templates, setTemplates] = useState<IEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // State for delete confirm dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<{id: string, name: string} | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Function to fetch templates from database
  const fetchTemplates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getEmailTemplates();
      
      if (response.success && response.data) {
        setTemplates(response.data);
      } else {
        throw new Error(response.error || 'Failed to load templates');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading templates');
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle opening delete confirm dialog
  const handleOpenDeleteDialog = (e: React.MouseEvent, templateId: string, templateName: string) => {
    // Stop event propagation to prevent template selection
    e.stopPropagation();
    e.preventDefault();
    
    setTemplateToDelete({ id: templateId, name: templateName });
    setDeleteDialogOpen(true);
  };

  // Function to handle closing delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

   // Function to handle delete template
  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    setDeleteLoading(true);
    
    try {
      // Check if we're currently viewing the deleted template
      const currentHash = window.location.hash;
      const deletedTemplateHash = `#template/${templateToDelete.id}`;
      const isCurrentTemplate = currentHash === deletedTemplateHash;
      
      // If we're deleting the current template, clear the editor first before deletion
      if (isCurrentTemplate) {
        try {
          // Reset document to an empty state before deleting the template
          resetDocument(EMPTY_EMAIL_MESSAGE);
          // Change the hash without triggering a page reload
          window.history.pushState(null, '', window.location.pathname);
        } catch (err) {
          console.error('Error resetting editor before template deletion:', err);
        }
      }
      
      // Now delete the template from the database
      const response = await deleteEmailTemplate(templateToDelete.id);
      
      if (response.success) {
        // Remove deleted template from state
        setTemplates(prev => prev.filter(template => String(template._id) !== templateToDelete.id));
        handleCloseDeleteDialog();
      } else {
        throw new Error(response.error || 'Failed to delete template');
      }
    } catch (err: any) {
      console.error('Error deleting template:', err);
      // You could add an error state here to show in the UI
    } finally {
      setDeleteLoading(false);
    }
  };

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Function to load a template when clicked
  const handleTemplateSelect = async (templateId: string) => {
    setTemplateLoading(true);
    
    try {
      const response = await getEmailTemplate(templateId);
      
      if (response.success && response.data) {
        // Use your existing resetDocument function to load the template content
        const { error, data } = validateTextAreaValue(JSON.stringify(response.data.content));
        setError(error ?? null);
        if (!data) {
          return;          
        }
        resetDocument(data);
      } else {
        throw new Error(response.error || 'Failed to load template');
      }
    } catch (err: any) {
      // Show error in console - could also show in UI if desired
      console.error('Error loading template:', err);
      alert(`Error loading template: ${err.message}`);
    } finally {
      setTemplateLoading(false);
    }
  };

  // Monitor hash changes to load templates
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      
      // Check if hash matches #template/[id] format
      if (hash.startsWith('#template/')) {
        const templateId = hash.replace('#template/', '');
        handleTemplateSelect(templateId);
      }
    };
    
    // Check on initial load
    handleHashChange();
    
    // Add event listener
    window.addEventListener('hashchange', handleHashChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={samplesDrawerOpen}
      sx={{
        width: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
      }}
    >
      <Stack spacing={3} py={1} px={2} width={SAMPLES_DRAWER_WIDTH} justifyContent="space-between" height="100%">
        <Stack spacing={2} sx={{ '& .MuiButtonBase-root': { width: '100%', justifyContent: 'flex-start' } }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ p: 0.75 }}>
            <Typography variant="h6" component="h1">
              Email Templates
            </Typography>
            
            <Tooltip title="Refresh templates">
              <Button 
                size="small" 
                onClick={fetchTemplates} 
                disabled={loading}
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <RefreshIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ my: 2 }}>
              {error}
            </Alert>
          ) : templates.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
              No templates found. Create and save a template to see it here.
            </Typography>
          ) : (
            <Stack alignItems="flex-start">
              {/* Show global loading indicator if a template is being loaded */}
              {templateLoading && (
                <Box sx={{ py: 1, px: 2, width: '100%' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="caption" color="text.secondary" display="inline">
                    Loading template...
                  </Typography>
                </Box>
              )}
              
              {/* Dynamically render templates from database */}
              {templates.map((template) => (
                <Box 
                  key={String(template._id)} 
                  sx={{ 
                    display: 'flex', 
                    width: '100%', 
                    alignItems: 'center',
                    '&:hover .delete-button': {
                      visibility: 'visible',
                    }
                  }}
                >
                  <div style={{ width: '100%' }}>
                    <SidebarButton 
                      href={`#template/${template._id}`}
                    >
                      {template.name}
                    </SidebarButton>
                  </div>
                  <Tooltip title="Delete template">
                    <IconButton
                      size="small"
                      className="delete-button"
                      onClick={(e) => handleOpenDeleteDialog(e, String(template._id), template.name)}
                      sx={{ 
                        visibility: 'hidden',
                        minWidth: 'auto',
                        maxWidth: '2px',
                        padding: '4px',
                        color: 'error.main',
                        backgroundColor: 'background.paper',
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.04)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleCloseDeleteDialog}
        >
          <DialogTitle>Delete Template</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the template "{templateToDelete?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteTemplate} 
              color="error" 
              disabled={deleteLoading}
              startIcon={deleteLoading ? <CircularProgress size={16} /> : null}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Drawer>
  );
}