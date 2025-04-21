export interface RuntimeSource {
  color: string;
  display: string;
  name: string;
  value: number;
  desc: string;
}

export interface DataPoint {
  time: string;
  rtsources: number;
  sys_volt: number;
  batt_curr: number;
  batt_volt: number;
  rect_curr: number;
  load_curr: number;
}

export interface RuntimeData {
  meta: {
    sources: RuntimeSource[];
  };
  data: {
    [key: string]: DataPoint[];
  };
}

export interface DateRange {
  start: string;
  end: string;
} 