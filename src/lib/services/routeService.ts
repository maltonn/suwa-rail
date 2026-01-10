export interface StationStop {
  name: string;
  time: string;
  nextSectionColor?: string; // Color of the line to the next station
}

export interface RouteSegment {
  line: string;
  fromStation: string;
  toStation: string;
  departureTime: string; // HH:MM
  arrivalTime: string;   // HH:MM
  stops: StationStop[];  // Includes fromStation, intermediate stops, and toStation
}

export interface RouteResult {
  id: string;
  segments: RouteSegment[];
  totalDuration: number; // minutes
  fare: number;
  transfers: number;
}

// Simple in-memory cache for prototype
let mockCache: RouteResult[] = [];

// Helper to add minutes to HH:MM string
const addMinutes = (timeStr: string, minutes: number): string => {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutes);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

const CONGESTION_COLORS = {
  low: '#3b82f6',    // Blue
  medium: '#eab308', // Yellow
  high: '#ef4444'    // Red
};

const getRandomColor = () => {
  const colors = Object.values(CONGESTION_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateMockData = (from: string, to: string, baseTime: Date): RouteResult[] => {
  const currentHour = baseTime.getHours();
  const currentMinute = baseTime.getMinutes();
  const baseTimeStr = `${currentHour}:${currentMinute.toString().padStart(2, '0')}`;

  const fromName = from || '出発駅';
  const toName = to || '到着駅';

  return [
    {
      id: 'route-1',
      totalDuration: 45,
      fare: 550,
      transfers: 1,
      segments: [
        {
          line: 'JR山手線',
          fromStation: fromName,
          toStation: '新宿',
          departureTime: baseTimeStr,
          arrivalTime: addMinutes(baseTimeStr, 15),
          stops: [
            { name: fromName, time: baseTimeStr, nextSectionColor: CONGESTION_COLORS.low },
            { name: '途中駅A', time: addMinutes(baseTimeStr, 5), nextSectionColor: CONGESTION_COLORS.medium },
            { name: '途中駅B', time: addMinutes(baseTimeStr, 10), nextSectionColor: CONGESTION_COLORS.low },
            { name: '新宿', time: addMinutes(baseTimeStr, 15) }
          ]
        },
        {
          line: 'JR中央線',
          fromStation: '新宿',
          toStation: toName,
          departureTime: addMinutes(baseTimeStr, 20),
          arrivalTime: addMinutes(baseTimeStr, 45),
          stops: [
            { name: '新宿', time: addMinutes(baseTimeStr, 20), nextSectionColor: CONGESTION_COLORS.high },
            { name: '四ツ谷', time: addMinutes(baseTimeStr, 28), nextSectionColor: CONGESTION_COLORS.high },
            { name: 'お茶の水', time: addMinutes(baseTimeStr, 35), nextSectionColor: CONGESTION_COLORS.medium },
            { name: toName, time: addMinutes(baseTimeStr, 45) }
          ]
        }
      ]
    },
    {
      id: 'route-2',
      totalDuration: 40,
      fare: 600,
      transfers: 2,
      segments: [
        {
          line: '地下鉄A線',
          fromStation: fromName,
          toStation: '大手町',
          departureTime: addMinutes(baseTimeStr, 5),
          arrivalTime: addMinutes(baseTimeStr, 15),
          stops: [
            { name: fromName, time: addMinutes(baseTimeStr, 5), nextSectionColor: CONGESTION_COLORS.low },
            { name: '大手町', time: addMinutes(baseTimeStr, 15) }
          ]
        },
        {
          line: '地下鉄B線',
          fromStation: '大手町',
          toStation: '飯田橋',
          departureTime: addMinutes(baseTimeStr, 20),
          arrivalTime: addMinutes(baseTimeStr, 30),
          stops: [
            { name: '大手町', time: addMinutes(baseTimeStr, 20), nextSectionColor: CONGESTION_COLORS.medium },
            { name: '九段下', time: addMinutes(baseTimeStr, 25), nextSectionColor: CONGESTION_COLORS.low },
            { name: '飯田橋', time: addMinutes(baseTimeStr, 30) }
          ]
        },
        {
          line: '地下鉄C線',
          fromStation: '飯田橋',
          toStation: toName,
          departureTime: addMinutes(baseTimeStr, 35),
          arrivalTime: addMinutes(baseTimeStr, 45),
          stops: [
            { name: '飯田橋', time: addMinutes(baseTimeStr, 35), nextSectionColor: CONGESTION_COLORS.low },
            { name: toName, time: addMinutes(baseTimeStr, 45) }
          ]
        }
      ]
    },
    {
      id: 'route-3',
      totalDuration: 55,
      fare: 400,
      transfers: 0,
      segments: [
        {
          line: '各駅停車D線',
          fromStation: fromName,
          toStation: toName,
          departureTime: addMinutes(baseTimeStr, 2),
          arrivalTime: addMinutes(baseTimeStr, 57),
          stops: [
            { name: fromName, time: addMinutes(baseTimeStr, 2), nextSectionColor: getRandomColor() },
            { name: '駅1', time: addMinutes(baseTimeStr, 10), nextSectionColor: getRandomColor() },
            { name: '駅2', time: addMinutes(baseTimeStr, 20), nextSectionColor: getRandomColor() },
            { name: '駅3', time: addMinutes(baseTimeStr, 35), nextSectionColor: getRandomColor() },
            { name: '駅4', time: addMinutes(baseTimeStr, 45), nextSectionColor: getRandomColor() },
            { name: toName, time: addMinutes(baseTimeStr, 57) }
          ]
        }
      ]
    }
  ];
};

export const searchRoutes = async (from: string, to: string, departureTime: string): Promise<RouteResult[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const baseTime = departureTime ? new Date(`2026-01-01T${departureTime}:00`) : new Date();
  
  const results = generateMockData(from, to, baseTime);
  mockCache = results; // Update cache
  return results;
};

export const getRouteById = async (id: string): Promise<RouteResult | undefined> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const found = mockCache.find(r => r.id === id);
  if (found) return found;

  // Fallback if accessed directly (regenerate standard set)
  const fallback = generateMockData('出発駅', '到着駅', new Date());
  return fallback.find(r => r.id === id);
};