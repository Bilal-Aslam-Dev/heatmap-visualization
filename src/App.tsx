import React, { useState } from 'react';
import runtimeData from './data/runtime-data.json';
import { RuntimeData, DateRange } from './types';
import { DateRangePicker } from './components/DateRangePicker';
import { RuntimeChart } from './components/RuntimeChart';

const App: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const dates = Object.keys(runtimeData.data).sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  });

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleDownload = () => {
    const element = document.querySelector('.echarts-for-react canvas');
    if (!element) return;

    (element as HTMLCanvasElement).toBlob((blob: Blob | null) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `runtime-report-${dateRange.start}.png`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  // Generate hours array
  const hours: string[] = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 5) {
      hours.push(`${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`);
    }
  }

  // Get filtered days
  const days = Object.keys(runtimeData.data)
    .filter((date) => date >= dateRange.start && date <= dateRange.end)
    .sort();

  return (
    <div className='container mx-auto px-4'>
      <div className='flex sm:flex-row flex-col justify-between gap-y-3 items-center mb-4 sticky top-0 bg-white z-[100]'>
        <h1 className='text-2xl font-bold'>Runtime Report</h1>
        <div className='flex gap-1 flex-wrap'>
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
          <button onClick={handleDownload} className='bg-none border-0 mx-auto'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='lucide lucide-download-icon lucide-download'
            >
              <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
              <polyline points='7 10 12 15 17 10' />
              <line x1='12' x2='12' y1='15' y2='3' />
            </svg>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">

      <div className='min-w-[700px] overflow-x-auto'>
        <RuntimeChart
          data={runtimeData as RuntimeData}
          dateRange={dateRange}
          hours={hours}
          days={days}
        />
      </div>
      </div>
    </div>
  );
};

export default App;
