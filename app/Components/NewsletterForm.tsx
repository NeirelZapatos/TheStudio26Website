"use client";
import React, { useState } from 'react';

const NewsletterForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setMessageType('');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessageType('success');
                setMessage('Thank you for subscribing!');
                setEmail('');
            } else {
                setMessageType('error');
                setMessage(data.error || 'Subscription failed');
            }
        } catch (error) {
            setMessageType('error');
            setMessage('Network error. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex flex-col space-y-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Enter your email"
                        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-300 text-white w-full"
                    />
                    <button 
                        className={`px-4 py-2 rounded-md transition-colors ${
                            loading 
                                ? 'bg-gray-600 cursor-not-allowed' 
                                : 'bg-red-700 hover:bg-red-600'
                        } text-white font-medium`} 
                        type="submit" 
                        disabled={loading}
                    >
                        {loading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </div>
                
                {message && (
                    <p className={`text-sm mt-2 ${
                        messageType === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {message}
                    </p>
                )}
            </form>
            <p className="text-gray-400 text-xs mt-4">
                We respect your privacy and will never share your information.
            </p>
        </div>
    );
};

export default NewsletterForm;