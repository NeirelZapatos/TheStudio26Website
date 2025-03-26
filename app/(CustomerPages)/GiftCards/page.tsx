"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';

const GiftCardPage = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Only load on client side
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.giftup.app/dist/gift-up.js';
      script.async = true;
      
      // Initialize GiftUp after script loads
      script.onload = () => {
        (window as any).giftup = (window as any).giftup || function() {
          ((window as any).giftup.q = (window as any).giftup.q || []).push(arguments);
        };
        
        // Initialize the widget
        (window as any).giftup('init', {
          siteId: '333f27fd-2893-4ac4-cc28-08dd62e94d87',
          platform: 'Other',
          language: 'en-US'
        });
      };
      
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Gift Cards - The Studio 26</title>
        <meta name="description" content="Purchase gift cards for The Studio 26 jewelry-making classes and more." />
      </Head>
      <main className="my-8">
        {/* GiftUp widget container */}
        {isClient && (
          <div 
            className="gift-up-target"
            data-site-id="333f27fd-2893-4ac4-cc28-08dd62e94d87"
            data-platform="Other"
            data-language="en-US"
          />
        )}
      </main>
    </>
  );
};

export default GiftCardPage;