import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';  
import type { View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import { useState, useEffect, useCallback } from 'react';
import { ICourse } from '@/app/models/Course';
import Image from 'next/image';

import moment from 'moment';

const localizer = momentLocalizer(moment);

interface CalendarEvent {
    title: string;
    start: Date;
    end: Date;
    resource?: ICourse;
  }

const MyCalendar: React.FC = () => {

    
    const [courses, setCourses] = useState<ICourse[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        const fetchCourses = async () => {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setCourses(data);  
        };
        fetchCourses();
    }, []);

    const events: CalendarEvent[] = courses.map((course) => {
        const [year, month, day] = course.date.split('-').map(Number);
        const [hours, minutes] = course.time.split(':').map(Number);

        const startDate = new Date(year, month - 1, day, hours, minutes);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + course.duration);

        return {
            title: course.name,
            start: startDate,
            end: endDate,
            resource: course
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
        <div className="flex justify-center items-center relative">
            <div className="w-4/5 max-w-6xl p-6" style={{height: '80vh'}}>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    view = {view}
                    onView={(newView) => setView(newView)}
                    date={date}
                    onNavigate={(newDate) => setDate(newDate)}
                    onSelectEvent={handleSelectEvent}
                />
            </div>

            {showPopup && selectedEvent && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
                            <button 
                                onClick={closePopup}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="mb-4">
                            {selectedEvent.resource?.image_url && (
                                <div className="mb-4 flex justify-center relative h-48 w-full">
                                <Image 
                                    src={selectedEvent.resource.image_url} 
                                    alt={`${selectedEvent.title} image`}
                                    fill
                                    className="rounded-lg object-cover shadow-md" 
                                    sizes="(max-width: 768px) 100vw, 400px"
                                />
                            </div>
                            )}
                            <p><strong>Date:</strong> {moment(selectedEvent.start).format('MMMM D, YYYY')}</p>
                            <p><strong>Time:</strong> {moment(selectedEvent.start).format('h:mm A')} - {moment(selectedEvent.end).format('h:mm A')}</p>
                            {selectedEvent.resource?.description && (
                                <div className="mt-3">
                                    <p><strong>Description:</strong></p>
                                    <p className="mt-1 text-gray-700">{selectedEvent.resource.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between">
                            <a 
                                href={`/class-catalog/courses/${selectedEvent.resource?._id}`}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
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