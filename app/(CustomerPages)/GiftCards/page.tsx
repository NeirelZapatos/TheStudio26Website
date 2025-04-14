"use client";
import Head from 'next/head';
import { useEffect } from 'react';

declare global {
  interface Window {
    giftup?: (command: string, ...args: any[]) => void;
  }
}

const GiftCardPage = () => {
  useEffect(() => {
    // Load Gift Up! script
    const script = document.createElement('script');
    script.src = 'https://cdn.giftup.app/dist/gift-up.js';
    script.async = true;
    script.onload = () => {
      // Initialize Gift Up! after script loads
      if (window.giftup) {
        window.giftup('init', { site_id: '333f27fd-2893-4ac4-cc28-08dd62e94d87' });
      }
    };
    document.head.appendChild(script);

    // Clean up on component unmount
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>Gift Cards</title>
      </Head>
      <div className="container mx-auto py-8">
        <div className="gift-card-container">
          {/* Gift Up! integration div */}
          <div 
            className="gift-up-target" 
            data-site-id="333f27fd-2893-4ac4-cc28-08dd62e94d87" 
            data-platform="Other"
          ></div>
        </div>
      </div>
    </>
  );
};

export default GiftCardPage;