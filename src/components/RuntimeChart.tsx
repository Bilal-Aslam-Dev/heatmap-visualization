import React from 'react';
import ReactECharts from 'echarts-for-react';
import { RuntimeData, DateRange } from '../types';
import { getChartOptions } from '../utils/chartUtils';

interface RuntimeChartProps {
  data: RuntimeData;
  dateRange: DateRange;
  hours: string[];
  days: string[];
}

export const RuntimeChart: React.FC<RuntimeChartProps> = ({
  data,
  dateRange,
  hours,
  days,
}) => {
  return (
    <ReactECharts
      option={getChartOptions(hours, days, data, dateRange)}
      style={{ height: '510px' }}
      className='w-full'
      opts={{ renderer: 'canvas' }}
    />
  );
}; 