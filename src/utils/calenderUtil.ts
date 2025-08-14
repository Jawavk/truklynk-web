import { useMemo } from 'react';

interface CalendarDayType {
    date: string;
    day: string;
    content: string;
    status: 'completed' | 'upcoming' | 'today' | 'none';
}

const useCalendarDays = (year: number, month: number): CalendarDayType[] => {
    return useMemo(() => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const DAY_NAMES: string[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        const today = new Date();

        const days: CalendarDayType[] = [];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({
                date: '',
                day: '',
                content: '',
                status: 'none',
            });
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            const dayIndex = currentDate.getDay();
            const dayName = DAY_NAMES[dayIndex] || '';
            
            const isToday =
                today.getDate() === day &&
                today.getMonth() === month &&
                today.getFullYear() === year;

            days.push({
                date: day.toString(),
                day: dayName,
                content: 'My grace is all you need, for my power is the greatest when you are weak. (2 Cor. 12:9)',
                status: isToday ? 'today' :
                    day < today.getDate() && month <= today.getMonth() ? 'completed' :
                    'upcoming',
            });
        }

        return days;
    }, [year, month]);
};

export { useCalendarDays };