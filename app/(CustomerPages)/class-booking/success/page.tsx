"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { CalendarIcon, ClockIcon, MapPinIcon, UsersIcon, UserIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface BookingDetails {
  success: boolean;
  bookingId: string;
  message: string;
  classDetails: {
    name: string;
    date: string;
    time: string;
    instructor: string;
    location: string;
  };
  session: {
    id: string;
    amount_total: number;
    customer_details: {
      email: string;
      name: string;
      phone?: string;
    };
    payment_status: string;
  };
  class_booking_details?: {
    participants: number;
  };
}

function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      if (!loading) return;
      try {
        const response = await fetch(`/api/class-booking/create-checkout-session?session_id=${sessionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch booking details");
        }

        const data = await response.json();
        setBookingDetails(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        setError("Could not load booking details. Please contact support.");
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId, loading]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return <div className="text-center py-16">Loading booking details...</div>;
  }

  if (error || !bookingDetails) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Could not find booking details"}
        </div>
      </div>
    );
  }

  // Get participants from the right location in the response
  const participants = bookingDetails.class_booking_details?.participants ||
    (bookingDetails as any)?.classDetails?.participants ||
    1; // Default to 1 if not found

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-md shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircleIcon className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-600">
            Your class has been booked successfully. We've sent a confirmation to {bookingDetails.session.customer_details.email}.
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold mb-4">Class Details</h2>

          <div className="bg-blue-50 rounded-md p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              {bookingDetails.classDetails.name}
            </h3>

            <div className="space-y-3">
              <div className="flex items-start">
                <CalendarIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>{formatDate(bookingDetails.classDetails.date)}</span>
              </div>

              <div className="flex items-start">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>{bookingDetails.classDetails.time}</span>
              </div>

              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>{bookingDetails.classDetails.location}</span>
              </div>

              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>Instructor: {bookingDetails.classDetails.instructor}</span>
              </div>

              <div className="flex items-start">
                <UsersIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <span>Participants: {participants}</span>
              </div>

            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">Booking Information</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Booking Reference</p>
                  <p className="font-medium">{bookingDetails.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-medium capitalize">
                    {bookingDetails.session.payment_status === 'paid' ? (
                      <span className="text-green-600">Paid</span>
                    ) : (
                      bookingDetails.session.payment_status
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Name</p>
                  <p className="font-medium">{bookingDetails.session.customer_details.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Email</p>
                  <p className="font-medium">{bookingDetails.session.customer_details.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Paid</p>
                  <p className="font-medium">${(bookingDetails.session.amount_total / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Participants</p>
                  <p className="font-medium">{participants}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Please save this confirmation for your records. We look forward to seeing you in class!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      {/* Your component logic */}
      <BookingSuccessPage />
    </Suspense>
  );
}