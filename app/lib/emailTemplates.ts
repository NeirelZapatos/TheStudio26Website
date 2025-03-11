import { IEmailTemplate } from '@/app/models/EmailTemplate';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Handle API errors
const handleApiError = (error: any): never => {
  console.error('API Error:', error);
  if (error.response?.data?.error) {
    throw new Error(error.response.data.error);
  }
  throw error;
};

/**
 * Fetch all email templates
 */
export const getEmailTemplates = async (): Promise<ApiResponse<IEmailTemplate[]>> => {
  try {
    const response = await fetch('/api/email-templates');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch templates');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Get a single email template by ID
 */
export const getEmailTemplate = async (id: string): Promise<ApiResponse<IEmailTemplate>> => {
  try {
    const response = await fetch(`/api/email-templates/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch template');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Create a new email template
 */
export const createEmailTemplate = async (
  templateData: Partial<IEmailTemplate>
): Promise<ApiResponse<IEmailTemplate>> => {
  try {
    const response = await fetch('/api/email-templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create template');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Update an existing email template
 */
export const updateEmailTemplate = async (
  id: string,
  templateData: Partial<IEmailTemplate>
): Promise<ApiResponse<IEmailTemplate>> => {
  try {
    const response = await fetch(`/api/email-templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update template');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

/**
 * Delete an email template
 */
export const deleteEmailTemplate = async (id: string): Promise<ApiResponse<{}>> => {
  try {
    const response = await fetch(`/api/email-templates/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete template');
    }
    
    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};