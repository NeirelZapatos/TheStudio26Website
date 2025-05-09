import Link from "next/link";
import React, { useState, useEffect } from "react";
import { TReaderDocument, renderToStaticMarkup, Reader } from "@usewaypoint/email-builder";
import { getEmailTemplates } from "@/app/lib/emailTemplates";
import { IEmailTemplate } from "@/app/models/EmailTemplate";
import NewsletterConfigForm from "@/app/Components/NewsletterConfigForm";

const NewsletterSection: React.FC = () => {
    const [templates, setTemplates] = useState<IEmailTemplate[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
    const [selectedTemplate, setSelectedTemplate] = useState<TReaderDocument | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [sendingLoading, setSendingLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // New state for confirmation dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Fetch templates from database
    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await getEmailTemplates();
                
                if (response.success && response.data) {
                    setTemplates(response.data);
                    
                    // Set the first template as selected if there are templates
                    if (response.data.length > 0) {
                        setSelectedTemplateId(String(response.data[0]._id));
                        setSelectedTemplate(response.data[0].content as TReaderDocument);
                    }
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

        fetchTemplates();
    }, []);

    // Handle template selection
    const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const templateId = event.target.value;
        setSelectedTemplateId(templateId);
        
        // Find the selected template
        const template = templates.find(t => String(t._id) === templateId);
        if (template) {
            setSelectedTemplate(template.content as TReaderDocument);
        }
    };

    // Modified to show confirmation dialog instead of immediately sending
    const handleSendButtonClick = () => {
        if (!selectedTemplate) {
            setMessage('Please select a template first');
            return;
        }
        
        if (!subject.trim()) {
            setMessage('Please enter a subject for your newsletter');
            return;
        }
        
        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    // Actual send function (called after confirmation)
    const handleSendNewsletter = async () => {
        if (!selectedTemplate) {
            setMessage('Please select a template first');
            return;
        }
        // Close the dialog
        setShowConfirmDialog(false);
        
        setSendingLoading(true);
        setMessage('');

        const content = renderToStaticMarkup(selectedTemplate, {rootBlockId: 'root'});

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subject, content }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage(data.message);
            } else {
                setMessage(data.message || 'Failed to send newsletter');
            }
        } catch (error) {
            setMessage('An error occurred while sending the newsletter');
        } finally {
            setSendingLoading(false);
        }
    };

    return (
        <section className="bg-white shadow rounded-lg p-6 min-h-screen flex gap-2">
            <div className="flex-1 p-4">
                <h2 className="text-lg font-bold mb-4">Select Newsletter</h2>
                
                {loading ? (
                    <p>Loading templates...</p>
                ) : error ? (
                    <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-4">
                        {error}
                    </div>
                ) : templates.length === 0 ? (
                    <div className="bg-yellow-100 p-4 rounded-lg text-yellow-700 mb-4">
                        No templates found. Please create some templates first.
                    </div>
                ) : (
                    <select
                        value={selectedTemplateId}
                        onChange={handleTemplateChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                        {templates.map((template) => (
                            <option key={String(template._id)} value={String(template._id)}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                )}
                
                <Link
                    href="/EmailBuilder"
                    className="bg-gray-200 block w-full my-4 p-2 rounded-lg hover:bg-gray-300 text-center"> 
                    Edit Templates
                </Link>
                
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                
                <div className="mb-4">
                    <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject:</label>
                    <input
                        id="subject"
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="Enter email subject..."
                    />
                </div>
                
                <button 
                    onClick={handleSendButtonClick} 
                    disabled={sendingLoading || !selectedTemplate || templates.length === 0}
                    className={`block w-full p-2 rounded-lg text-center ${
                        sendingLoading || !selectedTemplate || templates.length === 0
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                > 
                    {sendingLoading ? 'Sending...' : 'Send Newsletter'}
                </button>
                
                {message && (
                    <div className={`mt-4 p-3 rounded-lg ${message.includes('error') || message.includes('fail') 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                <NewsletterConfigForm />
            </div>

            <div className="flex-1 p-4 bg-gray-100 rounded-lg">
                {selectedTemplate ? (
                    <Reader document={selectedTemplate} rootBlockId="root"/>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        Select a template to preview
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4">Send Newsletter Confirmation</h3>
                        <p className="mb-6">
                            Are you sure you want to send the newsletter with subject "<span className="font-semibold">{subject}</span>" to all subscribers? 
                            This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendNewsletter}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                Confirm Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default NewsletterSection;