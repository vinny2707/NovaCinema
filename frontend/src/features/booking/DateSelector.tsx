import React from 'react';

interface DateSelectorProps {
    selectedDate: string;
    onDateSelect: (date: string) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
    selectedDate,
    onDateSelect,
}) => {
    // Generate next 7 days
    const generateDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        return dates;
    };

    const dates = generateDates();

    const formatDate = (date: Date): string => {
        // Use local timezone instead of UTC to avoid date shifting
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`; // YYYY-MM-DD
    };

    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const getDayName = (date: Date): string => {
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        return days[date.getDay()];
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Anton, sans-serif' }}>
                LỊCH CHIẾU
            </h2>

            <div className="flex gap-3 overflow-x-auto pb-2">
                {dates.map((date, index) => {
                    const dateStr = formatDate(date);
                    const isSelected = selectedDate === dateStr;

                    return (
                        <button
                            key={index}
                            onClick={() => onDateSelect(dateStr)}
                            className={`flex-shrink-0 px-6 py-3 rounded-lg border-2 transition-all min-w-[100px] ${isSelected
                                ? 'border-yellow-400 bg-yellow-400 text-black'
                                : 'border-gray-600 bg-gray-800 text-white hover:border-yellow-400'
                                }`}
                        >
                            <div className="text-center">
                                {isToday(date) && (
                                    <div className="text-xs font-semibold mb-1">
                                        Hôm nay
                                    </div>
                                )}
                                <div className="text-sm font-medium">
                                    {getDayName(date)}
                                </div>
                                <div className="text-xl font-bold mt-1">
                                    {date.getDate().toString().padStart(2, '0')}
                                </div>
                                <div className="text-xs mt-1">
                                    Tháng {date.getMonth() + 1}
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default DateSelector;
