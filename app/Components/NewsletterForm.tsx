import React, { useState } from 'react';

const NewsletterForm = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

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
                setMessage('Thank you for subscribing!');
                setEmail('');
            } else {
                setMessage(data.error || 'Subscription failed');
            }
        } catch (error) {
            setMessage('Network error. Please try again.');
        }

        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h6 className="footer-title">Newsletter</h6>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="input input-bordered join-item"
            />
            <button className="btn btn-primary join-item" type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Subscribe'}
            </button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default NewsletterForm;