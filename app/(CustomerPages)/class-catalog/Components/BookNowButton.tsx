"use client"

import { useRouter } from 'next/navigation';
import React from 'react';

interface BookNowButtonProps {
  classId: string;
}

function BookNowButton({ classId }: BookNowButtonProps) {
  const router = useRouter();

  const handleBookNow = () => {
    router.push(`/class-booking?id=${classId}`);
  };

  return (
    <button
      onClick={handleBookNow}
      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200"
    >
      Book Now
    </button>
  );
}

export default BookNowButton;