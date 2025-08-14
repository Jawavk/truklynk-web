import { Circle, Edit } from 'lucide-react';


const CalendarDay = ({
    date,
    isEditable = false,
    content,
    onEdit,
    onView,
    status = 'none'
}) => {
    if (!date) return <div className="border border-gray-200 p-4 bg-white"></div>;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'border border-[5px] border-blue-500 rounded-xl';
            case 'upcoming': return 'border border-[5px] border-yellow-500 rounded-xl';
            case 'today': return 'border border-[5px] border-green-500 rounded-xl';
            default: return 'text-gray-400';
        }
    };

    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = days[date.getDay()];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    return (
        <div className="border border-blue-800 p-4 rounded-sm calendar-card">
            <div className='flex justify-between'>
                <div className="flex-shrink-0 mr-4">
                    <div className="justify-between items-start mb-2">
                        <div className={`text-4xl font-bold ${isWeekend ? 'text-red-500' : 'text-black'}`}>
                            {date.getDate()}
                        </div>
                        <div className={`text-xl text-gray-600 ${isWeekend ? 'text-red-500' : ''}`}>
                            {dayName}
                        </div>
                    </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                    {content}
                </div>
            </div>
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                    >
                        View
                    </button>

                    {isEditable && (
                        <button
                            onClick={onEdit}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1"
                        >
                            <Edit className="w-4 h-4" />
                            Edit
                        </button>
                    )}
                </div>
                <div className='self-center'>
                    {status !== 'none' && (
                        <div className={`w-4 h-4 ${getStatusColor(status)}`}></div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default CalendarDay