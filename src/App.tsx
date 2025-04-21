import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { format } from 'date-fns';
import type { EChartsOption } from 'echarts';
import runtimeData from './data/runtime-data.json';

interface RuntimeSource {
  color: string;
  display: string;
  name: string;
  value: number;
  desc: string;
}

interface DataPoint {
  time: string;
  rtsources: number;
  sys_volt: number;
  batt_curr: number;
  batt_volt: number;
  rect_curr: number;
  load_curr: number;
}

interface RuntimeData {
  meta: {
    sources: RuntimeSource[];
  };
  data: {
    [key: string]: DataPoint[];
  };
}

// Filter needed data sets
const FILTERED_SOURCES = [
  'RtBatt', // Battery
  'RtBS', // Battery Solar
  'RtDB', // Genset Battery
  'RtDSB', // Genset Solar Battery
];

const App: React.FC = () => {
  const [dateRange, setDateRange] = useState(() => {
    const dates = Object.keys(runtimeData.data).sort();
    return {
      start: dates[0],
      end: dates[dates.length - 1],
    };
  });

  const transformData = (data: RuntimeData) => {
    const result: Array<[string, string, number, string]> = [];
    const sources = data.meta.sources.filter((source) =>
      FILTERED_SOURCES.includes(source.name)
    );
    const startDate = dateRange.start;
    const endDate = dateRange.end;

    Object.entries(data.data)
      .filter(([date]) => date >= startDate && date <= endDate)
      .forEach(([date, timePoints]) => {
        timePoints.forEach((point) => {
          const source = sources.find((s) => s.value === point.rtsources);
          if (source) {
            result.push([point.time, date, source.value, source.color]);
          }
        });
      });

    return result;
  };

  const getChartOptions = (): EChartsOption => {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 5) {
        hours.push(
          `${String(i).padStart(2, '0')}:${String(j).padStart(2, '0')}`
        );
      }
    }

    const days = Object.keys(runtimeData.data)
      .filter((date) => date >= dateRange.start && date <= dateRange.end)
      .sort();

    const filteredSources = runtimeData.meta.sources.filter((source) =>
      FILTERED_SOURCES.includes(source.name)
    );

    return {
      // title: {
      //   text: 'Runtime Report',
      //   left: 'center',
      //   top: '20px',
      //   textStyle: {
      //     fontSize: 24,
      //     fontWeight: 'bold',
      //   },
      // },
      legend: {
        show: false,
      },
      tooltip: {
        className: '!bg-[#00000099] !text-white !border-0',
        position: 'top',
        formatter: (params) => {
          if (!params || typeof params !== 'object') return '';
          const paramValue = (params as { value: unknown }).value;
          if (!Array.isArray(paramValue)) return '';

          const [time, date, sourceValue] = paramValue as [
            string,
            string,
            number
          ];
          const dataPoints = (runtimeData as RuntimeData).data[date];
          if (!dataPoints) return '';

          const point = dataPoints.find((p: DataPoint) => p.time === time);
          const source = runtimeData.meta.sources.find(
            (s) => s.value === sourceValue
          );

          if (!point || !source) return '';

          return `
            <div>
              <p><b>Time:</b> ${time}</p>
              <p><b>Date:</b> ${date}</p>
              <p><b>Source:</b> ${source.display}</p>
              <p><b>Description:</b> ${source.desc}</p>
              <p><b>Battery Voltage:</b> ${point.batt_volt}V</p>
              <p><b>Battery Current:</b> ${point.batt_curr}A</p>
              <p><b>Rectifier Current:</b> ${point.rect_curr}A</p>
              <p><b>Load Current:</b> ${point.load_curr}A</p>
              <p><b>System Voltage:</b> ${point.sys_volt}V</p>
            </div>
          `;
        },
      },
      grid: {
        height: '70%',
        top: '120px',
        bottom: '15%',
        left: '5%',
        right: '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: {
          show: true,
        },
        axisLabel: {
          rotate: 0,
          interval: (index: number, value: string) => {
            return (
              value.endsWith(':00') && parseInt(value.split(':')[0]) % 2 === 0
            );
          },
          fontFamily: 'Arial',
          fontStyle: 'normal',
          fontSize: 12,
          margin: 16,
        },
        axisTick: {
          show: true,
          interval: (index: number, value: string) => {
            return (
              value.endsWith(':00') && parseInt(value.split(':')[0]) % 2 === 0
            );
          },
        },
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: {
          show: true,
        },
      },
      visualMap: {
        type: 'piecewise',
        orient: 'horizontal',
        top: '60px',
        left: 'center',
        itemWidth: 16,
        itemHeight: 16,
        itemGap: 30,
        textStyle: {
          fontSize: 12,
        },
        pieces: filteredSources.map((source) => ({
          value: source.value,
          label: source.display,
          color: source.color,
        })),
        dimension: 2,
      },
      series: [
        {
          name: 'Runtime Status',
          type: 'heatmap',
          data: transformData(runtimeData as RuntimeData),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          progressive: 1000,
          animation: true,
          label: {
            show: false,
          },
        },
      ],
    };
  };

  const handleDownload = () => {
    const element = document.querySelector('.echarts-for-react');
    if (!element) return;

    const echartsInstance = (
      element as unknown as {
        getEchartsInstance: () => { getDataURL: () => string };
      }
    ).getEchartsInstance();
    if (echartsInstance) {
      const base64 = echartsInstance.getDataURL();
      const link = document.createElement('a');
      link.download = `runtime-report-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = base64;
      link.click();
    }
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  return (
    <div className='container mx-auto px-4'>
      <div className='flex justify-between items-center mb-4 sticky top-0 bg-white z-[100]'>
        <h1 className='text-2xl font-bold'>Runtime Report</h1>
        <div className='flex gap-4'>
          <div className='flex items-center gap-4 p-1 px-3 rounded-lg pb-1.5'>
            <input
              type='date'
              value={format(dateRange.start, 'yyyy-MM-dd')}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className='border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <span className='text-gray-600 font-medium'>to</span>
            <input
              type='date'
              value={format(dateRange.end, 'yyyy-MM-dd')}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className='border border-gray-300 rounded-lg p-1 focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            <button onClick={handleDownload} className='bg-none border-0'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                stroke-width='2'
                stroke-linecap='round'
                stroke-linejoin='round'
                className='lucide lucide-download-icon lucide-download'
              >
                <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
                <polyline points='7 10 12 15 17 10' />
                <line x1='12' x2='12' y1='15' y2='3' />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ReactECharts
        option={getChartOptions()}
        style={{ height: '510px' }}
        className='w-full'
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
};

export default App;
