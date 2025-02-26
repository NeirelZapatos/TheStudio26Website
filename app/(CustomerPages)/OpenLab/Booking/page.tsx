"use client"

import React, { useState } from "react";
import Link from "next/link";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // Import default styles


const Page = () => {
    const [date, setDate] = useState(new Date());

    const handleDateChange = (newDate: any) => {
        setDate(newDate);
        console.log("Selected date:", newDate);
    };

    return (
        <div>
            <div className="bg-[#f5f5f5] bg">
                <section className="text-center p-10 bg-white-100">
                    <h2 className="text-4xl font-bold text-[#1e1e1e] mb-4 mx-auto">
                        Bench Time
                    </h2>
                    <p className="text-xl font-bold text-[#000000] max-w-3xl mx-auto">
                        4 hr | $40 | 4100 Cameron Park Drive
                    </p>

                    {/* Calendar Component */}
                    <div className="flex justify-center mt-6">
                        <Calendar
                            onChange={handleDateChange}
                            value={date}
                            className="bg-white p-4 rounded-lg shadow-md"
                            tileDisabled={({ date, view }) => {
                                if (view === "month") {
                                    return date.getDay() === 2 || date.getDay() === 3 || date.getDay() === 5 || date.getDay() === 6;
                                }
                                return false;
                            }}
                        />
                    </div>
                    <Link href={`/OpenLab/BookingCheckout`}><button className="btn bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-6">
                        <p>Book Now</p>
                    </button>
                    </Link>
                </section>
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
