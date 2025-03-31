"use client";

import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
import { format, parseISO, isSameDay } from "date-fns";
import { useRouter } from "next/navigation";

interface Lab {
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
}

interface RentalEquipmentItem {
  _id: string;
  name: string;
  price: number;
}

const Page = () => {
  const router = useRouter();

  // Basic booking states
  const [date, setDate] = useState(new Date());
  const [labs, setLabs] = useState<Lab[]>([]);
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Additional inputs state (for additional equipment and comments)
  const [showAdditionalInputs, setShowAdditionalInputs] = useState(false);
  // selectedItems will now store _id strings from rental equipment
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [comments, setComments] = useState("");

  // New customer name fields; only needed if "Yes" is selected.
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameError, setNameError] = useState(""); // Error state for name fields

  // Fetched rental equipment
  const [rentalEquipment, setRentalEquipment] = useState<RentalEquipmentItem[]>([]);

  // Fetch rental equipment from your API (collection)
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

  // Fetch labs
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

  const handleDateChange = (newDate: any) => {
    setDate(newDate);
    console.log("Selected date:", newDate);
  };

  const handleParticipantsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newParticipants = Math.max(1, parseInt(event.target.value, 10));
    setQuantity(newParticipants);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month") {
      const hasLab = labs.some((lab) => {
        const labDate = parseISO(lab.date);
        return isSameDay(date, labDate);
      });
      if (hasLab) {
        return <div className="bg-blue-500 text-white p-1 rounded-full">Lab</div>;
      }
    }
    return null;
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
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  // Calculate total from selected equipment
  const selectedItemsTotal = selectedItems.reduce((total, id) => {
    const equipment = rentalEquipment.find((item) => item._id === id);
    return total + (equipment ? equipment.price : 0);
  }, 0);

  // Final total: lab total + additional equipment total (if additional inputs are shown)
  const finalTotal =
    (selectedLab?.price ?? 0) * quantity + (showAdditionalInputs ? selectedItemsTotal : 0);

  // Final checkout process
  const handleCheckout = async () => {
    if (!selectedLab) return;
    // Validate name fields if additional inputs are shown.
    if (showAdditionalInputs) {
      if (!firstName.trim() || !lastName.trim()) {
        setNameError("Please enter your first and last name.");
        return;
      }
    }
    // Clear any previous errors if validation passes.
    setNameError("");

    const additionalItems = showAdditionalInputs ? selectedItems : [];
    const additionalComments = showAdditionalInputs ? comments : "";

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

    // Add booking to the cart.
    const cartPayload = {
      labId: selectedLab._id,
      labName: selectedLab.name,
      quantity,
      selectedItems,
      comments: additionalComments,
      total: finalTotal,
      bookingDate: format(date, "yyyy-MM-dd"),
      customerName: showAdditionalInputs ? `${firstName} ${lastName}` : "",
    };

    try {
      const cartResponse = await fetch("/api/addToCart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartPayload),
      });
      if (cartResponse.ok) {
        // Clear booking state and redirect.
        setSelectedLab(null);
        setQuantity(1);
        setSelectedItems([]);
        setComments("");
        setShowAdditionalInputs(false);
        setFirstName("");
        setLastName("");
        router.push("/cart");
      } else {
        console.error("Failed to add booking to cart", await cartResponse.json());
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Calendar Section */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Select a Date</h2>
          <Calendar
            onChange={handleDateChange}
            value={date}
            tileContent={({ date }) => {
              const hasLab = labs.some((lab) =>
                isSameDay(parseISO(lab.date), date)
              );
              return hasLab ? <div>*</div> : null;
            }}
          />
        </div>

        {/* Available Lab Section */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Available Labs</h2>
          {getLabsForSelectedDate().length > 0 ? (
            getLabsForSelectedDate().map((lab) => (
              <div
                key={lab._id}
                className={`p-4 border rounded-lg cursor-pointer ${
                  selectedLab?._id === lab._id ? "bg-gray-200" : ""
                }`}
                onClick={() => setSelectedLab(lab)}
              >
                <h3 className="text-lg font-semibold">{lab.name}</h3>
                <p className="text-gray-600">
                  {lab.time} - {lab.duration} hrs
                </p>
                <p className="text-gray-500">Instructor: {lab.instructor}</p>
              </div>
            ))
          ) : (
            <p>No labs available on this date.</p>
          )}
        </div>

        {/* Booking Summary Section */}
        {selectedLab && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
            <img
              src={selectedLab.image_url}
              alt={selectedLab.name}
              className="w-full h-40 object-cover rounded"
            />
            <h3 className="text-lg font-semibold mt-2">{selectedLab.name}</h3>
            <p className="text-gray-600">{selectedLab.description}</p>
            <p className="text-gray-500">Location: {selectedLab.location}</p>
            <p className="text-gray-500">Instructor: {selectedLab.instructor}</p>
            <p className="text-gray-500">
              Time: {selectedLab.time} - {selectedLab.duration} hrs
            </p>
            <p className="text-gray-700 font-bold mt-2">
              ${selectedLab.price.toFixed(2)} per person
            </p>

            {/* Participants Input */}
            <label className="block mt-2 font-semibold">Participants:</label>
            <input
              type="number"
              min="1"
              max={selectedLab.max_capacity}
              value={quantity}
              onChange={handleParticipantsChange}
              className="border p-2 rounded w-full"
            />


            <p className="font-bold mt-2">
              Total: ${finalTotal.toFixed(2)}
            </p>

            {/* Additional Options */}
            <div className="mt-6 border-t pt-4">
              <p className="font-semibold">
                You are responsible for bringing your own materials.
              </p>
              {showAdditionalInputs && (
                <div className="mt-4">
                  <label className="block font-semibold">
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
                    className="input input-bordered w-full"
                  />
                  <label className="block font-semibold mt-2">
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
                    className="input input-bordered w-full"
                  />
                  {nameError && (
                    <p className="text-red-500 text-sm mt-1">{nameError}</p>
                  )}
                </div>
              )}
              <p className="mt-2">
                Do you need to rent additional equipment or leave special requests?
              </p>
              <div className="mt-2">
                <label className="mr-4">
                  <input
                    type="radio"
                    name="needAdditional"
                    value="yes"
                    onChange={() => setShowAdditionalInputs(true)}
                  />{" "}
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="needAdditional"
                    value="no"
                    onChange={() => {
                      setShowAdditionalInputs(false);
                      setSelectedItems([]);
                      setComments("");
                    }}
                    defaultChecked
                  />{" "}
                  No
                </label>
              </div>

              {showAdditionalInputs && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">Select Equipment:</h3>
                  <div className="space-y-2">
                    {rentalEquipment.map((item) => (
                      <label
                        key={item._id}
                        className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          value={item._id}
                          checked={selectedItems.includes(item._id)}
                          onChange={() => toggleItemSelection(item._id)}
                        />
                        <span>
                          {item.name} - <strong>${item.price.toFixed(2)}</strong>
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="form-control mt-4">
                    <label className="label">
                      <span className="label-text font-semibold">
                        Special Requests / Comments:
                      </span>
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Enter any special requests or additional details here"
                      className="textarea textarea-bordered h-24"
                    />
                  </div>
                  <p className="font-bold mt-4">
                    Updated Total: $
                    {(selectedLab.price * quantity + selectedItemsTotal).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {/* Final Checkout Button */}
            <button
              className="bg-green-500 text-white px-4 py-2 rounded mt-6 w-full hover:bg-green-600 transition-all"
              onClick={handleCheckout}
            >
              Checkout
            </button>
          </div>
        )}
      </div>

      {/* Service Description Section */}
      <div className="max-w-3xl mx-auto">
        <h1 className="text-center font-bold text-2xl mt-4">Service Description</h1>
        <p className="text-center mt-8 text-gray-600">
          • Use our open studio 26 jewelry bench, tools, and equipment. Enjoy working in the studio 26 and around other jewelers and students.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • Open studio bench time sessions are in 4 hour increments, there are 6 available benches in each session. Come early to pick a bench and reserve your place.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • Open studio is only available to students who have taken classes at our school.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • Teachers are on hand to supervise your use of the studio, but not to teach new skills. We're available to answer questions and help you with techniques learned in class, but not to do the work for you.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • It's important for students to have time to work through their new skills independently.
        </p>
        <p className="text-center text-gray-600 mt-8">
          • Materials are not included.
        </p>
        <p className="text-center text-gray-600 mt-8">
          • Please bring your own expendable materials, like metal, stones, solder, flux and saw blades. They are not included for use with each bench. We do have metal, solder, flux and saw blades for an additional fee with each bench.
        </p>
        <p className="text-center text-gray-600 mt-8 mb-8">
          • Bring your own torch and butane!
        </p>
      </div>

      <hr className="mb-9 mt-9" />

      {/* Cancellation Policy Section */}
      <div className="max-w-5xl mx-auto">
        <h1 className="text-center font-bold text-2xl mt-4">Cancellation Policy</h1>
        <p className="text-center mt-8 text-gray-600">
          • Payment in full for class fees is due at the time of registration to reserve your jewelry bench spot. We accept Visa, MasterCard, American Express, Discover, and PayPal.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • If the class is canceled by our school for any reason, we will give you full credit for the same class in the future and you will be given an open lab credit for the inconvenience. You can also transfer to another class, or you can keep a credit on account with us for future classes for up to 90 days (no exceptions).
        </p>
        <p className="text-center mt-8 text-gray-600">
          • Students can cancel, and receive a credit, or transfer to another class up to 10 days before a jewelry class. No cancellations are accepted after the 10 days deadline; however, we will do what we can to try and sell your reserved spot to a qualified student.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • If we can sell your reserved spot, you can receive a credit for another class less a $50 cancellation fee. We will keep your credit on an account with us, or apply your fees towards a transfer to another class within 90 days.
        </p>
        <p className="text-center mt-8 text-gray-600">
          • If you cannot make it to class, you may send a participant who has the necessary prerequisites in your place. Please call or email us immediately with any changes with the student participant information.
        </p>
        <p className="text-center text-gray-600 mt-8">
          • Students must be at least 15 years old to attend a class, and students under 18 must have a legal guardian sign our liability waiver form. We have had younger students attend classes, on a case-by-case basis. If you are interested in enrolling your child, please email us.
        </p>
        <p className="text-center text-gray-600 mt-8">
          • If you sign up for a class and fail to have the required prerequisites as listed in the class description, you are still subject to the 10-day cancellation policy, listed above.
        </p>
        <p className="text-center text-gray-600 mt-8 mb-8">
          • If you do not come to class, there are no refunds, credits, or transfers (No exceptions)
        </p>
        <p className="text-center text-gray-600 mt-8 mb-8">
          • We understand that things come up. If you are not able to make a scheduled class, please call us as soon as possible at 916-350-0546 to reschedule your class.
        </p>
        <p className="text-center text-gray-600 mt-8 mb-8">• No refunds allowed.</p>
      </div>
    </div>
  );
};

export default Page;