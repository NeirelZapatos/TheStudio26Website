"use client";

import React, { useEffect, useState } from "react";
import { format, parseISO, isSameDay } from "date-fns";
import { loadStripe } from "@stripe/stripe-js";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
import Image from "next/image";
import Link from "next/link";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface Lab {
  _id: string;
  name: string;
  price: number;
  description: string;
  date: string;
  time: string;
  duration: number;
  image_url: string;
  location: string;
  max_capacity: number;
  current_participants?: number;
}

interface RentalEquipmentItem {
  _id: string;
  name: string;
  price: number;
}

const Page = () => {
  const [error, setError] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);

  const [bookingStep, setBookingStep] = useState(1)

  // Basic booking states
  const [date, setDate] = useState(new Date());
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Additional inputs state (for additional equipment and comments)
  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false);
  // selectedItems will now store _id strings from rental equipment
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [equipmentQuantities, setEquipmentQuantities] = useState<Record<string, number>>({});

  const [comments, setComments] = useState("");

  // New customer name fields; only needed if "Yes" is selected.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameError, setNameError] = useState("");

  const [isChecked, setIsChecked] = useState(false);
  const [checkboxError, setCheckboxError] = useState("");

  // Fetched rental equipment
  const [rentalEquipment, setRentalEquipment] = useState<RentalEquipmentItem[]>([]);

  const [availableSpots, setAvailableSpots] = useState(0);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const res = await fetch("/api/rentalItems");
        const data = await res.json();
        setRentalEquipment(data);
      } catch (error) {
        console.error("Failed to fetch rental equipment:", error);
      }
    }
    fetchEquipment();
  }, []);

  useEffect(() => {
    async function fetchLabs() {
      try {
        const response = await fetch("/api/lab");
        const data = await response.json();
        setLabs(data);
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    }
    fetchLabs();
  }, []);

  useEffect(() => {
    if (selectedLab) {
      const maxCapacity = selectedLab.max_capacity || 20;
      const currentParticipants = selectedLab.current_participants || 0;
      setAvailableSpots(maxCapacity - currentParticipants);
    }
  }, [selectedLab]);

  const isEnabledDay = (date: Date) => {
    const day = date.getDay();
    // 0 is Sunday, 1 is Monday, 4 is Thursday
    return day === 0 || day === 1 || day === 4;
  };

  const handleDateChange = (newDate: any) => {
    if (isEnabledDay(newDate)) {
      setDate(newDate);
      setSelectedLab(null);
    }
  };

  const handleLabSelection = (lab: Lab) => {
    setSelectedLab(lab);
    setDate(parseISO(lab.date));
  };

  const handleParticipantsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && selectedLab) {
      const newValue = Math.max(1, Math.min(value, availableSpots));
      setQuantity(newValue);
    }
  };

  const incrementParticipants = () => {
    if (quantity < availableSpots) {
      setQuantity((prev) => prev + 1);
    }
  }

  const decrementParticipants = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  }

  const changeEquipmentQuantity = (itemId: string, newQuantity: number) => {
    // Ensure quantity doesn't exceed participants
    const validQuantity = Math.min(Math.max(1, newQuantity), quantity);

    setEquipmentQuantities(prev => ({
      ...prev,
      [itemId]: validQuantity
    }));
  };

  const incrementEquipmentQuantity = (itemId: string) => {
    setEquipmentQuantities(prev => {
      const currentQty = prev[itemId] || 1;
      // Don't exceed participant count
      if (currentQty < quantity) {
        return {
          ...prev,
          [itemId]: currentQty + 1
        };
      }
      return prev;
    });
  };

  const decrementEquipmentQuantity = (itemId: string) => {
    setEquipmentQuantities(prev => {
      const currentQty = prev[itemId] || 1;
      if (currentQty > 1) {
        return {
          ...prev,
          [itemId]: currentQty - 1
        };
      }
      return prev;
    });
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const hasLab = labs.some((lab) => {
        const labDate = parseISO(lab.date);
        return isSameDay(date, labDate);
      });
      if (hasLab) {
        return <div className="bg-green-300 rounded-full w-2 h-2 mx-auto mt-1"></div>;
      }
    }
    return null;
  };

  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      return !isEnabledDay(date);
    }
    return false;
  };

  const getLabsForSelectedDate = () => {
    const selectedDateUTC = format(date, "yyyy-MM-dd");
    return labs.filter((lab) => {
      const labDateUTC = format(parseISO(lab.date), "yyyy-MM-dd");
      return labDateUTC === selectedDateUTC;
    });
  };

  // Toggle selection for rental equipment (using _id string)
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prevSelected) => {
      if (prevSelected.includes(itemId)) {
        // Remove item from selected items
        const newSelected = prevSelected.filter((id) => id !== itemId);

        // Also remove its quantity
        setEquipmentQuantities(prev => {
          const newQuantities = { ...prev };
          delete newQuantities[itemId];
          return newQuantities;
        });

        return newSelected;
      } else {
        // Add item with default quantity of 1
        setEquipmentQuantities(prev => ({
          ...prev,
          [itemId]: 1
        }));
        return [...prevSelected, itemId];
      }
    });
  };

  // Proceed to details step
  const proceedToDetails = () => {
    if (!selectedLab) {
      alert("Please select a lab first");
      return;
    }

    setBookingStep(2);
  };

  // Proceed to review step
  const proceedToReview = () => {
    if (!isChecked) {
      setCheckboxError("Please confirm that you understand the materials policy.");
      return;
    }

    if (showAdditionalInputs && (!firstName.trim() || !lastName.trim())) {
      setNameError("Please enter both first and last name");
      return;
    }

    setNameError("");
    setBookingStep(3);
  };

  // Go back to previous step
  const goBack = () => {
    if (bookingStep > 1) {
      setBookingStep(bookingStep - 1);
    }
  };

  // Calculate total from selected equipment
  const selectedItemsTotal = selectedItems.reduce((total, id) => {
    const equipment = rentalEquipment.find((item) => item._id === id);
    const itemQuantity = equipmentQuantities[id] || 1;
    return total + (equipment ? equipment.price * itemQuantity : 0);
  }, 0);

  // Final total: lab total + additional equipment total (if additional inputs are shown)
  const finalTotal =
    (selectedLab?.price ?? 0) * quantity + (showAdditionalInputs ? selectedItemsTotal : 0);

  // Final checkout process
  const handleSubmit = async () => {
    if (!selectedLab) return;

    const additionalItems = showAdditionalInputs ? selectedItems : [];
    const additionalComments = showAdditionalInputs ? comments : "";

    setIsProcessing(true);

    // Send email if additional details exist.
    if (
      showAdditionalInputs &&
      (additionalItems.length > 0 || additionalComments.trim().length > 0)
    ) {
      const emailPayload = {
        labId: selectedLab._id,
        labName: selectedLab.name,
        bookingDate: format(date, "yyyy-MM-dd"),
        quantity,
        selectedItems,
        equipmentQuantities,
        comments: additionalComments,
        total: finalTotal,
        customerName: `${firstName} ${lastName}`,
      };
      try {
        const emailResponse = await fetch("/api/sendBookingEmail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(emailPayload),
        });
        if (!emailResponse.ok) {
          console.error("Email sending failed", await emailResponse.json());
        }
      } catch (error) {
        console.error("Error sending booking email:", error);
      }
    }

    const contactInfo = {
      firstName: showAdditionalInputs ? firstName : "",
      lastName: showAdditionalInputs ? lastName : "",
      participants: quantity,
    };

    try {
      const response = await fetch('/api/lab-booking/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          labBooking: {
            labId: selectedLab._id,
            name: selectedLab.name,
            price: selectedLab.price,
            quantity: quantity,
            date: selectedLab.date,
            time: selectedLab.time,
            image_url: selectedLab.image_url,
            description: selectedLab.description,
            type: 'lab',
            ...(showAdditionalInputs && {
              rentalEquipment: selectedItems,
              rentalEquipmentQuantities: equipmentQuantities,
              comments: comments
            })
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

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Book Your Lab</h1>

      {/* Errors */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {bookingStep === 1 ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Available Lab Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">All Available Labs</h2>
            <div className="max-h-[500px] overflow-y-auto">
              {labs.length > 0 ? (
                labs.map((lab) => (
                  <div
                    key={lab._id}
                    className={`p-4 mb-3 border rounded-lg cursor-pointer transition hover:bg-gray-50 ${selectedLab?._id === lab._id ? "bg-blue-50 border-blue-300" : ""
                      }`}
                    onClick={() => handleLabSelection(lab)}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-16 h-16 mr-4">
                        <img
                          src={lab.image_url || "/placeholder-image.jpg"}
                          alt={lab.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{lab.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(lab.date), "EEEE, MMMM d")} at {lab.time}
                        </p>
                        <p className="font-medium mt-1">${lab.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No labs available.</p>
              )}
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Select a Date</h2>
            <Calendar
              onChange={handleDateChange}
              value={date}
              tileContent={tileContent}
              tileDisabled={tileDisabled}
              className="mx-auto"
            />

            {/* Labs for selected date */}
            <div className="mt-8">
              <h3 className="font-semibold mb-3">
                Labs on {format(date, "EEEE, MMMM d")}:
              </h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {getLabsForSelectedDate().length > 0 ? (
                  getLabsForSelectedDate().map((lab) => (
                    <div
                      key={lab._id}
                      className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${selectedLab?._id === lab._id ? "bg-blue-50 border-blue-300" : ""
                        }`}
                      onClick={() => setSelectedLab(lab)}
                    >
                      <p className="font-medium">{lab.name}</p>
                      <p className="text-sm text-gray-600">{lab.time} - {lab.duration} hrs</p>
                    </div>
                  ))


                ) : (
                  <p className="text-gray-500">No labs available on this date.</p>
                )}
              </div>

              {/* Continue button that appears when a lab is selected */}
              {selectedLab && (
                <div className="mt-4">
                  <button
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    onClick={proceedToDetails}
                  >
                    Continue with Selected Lab
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      ) : bookingStep === 2 ? (
        <div className="max-w-5xl mx-auto p-4">

          <button
            onClick={goBack}
            className="mb-4 text-blue-600 hover:underline flex items-center"
          >
            <span>← Back to lab selection</span>
          </button>

          {selectedLab && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Side: Booking Details Section */}
              <div className="md:col-span-2 bg-white rounded-md shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] overflow-hidden">
                <div className="relative h-64 w-full">
                  {selectedLab.image_url && (
                    <div className="absolute inset-0">
                      <Image
                        src={selectedLab.image_url}
                        alt={selectedLab.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="text-lg font-semibold mb-2">{selectedLab.name}</h2>
                  <p className="text-gray-600 mb-4">{selectedLab.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-700">Date & Time</h3>
                      <p>{format(parseISO(selectedLab.date), "EEEE, MMMM d, yyyy")}</p>
                      <p>{selectedLab.time} ({selectedLab.duration} hours)</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Location</h3>
                      <p>{selectedLab.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <h3 className="font-medium text-gray-700">Price</h3>
                      <p className="text-gray-700">${selectedLab.price.toFixed(2)} per person</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700">Availability</h3>
                      <p>{(selectedLab.max_capacity || 0) - (selectedLab.current_participants || 0)} spots remaining</p>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox border-blue-600"
                        checked={isChecked}
                        onChange={(e) => {
                          setIsChecked(e.target.checked);
                          if (e.target.checked) {
                            setCheckboxError("");
                          }
                        }}
                      />
                      <span className="label-text font-semibold">
                        I understand that I am responsible for bringing your own materials.
                      </span>
                    </label>
                    {checkboxError && (
                      <p className="text-red-500 text-sm mt-1">{checkboxError}</p>
                    )}
                  </div>

                  <p className="mt-4">
                    Do you need to rent additional equipment or leave special requests?
                  </p>
                  <div className="mt-2 flex items-center">
                    <label className="mr-4 flex items-center">
                      <input
                        type="radio"
                        name="needAdditional"
                        value="yes"
                        checked={showAdditionalInputs}
                        onChange={() => setShowAdditionalInputs(true)}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="needAdditional"
                        value="no"
                        checked={!showAdditionalInputs}
                        onChange={() => {
                          setShowAdditionalInputs(false);
                          setSelectedItems([]);
                          setEquipmentQuantities({});
                          setComments("");
                          setFirstName("");
                          setLastName("");
                          setNameError("");
                        }}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>

                  {showAdditionalInputs && (
                    <div className="mt-4">
                      <div className="mb-4">
                        <label className="block font-semibold mb-1">
                          First Name: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (e.target.value.trim() && lastName.trim()) {
                              setNameError("");
                            }
                          }}
                          className="border p-2 rounded w-full"
                        />
                        <label className="block font-semibold mt-3 mb-1">
                          Last Name: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (firstName.trim() && e.target.value.trim()) {
                              setNameError("");
                            }
                          }}
                          className="border p-2 rounded w-full"
                        />
                        {nameError && (
                          <p className="text-red-500 text-sm mt-1">{nameError}</p>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold mt-4">Select Equipment:</h3>
                      <div className="space-y-2 mt-2">
                        {rentalEquipment.map((item) => (
                          <div
                            key={item._id}
                            className="p-2 border rounded hover:bg-gray-50"
                          >
                            <div className="flex items-center justify-between">
                              <label className="flex items-center cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  value={item._id}
                                  checked={selectedItems.includes(item._id)}
                                  onChange={() => toggleItemSelection(item._id)}
                                  className="mr-2"
                                />
                                <span>
                                  {item.name} - <strong>${item.price.toFixed(2)}</strong>
                                </span>
                              </label>

                              {/* Display quantity selector if item is selected */}
                              {selectedItems.includes(item._id) && (
                                <div className="flex items-center">
                                  <button
                                    type="button"
                                    className="px-2 py-1 bg-gray-200 rounded-l text-gray-700"
                                    onClick={() => decrementEquipmentQuantity(item._id)}
                                    disabled={(equipmentQuantities[item._id] || 1) <= 1}
                                  >
                                    -
                                  </button>
                                  <span className="px-3 py-1 bg-gray-100">
                                    {equipmentQuantities[item._id] || 1}
                                  </span>
                                  <button
                                    type="button"
                                    className="px-2 py-1 bg-gray-200 rounded-r text-gray-700"
                                    onClick={() => incrementEquipmentQuantity(item._id)}
                                    disabled={(equipmentQuantities[item._id] || 1) >= quantity}
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <label className="block font-semibold mb-1">
                          Special Requests / Comments:
                        </label>
                        <textarea
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Enter any special requests or additional details here"
                          className="border p-2 rounded w-full h-24"
                        />
                      </div>
                      <p className="font-bold mt-4">
                        Updated Total: $
                        {(selectedLab.price * quantity + selectedItemsTotal).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="form-control mb-6">
                    <label className="label">
                      <span className="label-text text-sm font-medium text-gray-700">
                        Number of Participants
                      </span>
                    </label>

                    <div className="join">
                      <button
                        type="button"
                        className="join-item btn bg-blue-600 hover:bg-blue-800 text-white text-xl"
                        disabled={quantity <= 1}
                        onClick={decrementParticipants}
                      >
                        -
                      </button>

                      <input
                        type="number"
                        id="participants"
                        name="participants"
                        min="1"
                        className="join-item input input-bordered text-center w-16 focus:outline-none appearance-none"
                        value={quantity}
                        max={availableSpots}
                        onChange={handleParticipantsChange}
                        required
                        style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                      />

                      {availableSpots <= quantity ? (
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
                          onClick={incrementParticipants}
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue to Review */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-md px-4 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] sticky top-4">
                  <h2 className="text-2xl font-semibold text-center mb-4">Booking Summary</h2>
                  <hr className="py-2"></hr>
                  <ul className="text-slate-900 space-y-4">
                    <li className="flex justify-between text-base text-left">
                      <span>{selectedLab.name}</span>
                    </li>
                    <li className="flex justify-between text-base">
                      <span>Date</span>
                      <span>{format(parseISO(selectedLab.date), "MMM d, yyyy")}</span>
                    </li>
                    <li className="flex justify-between text-base">
                      <span>Time</span>
                      <span>{selectedLab.time}</span>
                    </li>
                    <li className="flex justify-between text-base">
                      <span>Price per person</span>
                      <span>${selectedLab.price.toFixed(2)}</span>
                    </li>
                    <li className="flex justify-between text-base">
                      <span>Participants</span>
                      <span>{quantity}</span>
                    </li>

                    {showAdditionalInputs && selectedItems.length > 0 && (
                      <li>
                        <div className="font-medium">Equipment Items:</div>
                        <ul className="text-sm mt-1 space-y-1">
                          {selectedItems.map(itemId => {
                            const item = rentalEquipment.find(eq => eq._id === itemId);
                            const itemQty = equipmentQuantities[itemId] || 1;
                            return item ? (
                              <li key={itemId} className="flex justify-between">
                                <span>{item.name} x{itemQty}</span>
                                <span>${(item.price * itemQty).toFixed(2)}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </li>
                    )}

                    <li className="flex justify-between text-xl font-semibold border-t border-gray-200 pt-4 mt-4">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </li>
                  </ul>

                  <button
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    onClick={proceedToReview}
                  >
                    Review Booking
                  </button>

                  {/* Back to Classes Button */}
                  <Link href="/OpenLab">
                    <div className="text-center mt-4">
                      <span className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                        View All Labs
                      </span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : bookingStep === 3 ? (
        <div className="max-w-7xl mx-auto">
          {/* Review page with grid layout */}
          {selectedLab && (
            <div className="grid md:grid-cols-3 gap-6">
              {/* Back button */}
              <div className="md:col-span-3">
                <button
                  onClick={goBack}
                  className="mb-4 text-blue-600 hover:underline flex items-center"
                >
                  <span>← Back to booking details</span>
                </button>
              </div>

              {/* Left column: Order Review */}
              <div className="md:col-span-2 bg-white rounded-md px-6 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)]">
                <h2 className="text-xl font-semibold mb-4">Order Review</h2>

                {/* Customer Information */}
                {showAdditionalInputs && (
                  <div className="mb-6">
                    <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p><span className="font-medium">Name:</span> {firstName} {lastName}</p>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-2">Order Summary</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-start mb-4">
                      <div className="flex-shrink-0 w-16 h-16 mr-4">
                        <img
                          src={selectedLab.image_url || "/placeholder-image.jpg"}
                          alt={selectedLab.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedLab.name}</h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(selectedLab.date), "EEEE, MMMM d")} at {selectedLab.time}
                        </p>
                        <p className="text-sm text-gray-600">Location: {selectedLab.location}</p>
                      </div>
                    </div>

                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td className="py-1 pr-4">Lab Session</td>
                          <td className="py-1 text-right">{quantity} × ${selectedLab.price.toFixed(2)}</td>
                          <td className="py-1 text-right pl-4">${(quantity * selectedLab.price).toFixed(2)}</td>
                        </tr>

                        {showAdditionalInputs && selectedItems.length > 0 && (
                          <>
                            <tr>
                              <td colSpan={3} className="pt-2 pb-1 font-medium">Additional Equipment:</td>
                            </tr>
                            {selectedItems.map((itemId) => {
                              const item = rentalEquipment.find(equipment => equipment._id === itemId);
                              return item ? (
                                <tr key={item._id}>
                                  <td className="py-1 pr-4 pl-4">- {item.name}</td>
                                  <td className="py-1 text-right">1 × ${item.price.toFixed(2)}</td>
                                  <td className="py-1 text-right pl-4">${item.price.toFixed(2)}</td>
                                </tr>
                              ) : null;
                            })}
                          </>
                        )}

                        <tr className="border-t border-gray-200">
                          <td className="py-2 font-medium" colSpan={2}>Total</td>
                          <td className="py-2 text-right pl-4 font-medium">${finalTotal.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>

                    {showAdditionalInputs && comments && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium mb-1">Special Requests / Comments:</h4>
                        <p className="text-sm text-gray-600">{comments}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Final Summary */}
              <div>
                <div className="bg-white rounded-md px-4 py-6 shadow-[0_2px_12px_-3px_rgba(61,63,68,0.3)] sticky top-4">
                  <h2 className="text-2xl text-center font-semibold mb-4">Final Summary</h2>
                  <hr className="mb-4"></hr>
                  <ul className="text-slate-900 space-y-4">
                    <li className="flex justify-between text-base text-left">
                      <span>{selectedLab.name}</span>
                    </li>
                    <li className="flex justify-between text-base">
                      <span>Date</span>
                      <span>{format(parseISO(selectedLab.date), "MMM d, yyyy")}</span>
                    </li>
                    <li className="flex justify-between text-base">
                      <span>Participants</span>
                      <span>{quantity}</span>
                    </li>

                    {showAdditionalInputs && selectedItems.length > 0 && (
                      <li>
                        <div className="font-medium">Equipment Items:</div>
                        <ul className="text-sm mt-1 space-y-1">
                          {selectedItems.map(itemId => {
                            const item = rentalEquipment.find(eq => eq._id === itemId);
                            const itemQty = equipmentQuantities[itemId] || 1;
                            return item ? (
                              <li key={itemId} className="flex justify-between">
                                <span>{item.name} x{itemQty}</span>
                                <span>${(item.price * itemQty).toFixed(2)}</span>
                              </li>
                            ) : null;
                          })}
                        </ul>
                      </li>
                    )}

                    <li className="flex justify-between text-xl font-semibold border-t border-gray-200 pt-4 mt-4">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </li>
                  </ul>

                  <button
                    type="button"
                    className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={handleSubmit}
                    disabled={isProcessing}
                  >
                    Proceed to Checkout
                  </button>

                </div>

                {/* Back to Classes Button */}
                <Link href="/OpenLab">
                  <div className="text-center mt-4">
                    <span className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer">
                      View All Labs
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default Page;