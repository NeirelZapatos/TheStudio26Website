import Link from "next/link";
import React, { useState } from "react";
import { TReaderDocument, renderToStaticMarkup, Reader } from "@usewaypoint/email-builder";
import ONE_TIME_PASSCODE from "../../EmailBuilder/getConfiguration/finishedNewsletters/one-time-passcode";
import ORDER_ECOMMERCE from "../../EmailBuilder/getConfiguration/finishedNewsletters/order-ecommerce";
import POST_METRICS_REPORT from "../../EmailBuilder/getConfiguration/finishedNewsletters/post-metrics-report";

type configurationsMap = {
    [key: string]: TReaderDocument;
}

const configurations: configurationsMap = {
    "One Time Passcode": ONE_TIME_PASSCODE,
    "Order E-commerce": ORDER_ECOMMERCE,
    "Post Metrics Report" : POST_METRICS_REPORT,
};

const testConfig: TReaderDocument = {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#F8F8F8',
        canvasColor: '#FFFFFF',
        textColor: '#242424',
        fontFamily: 'MODERN_SANS',
        childrenIds: ['block-1709578146127'],
      },
    },
    'block-1709578146127': {
      type: 'Text',
      data: {
        style: {
          fontWeight: 'normal',
          padding: {
            top: 16,
            bottom: 16,
            right: 24,
            left: 24,
          },
        },
        props: {
          text: 'Hello world',
        },
      },
    },
  };

const NewsletterSection: React.FC = () => {
    const [selectedConfig, setSelectedConfig] = useState("One Time Passcode");
    const handleConfigChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedConfig(event.target.value);
    }; 

    const [subject, setSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSendNewsletter = async () => {
        setLoading(true);
        setMessage('');

        const content = renderToStaticMarkup(configurations[selectedConfig], {rootBlockId: 'root'});

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
        setLoading(false);
        }
    };


    return (
        <section className="bg-white shadow rounded-lg p-6 min-h-screen flex gap-2">
            <div className="flex-1 p-4">
                <h2 className="text-lg font-bold mb-4">Select Newsletter</h2>
                <select
                value={selectedConfig}
                onChange={handleConfigChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                >
                    {Object.keys(configurations).map((configName) => (
                        <option key={configName} value={configName}>
                        {configName}
                        </option>
                    ))}
                </select>
                <button 
                    className="bg-gray-200 block w-full my-4 p-2 rounded-lg hover:bg-gray-300 text-center"> 
                    <Link href="\EmailBuilder">
                        Edit Templates
                    </Link>
                </button>
                <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700"></hr>
                <label htmlFor="subject">Subject:</label>
                <input
                    id="subject"
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
                <button onClick={handleSendNewsletter} disabled={loading}
                    className="bg-gray-200 block w-full text-left p-2 rounded-lg hover:bg-gray-300 text-center"> 
                    {loading ? 'Sending...' : 'Send Newsletter'}
                </button>
                {message && <p>{message}</p>}
            </div>

            <div className="flex-1 p-4 bg-gray-100 rounded-lg">
                <Reader document={configurations[selectedConfig]} rootBlockId="root"/>
            </div>
        </section>
    );
};

export default NewsletterSection;