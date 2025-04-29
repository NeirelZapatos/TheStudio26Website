"use client"

import { useRouter } from 'next/navigation';
import React from 'react';

interface BookNowButtonProps {
  classId: string;
  disabled?: boolean;
}

function BookNowButton({ classId, disabled = false }: BookNowButtonProps) {
  const router = useRouter();

  const handleBookNow = () => {
    router.push(`/class-booking?id=${classId}`);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      className={`w-full px-4 py-2 text-white font-semibold rounded-md transition-all duration-200 ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-blue-600 hover:bg-blue-700"
        }`}
      onClick={()=> {
        if (!disabled) {
          handleBookNow()
          console.log(`Booking class with ID: ${classId}`);
        }
      }}
    >
      {disabled ? "Class Unavailable" : "Book Now" }
    </button>
  );
}

export default BookNowButton;