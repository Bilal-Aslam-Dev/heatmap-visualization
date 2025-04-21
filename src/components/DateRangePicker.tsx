import React from 'react';
import { format } from 'date-fns';
import { DateRange } from '../types';

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (type: 'start' | 'end', value: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  return (
    <div className='flex items-center gap-4 p-1 px-3 rounded-lg pb-1.5'>
      <input
        type='date'
        value={format(dateRange.start, 'yyyy-MM-dd')}
        onChange={(e) => onDateRangeChange('start', e.target.value)}
        className='border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
      />
      <span className='text-gray-600 font-medium'>to</span>
      <input
        type='date'
        value={format(dateRange.end, 'yyyy-MM-dd')}
        onChange={(e) => onDateRangeChange('end', e.target.value)}
        className='border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
      />
    </div>
  );
}; 