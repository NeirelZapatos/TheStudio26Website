"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface ClassDetails {
  _id: string;
  name: string;
  price: number;
  description: string;
  date: string;
  time: string;
  duration: number;
  image_url: string;
  instructor: string;
  location: string;
  max_capacity: number;
  current_participants?: number;
}

interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  participants: number;
}

export default function ClassBookingPage() {
  const searchParams = useSearchParams();
  const classId = searchParams.get('id');

  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableSpots, setAvailableSpots] = useState(0);

  // * Contact Info
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    participants: 1,
  });

  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error while typing
    if (isEmailValid === false) {
      setIsEmailValid(true);
    }
  };

  const validateEmail = () => {
    if (contactInfo.email) {
      // Basic email regex that checks for @ and domain with at least 2 chars
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      setIsEmailValid(emailRegex.test(contactInfo.email));
    }
  };

  // const formatPhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
  //   const { name, value } = e.target;

  //   // Format the phone number
  //   let formattedValue = '';
  //   if (input.length > 0) {
  //     formattedValue = `(${input.substring(0, 3)}`;
  //   }
  //   if (input.length > 3) {
  //     formattedValue += `) ${input.substring(3, 6)}`;
  //   }
  //   if (input.length > 6) {
  //     formattedValue += `-${input.substring(6, 10)}`;
  //   }

  //   // Update state
  //   setContactInfo(prev => ({
  //     ...prev,
  //     [name]: formattedValue
  //   }));
  // };

  // const validateContactInfo = () => {
  //   if (!contactInfo.firstName || !contactInfo.lastName) {
  //     setError("Please provide your full name");
  //     return false;
  //   }

  //   if (!contactInfo.email && !contactInfo.phone) {
  //     setError("Please provide either email or phone number");
  //     return false;
  //   }

  //   if (contactInfo.participants <= 0) {
  //     setError("Number of participants must be at least 1");
  //     return false;
  //   }

  //   if (contactInfo.participants > availableSpots) {
  //     setError(`Only ${availableSpots} spots available`);
  //     return false;
  //   }

  //   setError(null);
  //   return true;
  // };

  // Fetch class data on component mount
  useEffect(() => {
    if (!classId) {
      setError("No class selected");
      setLoading(false);
      return;
    }

    const fetchClassDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${classId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch class details");
        }

        const data = await response.json();
        setClassDetails(data);

        // Calculate available spots
        const currentParticipants = data.current_participants || 0;
        const availableCount = data.max_capacity - currentParticipants;
        setAvailableSpots(availableCount);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching class details:", err);
        setError("Could not load class details. Please try again later.");
        setLoading(false);
      }
    };

    fetchClassDetails();
  }, [classId]);

  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({
      ...prev,
      [name]: name === 'participants' ? Math.max(1, parseInt(value) || 1) : value,
    }));
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    // Validate form
    if (!contactInfo.firstName || !contactInfo.lastName) {
      setError("Please provide your full name");
      setIsProcessing(false);
      return;
    }

    if (!contactInfo.email && !contactInfo.phone) {
      setError("Please provide either email or phone number");
      setIsProcessing(false);
      return;
    }

    if (contactInfo.participants <= 0) {
      setError("Number of participants must be at least 1");
      setIsProcessing(false);
      return;
    }

    if (contactInfo.participants > availableSpots) {
      setError(`Only ${availableSpots} spots available`);
      setIsProcessing(false);
      return;
    }

    if (!classDetails) {
      setError("Class details not available");
      setIsProcessing(false);
      return;
    }

    try {
      const response = await fetch('/api/class-booking/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classBooking: {
            classId: classDetails._id,
            name: classDetails.name,
            price: classDetails.price,
            quantity: contactInfo.participants,
            date: classDetails.date,
            time: classDetails.time,
            image_url: classDetails.image_url,
            type: 'class',
          },
          contactInfo: contactInfo,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to create checkout session');
      }

      const { id: sessionId } = await response.json();

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
      console.error('Booking checkout error:', err);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16">Loading class details...</div>;
  }

  if (!classDetails) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Class not found"}
        </div>
        <Link href="/class-catalog">
          <div className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            View All Classes
          </div>
        </Link>
      </div>
    );
  }

  const totalPrice = classDetails.price * contactInfo.participants;

  const formattedTime = classDetails.time
  ? new Date(`1970-01-01T${classDetails.time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    })
  : null;
  
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Book Your Class</h1>

      {/* Errors */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-10">
        {/* Left Side: Class Details */}
        <div className="md:col-span-2 bg-white rounded-md shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] overflow-hidden">
          <div className="relative h-64 w-full">
            {classDetails.image_url && (
              <div className="absolute inset-0">
                <Image
                  src={classDetails.image_url}
                  alt={classDetails.name}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">{classDetails.name}</h2>
            <p className="text-gray-600 mb-4">{classDetails.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium text-gray-700">Date & Time</h3>
                <p>{formatDate(classDetails.date)}</p>
                <p>{formattedTime} ({classDetails.duration} hours)</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Location</h3>
                <p>{classDetails.location}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium text-gray-700">Instructor</h3>
                <p>{classDetails.instructor}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700">Availability</h3>
                <p>{availableSpots} spots remaining</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-medium text-gray-700 mb-4">Participant Details</h3>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name*
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={contactInfo.firstName}
                      onChange={handleInfoChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name*
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={contactInfo.lastName}
                      onChange={handleInfoChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`w-full p-2 border ${!isEmailValid && contactInfo.email ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    value={contactInfo.email}
                    onChange={handleEmailChange}
                    onBlur={validateEmail}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {!contactInfo.phone && "Either email or phone is required"}
                  </p>
                </div>

                <div className="mb-4">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={contactInfo.phone}
                    onChange={handleInfoChange}
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {!contactInfo.email && "Either email or phone is required"}
                  </p>
                </div>

                <div className="form-control mb-6">
                  <label className="label">
                    <span className="label-text text-sm font-medium text-gray-700">
                      Number of Participants*
                    </span>
                  </label>

                  <div className="join">
                    {contactInfo.participants <= 1 ? (
                      <button
                        type="button"
                        className="join-item btn bg-gray-400 cursor-not-allowed text-white text-xl"
                        disabled={true}
                      >
                        -
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="join-item btn bg-blue-600 hover:bg-blue-800 text-white text-xl"
                        onClick={() => setContactInfo(prev => ({
                          ...prev,
                          participants: Math.max(1, prev.participants - 1)
                        }))}
                      >
                        -
                      </button>
                    )}

                    <input
                      type="number"
                      id="participants"
                      name="participants"
                      min="1"
                      max={availableSpots}
                      className="join-item input input-bordered text-center w-16 focus:outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={contactInfo.participants}
                      onChange={handleInfoChange}
                      required
                      style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                    />

                    {contactInfo.participants >= availableSpots ? (
                      <button
                        type="button"
                        className="join-item btn bg-gray-400 cursor-not-allowed text-white text-xl"
                        disabled={true}
                      >
                        +
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="join-item btn bg-blue-600 hover:bg-blue-800 text-white text-xl"
                        onClick={() => setContactInfo(prev => ({
                          ...prev,
                          participants: Math.min(availableSpots, prev.participants + 1)
                        }))}
                      >
                        +
                      </button>
                    )}
                  </div>

                  <label className="label">
                    <span className="label-text-alt text-gray-500">
                      Maximum {availableSpots} participants available
                    </span>
                  </label>
                </div>

              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Booking Summary */}
        <div>
          <div className="bg-white rounded-md px-4 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] sticky top-[80px]">
            <h2 className="text-2xl text-center font-semibold mb-4">Booking Summary</h2>
            <hr className="py-2"></hr>
            <ul className="text-slate-900 space-y-4">
              <li className="flex justify-between text-base text-left">
                <span>{classDetails.name}</span>
              </li>
              <li className="flex justify-between text-base">
                <span>Date</span>
                <span>{formatDate(classDetails.date)}</span>
              </li>
              <li className="flex justify-between text-base">
                <span>Time</span>
                <span>{formattedTime}</span>
              </li>
              <li className="flex justify-between text-base">
                <span>Price per person</span>
                <span>${classDetails.price.toFixed(2)}</span>
              </li>
              <li className="flex justify-between text-base">
                <span>Participants</span>
                <span>{contactInfo.participants}</span>
              </li>
              <li className="flex justify-between text-xl font-semibold border-t border-gray-200 pt-4 mt-4">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </li>
            </ul>

            <button
              onClick={handleSubmit}
              disabled={isProcessing || availableSpots === 0}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : 'Book Now'}
            </button>

            {availableSpots === 0 && (
              <p className="text-red-600 text-center mt-2">This class is fully booked</p>
            )}

            {/* Back to Classes Button */}
            <Link href="/course-catalog">
              <div className="text-center mt-4">
                <span className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                  View All Classes
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}