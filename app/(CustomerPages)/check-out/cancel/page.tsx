'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div>
      <h1>Payment Canceled</h1>
      <p>Session ID: {sessionId}</p>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Your component logic */}
      <SuccessPage />
    </Suspense>
  );
}