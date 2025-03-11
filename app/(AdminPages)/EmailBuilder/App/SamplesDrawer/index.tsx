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
  Tooltip
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useSamplesDrawerOpen, resetDocument } from '../../documents/editor/EditorContext';
import SidebarButton from './SidebarButton';
import { getEmailTemplates, getEmailTemplate } from '@/app/lib/emailTemplates';
import { IEmailTemplate } from '@/app/models/EmailTemplate';

import validateTextAreaValue from './validateJsonStringValue';

export const SAMPLES_DRAWER_WIDTH = 240;

export default function TemplatesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  const [templates, setTemplates] = useState<IEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Load templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Function to create a new empty document
  const handleCreateNew = () => {
    // Reset document to empty state - using your existing resetDocument function
    resetDocument({});
    
    // Update the URL hash
    window.location.hash = '';
  };

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
                <SidebarButton 
                  key={String(template._id)}
                  // Using href="#template/[id]" pattern
                  href={`#template/${template._id}`}
                >
                  {template.name}
                </SidebarButton>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Drawer>
  );
}