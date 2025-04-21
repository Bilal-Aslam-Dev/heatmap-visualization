import { RuntimeData, DataPoint } from '../types';
import { FILTERED_SOURCES } from './constants';
import type { EChartsOption } from 'echarts';

export const transformData = (
  data: RuntimeData,
  dateRange: { start: string; end: string }
): Array<[string, string, number, string]> => {
  const result: Array<[string, string, number, string]> = [];
  const sources = data.meta.sources.filter((source) =>
    FILTERED_SOURCES.includes(source.name)
  );
  const { start: startDate, end: endDate } = dateRange;

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

export const generateTooltipContent = (
  time: string,
  date: string,
  sourceValue: number,
  data: RuntimeData
): string => {
  const dataPoints = (data as RuntimeData).data[date];
  if (!dataPoints) return '';

  const point = dataPoints.find((p: DataPoint) => p.time === time);
  const source = data.meta.sources.find((s) => s.value === sourceValue);

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
};

export const getChartOptions = (
  hours: string[],
  days: string[],
  data: RuntimeData,
  dateRange: { start: string; end: string }
): EChartsOption => {
  const filteredSources = data.meta.sources.filter((source) =>
    FILTERED_SOURCES.includes(source.name)
  );

  return {
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

        const [time, date, sourceValue] = paramValue as [string, string, number];
        return generateTooltipContent(time, date, sourceValue, data);
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
          return value.endsWith(':00') && parseInt(value.split(':')[0]) % 2 === 0;
        },
        fontFamily: 'Arial',
        fontStyle: 'normal',
        fontSize: 12,
        margin: 16,
      },
      axisTick: {
        show: true,
        interval: (index: number, value: string) => {
          return value.endsWith(':00') && parseInt(value.split(':')[0]) % 2 === 0;
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
        data: transformData(data, dateRange),
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