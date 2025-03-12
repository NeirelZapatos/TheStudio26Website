'use client';

import { useState } from 'react';

export default function UnsubscribeForm({ token }: { token: string}) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleUnsubscribe = async () => {
        setLoading(true);
        try {
        const response = await fetch(`/api/unsubscribe/${token}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        if (response.ok) {
            setMessage('You have been successfully unsubscribed.');
        } else {
            setMessage(data.error || 'Unsubscribe failed');
        }
        } catch (error) {
        setMessage('An error occurred. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Unsubscribe</h1>
        <p className="mb-4">
            Are you sure you want to unsubscribe from our newsletter?
        </p>
        <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
        >
            {loading ? 'Processing...' : 'Confirm Unsubscribe'}
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
    );
}