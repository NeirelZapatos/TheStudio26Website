import React, { useState, useEffect } from 'react';

interface NewsletterConfig {
  type: string;
  dayOfMonth: number;
  hour: number;
  minute: number;
  active: boolean;
  lastSent: string | null;
}

export default function NewsletterConfigForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<NewsletterConfig>({
    type: 'monthly',
    dayOfMonth: 1,
    hour: 9,
    minute: 0,
    active: true,
    lastSent: null
  });
  const [showToast, setShowToast] = useState(false);
  const [toast, setToast] = useState({ title: '', message: '', type: '' });

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch('/api/newsletter-config');
        const data = await res.json();
        
        if (data.config) {
          setConfig(data.config);
        }
      } catch (error) {
        showToastNotification('Error', 'Failed to load newsletter configuration', 'error');
      } finally {
        setLoading(false);
      }
    }
    
    fetchConfig();
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showToastNotification = (title: string, message: string, type: string) => {
    setToast({ title, message, type });
    setShowToast(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch('/api/newsletter-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          updatedBy: 'admin'
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToastNotification('Success', 'Newsletter configuration updated successfully', 'success');
      } else {
        throw new Error(data.message || 'Failed to update configuration');
      }
    } catch (error) {
      showToastNotification('Error', (error as Error).message || 'Something went wrong', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-6">Loading configuration...</div>;
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md dark:bg-gray-800">
      {/* Toast notification */}
      {showToast && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-md ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white z-50`}>
          <h3 className="font-semibold">{toast.title}</h3>
          <p>{toast.message}</p>
        </div>
      )}
      
      {/* Card header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Monthly Newsletter Configuration</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize when the automatic monthly newsletter is sent to subscribers
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Card content */}
        <div className="p-6 space-y-6">
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5 mt-1">
              <input 
                type="checkbox" 
                id="newsletter-active" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                checked={config.active}
                onChange={(e) => setConfig({ ...config, active: e.target.checked })}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="newsletter-active" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Enable Automatic Newsletter
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send monthly newsletter with upcoming classes automatically
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="day-of-month" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Day of Month
              </label>
              <select
                id="day-of-month"
                disabled={!config.active}
                value={config.dayOfMonth}
                onChange={(e) => setConfig({ ...config, dayOfMonth: parseInt(e.target.value) })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="hour" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Hour (24-hour)
                </label>
                <select
                  id="hour"
                  disabled={!config.active}
                  value={config.hour}
                  onChange={(e) => setConfig({ ...config, hour: parseInt(e.target.value) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(hour => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="minute" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Minute
                </label>
                <select
                  id="minute"
                  disabled={!config.active}
                  value={config.minute}
                  onChange={(e) => setConfig({ ...config, minute: parseInt(e.target.value) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {[0, 15, 30, 45].map(minute => (
                    <option key={minute} value={minute}>
                      {minute.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {config.lastSent && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last newsletter sent: {new Date(config.lastSent).toLocaleString()}
            </div>
          )}
        </div>
        
        {/* Card footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 rounded-b-lg">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}