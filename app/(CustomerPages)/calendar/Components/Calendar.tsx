import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';  
import type { View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import { useState, useEffect } from 'react';
import { ICourse } from '@/app/models/Course';

import moment from 'moment';

const localizer = momentLocalizer(moment);

const MyCalendar: React.FC = () => {

    const [courses, setCourses] = useState<ICourse[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
        const res = await fetch('/api/courses');
        const data = await res.json();
        setCourses(data);  
        };
        fetchCourses();
    }, []);

    const events = courses.map((course) => {
        const [year, month, day] = course.date.split('-').map(Number);
        const [hours, minutes] = course.time.split(':').map(Number);

        const startDate = new Date(year, month - 1, day, hours, minutes);

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + course.duration);

        return {
            title: course.name,
            start: startDate,
            end: endDate
        };
    });

    const [view, setView] = useState<View>(Views.MONTH); 
    const [date, setDate] = useState(new Date());

    return (
        <div style={{ padding: '20px' }}>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                view = {view}
                onView={(newView) => setView(newView)}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
            />
        </div>
  );
};

export default MyCalendar;