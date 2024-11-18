import React from "react";
import MyCalendar from "@/app/(CustomerPages)/calendar/Components/Calendar";

const BookingCalendarSection: React.FC = () => {
  return (
    <section className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Booking Calendar</h2>
      <MyCalendar />
    </section>
  );
};

export default BookingCalendarSection;