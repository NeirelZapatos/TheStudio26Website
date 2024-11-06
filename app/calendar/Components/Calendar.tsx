import type { CalendarProps } from 'react-big-calendar';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';  
import type { View } from 'react-big-calendar';
import { Views } from 'react-big-calendar';
import { useState } from 'react';

import moment from 'moment';

const localizer = momentLocalizer(moment);

const MyCalendar: React.FC = () => {
    const [events, setEvents] = useState<CalendarProps['events']>([
        {
            title: 'Jewelry Making for Beginners',
            start: new Date(2024, 10, 16, 9, 30),
            end: new Date(2024, 10, 16, 14, 30),
        },
        {
            title: 'Rock Time!',
            start: new Date(2024, 10, 16, 12, 30),
            end: new Date(2024, 10, 16, 13, 30),
        },
        {
            title: 'Advanced Silver Smithing',
            start: new Date(2024, 10, 20, 10, 30),
            end: new Date(2024, 10, 20, 13, 0),
        },
    ]);
    
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