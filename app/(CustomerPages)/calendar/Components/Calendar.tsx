'use client';

import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import type { View } from "react-big-calendar";
import { Views } from "react-big-calendar";
import { useState, useEffect, useCallback } from "react";
import { ICourse } from "@/app/models/Course";
import Image from "next/image";

import moment from "moment";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  resource?: ICourse;
}

const MyCalendar: React.FC = () => {
  const [courses, setCourses] = useState<ICourse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [showPopup, setShowPopup] = useState(false);
  const [defaultView, setDefaultView] = useState<View>("month");

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDefaultView(window.innerWidth < 768 ? "agenda" : "month");
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const events: CalendarEvent[] = courses.map((course) => {
    const [year, month, day] = course.date.split("-").map(Number);
    const [hours, minutes] = course.time.split(":").map(Number);

    const startDate = new Date(year, month - 1, day, hours, minutes);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + course.duration);

    return {
      title: course.name,
      start: startDate,
      end: endDate,
      resource: course,
    };
  });

  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowPopup(true);
  }, []);

  const closePopup = () => {
    setShowPopup(false);
    setSelectedEvent(null);
  };

  return (
    <div className="flex justify-center items-center relative w-full">
      <div className="w-full md:w-4/5 max-w-6xl p-2 md:p-6">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={(newView) => setView(newView)}
          date={date}
          onNavigate={(newDate) => setDate(newDate)}
          onSelectEvent={handleSelectEvent}
          className={`
            text-xs md:text-base 
            [&_.rbc-toolbar]:flex [&_.rbc-toolbar]:md:flex-row [&_.rbc-toolbar]:flex-col [&_.rbc-toolbar]:gap-2
            [&_.rbc-toolbar-label]:py-2
            [&_.rbc-btn-group]:w-full [&_.rbc-btn-group]:flex [&_.rbc-btn-group]:justify-center
            [&_.rbc-btn-group_button]:px-2 [&_.rbc-btn-group_button]:py-1
            [&_.rbc-event]:text-xs [&_.rbc-event]:md:text-sm
          `}
          style={{ height: "80vh" }}
          toolbar={true}
          views={["month", "week", "day", "agenda"]}
          defaultView={defaultView}
        />
      </div>

      {showPopup && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg md:text-xl font-bold">
                {selectedEvent.title}
              </h2>
              <button
                onClick={closePopup}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="mb-3">
              {selectedEvent.resource?.image_url && (
                <div className="mb-3 flex justify-center relative h-36 md:h-48 w-full">
                  <Image
                    src={selectedEvent.resource.image_url}
                    alt={`${selectedEvent.title} image`}
                    fill
                    className="rounded-lg object-cover shadow-md"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
              )}
              <p className="text-sm md:text-base">
                <strong>Date:</strong>{" "}
                {moment(selectedEvent.start).format("MMMM D, YYYY")}
              </p>
              <p className="text-sm md:text-base">
                <strong>Time:</strong>{" "}
                {moment(selectedEvent.start).format("h:mm A")} -{" "}
                {moment(selectedEvent.end).format("h:mm A")}
              </p>
              {selectedEvent.resource?.description && (
                <div className="mt-2">
                  <p className="text-sm md:text-base">
                    <strong>Description:</strong>
                  </p>
                  <p className="mt-1 text-gray-700 text-sm md:text-base">
                    {selectedEvent.resource.description}
                  </p>
                </div>
              )}
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:justify-between">
              <a
                href={`/class-booking?id=${selectedEvent.resource?._id}`}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Course
              </a>
              <button
                onClick={closePopup}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCalendar;
