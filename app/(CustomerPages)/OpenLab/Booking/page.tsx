"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles
import AddToCartButton from "../Components/AddToCartButton";
import { format, parseISO, isSameDay } from "date-fns";

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

const Page = () => {
    const [date, setDate] = useState(new Date());
    const [labs, setLabs] = useState<Lab[]>([]);
    const [selectedLab, setSelectedLab] = useState<Lab | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchLabs = async () => {
            try {
                const response = await fetch('/api/lab');
                const data = await response.json();
                setLabs(data);
            } catch (error) {
                console.error("Error fetching labs:", error);
            }
        };

        fetchLabs();
    }, []);

    // handle date change
    const handleDateChange = (newDate: any) => {
        setDate(newDate);
        console.log("Selected date:", newDate);
    };

    // update participants
    const handleParticipantsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newParticipants = Math.max(1, parseInt(event.target.value, 10));
        setQuantity(newParticipants);
    };

    // mark labs on calendar
    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === "month") {
            // Check if the current date matches any lab date
            const hasLab = labs.some((lab) => {
                const labDate = parseISO(lab.date); // Convert lab.date string to a Date object
                return isSameDay(date, labDate); // Compare dates using isSameDay
            });

            if (hasLab) {
                return <div className="bg-blue-500 text-white p-1 rounded-full">Lab</div>;
            }
        }
        return null;
    };

    // Normalize dates using date-fns
    const getLabsForSelectedDate = () => {
        const selectedDateUTC = format(date, "yyyy-MM-dd");
        const selectedDateLabs = labs.filter((lab) => {
            const labDateUTC = format(parseISO(lab.date), "yyyy-MM-dd");
            return labDateUTC === selectedDateUTC;
        });
        return selectedDateLabs;
    };

    return (
        <div>
            <div className="grid grid-cols-3 gap-6 p-6">
                {/* Calendar Section*/}
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4">Select a Date</h2>
                    <Calendar
                        onChange={handleDateChange}
                        value={date}
                        tileContent={({ date }) => {
                            const hasLab = labs.some((lab) => isSameDay(parseISO(lab.date), date));


                            // TODO : COLOR THE MARKERS (add className to div below)
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
                                className={`p-4 border rounded-lg cursor-pointer ${selectedLab?._id === lab._id ? "bg-gray-200" : ""}`}
                                onClick={() => setSelectedLab(lab)}
                            >
                                <h3 className="text-lg font-semibold">{lab.name}</h3>
                                <p className="text-gray-600">{lab.time} - {lab.duration} hrs</p>
                                <p className="text-gray-500">Instructor: {lab.instructor}</p>
                            </div>
                        ))
                    ) : (
                        <p>No labs available on this date.</p>
                    )}
                </div>

                {/* Summary and Checkout */}
                {selectedLab && (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
                        <img src={selectedLab.image_url} alt={selectedLab.name} className="w-full h-40 object-cover rounded" />
                        <h3 className="text-lg font-semibold mt-2">{selectedLab.name}</h3>
                        <p className="text-gray-600">{selectedLab.description}</p>
                        <p className="text-gray-500">Location: {selectedLab.location}</p>
                        <p className="text-gray-500">Instructor: {selectedLab.instructor}</p>
                        <p className="text-gray-500">Time: {selectedLab.time} - {selectedLab.duration} hrs</p>
                        <p className="text-gray-700 font-bold mt-2">${selectedLab.price} per person</p>

                        {/* Participant Input */}
                        <label className="block mt-2 font-semibold">Participants:</label>
                        <input
                            type="number"
                            min="1"
                            max={selectedLab.max_capacity}
                            value={quantity}
                            onChange={handleParticipantsChange}
                            className="border p-2 rounded w-full"
                        />

                        {/* Total Price Calculation */}
                        <p className="font-bold mt-2">Total: ${(selectedLab.price * quantity).toFixed(2)}</p>

                        {/* Checkout and Confirmation Window */}
                        <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4 w-full" onClick={() => { if (document) { (document.getElementById("my_modal") as HTMLFormElement).showModal(); } }}>Checkout</button>
                        <dialog id="my_modal" className="modal modal-bottom sm:modal-middle">
                            <div className="modal-box">
                                <h3 className="font-bold text-lg">Heads Up!</h3>
                                <p className="py-4 text-lg">Open Lab Customers need to bring their own materials and tools, or make a request to rent/use materials for a fee. Would you like to rent supplies?</p>
                                <div className="modal-action">
                                    <form method="dialog">
                                        <div className="grid grid-cols-2 gap-6 p-6">
                                            <button className="bg-red-500 text-white px-4 py-2 rounded mt-4 w-full">Cancel</button>
                                            <AddToCartButton product={{ ...selectedLab, quantity }} />
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </dialog>
                    </div>
                )}

            </div>

            <div className="max-w-3xl mx-auto">
                <h1 className="text-center font-bold text-2xl mt-4">
                    Service Description
                </h1>
                <p className="text-center mt-8 text-gray-600 ">
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

            <div className="max-w-5xl mx-auto">
                <h1 className="text-center font-bold text-2xl mt-4">
                    Cancellation Policy
                </h1>
                <p className="text-center mt-8 text-gray-600 ">
                    • Payment in full for class fees is due at the time of registration to reserve your jewelry bench spot. We accept Visa, MasterCard, American Express, Discover, and PayPal.
                </p>
                <p className="text-center mt-8 text-gray-600">
                    • If the class is canceled by our school for any reason, we will give you full credit for the same class in the future and you will be given an open lab credit for the inconvenience.
                    You can also transfer to another class, or you can keep a credit on account with us for future classes for up to 90 days (no exceptions).
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
                <p className="text-center text-gray-600 mt-8 mb-8">
                    • No refunds allowed.
                </p>
            </div>
        </div>

    );
};

export default Page;