// Color mapping for congestion levels (1-7) matching the frontend gradient
const CONGESTION_COLORS: Record<number, string> = {
  0: '#dddddd', // gray
  1: '#6366f1', // Indigo
  2: '#3b82f6', // Blue
  3: '#06b6d4', // Cyan
  4: '#22c55e', // Green
  5: '#eab308', // Yellow
  6: '#f97316', // Orange
  7: '#ef4444'  // Red
};

// --- API Response Interfaces (snake_case) ---

interface ApiStop {
  name: string;
  time: string; // HH:MM
  congestion_level: number | null;
}

interface ApiSegment {
  line: string;
  from_station: string;
  to_station: string;
  departure_time: string; // HH:MM
  arrival_time: string;   // HH:MM
  stops: ApiStop[];
}

interface ApiRoute {
  id: string;
  total_duration: number; // minutes
  fare: number;
  transfers: number;
  segments: ApiSegment[];
}

interface ApiSearchResponse {
  routes: ApiRoute[];
}

// --- Application Interfaces (camelCase) ---

export interface StationStop {
  name: string;
  time: string;
  congestionLevel?: number | null;
  nextSectionColor?: string; // Mapped color for UI
}

export interface RouteSegment {
  line: string;
  fromStation: string;
  toStation: string;
  departureTime: string; // HH:MM
  arrivalTime: string;   // HH:MM
  stops: StationStop[];
}

export interface RouteResult {
  id: string;
  segments: RouteSegment[];
  totalDuration: number;
  fare: number;
  transfers: number;
}

// In-memory cache to store search results for detail view
let resultCache: RouteResult[] = [];
let lastSearchParams: { from: string; to: string; departureTime?: string } | null = null;

// Helper to map API stop to internal StationStop with color
const mapStop = (apiStop: ApiStop): StationStop => {
  return {
    name: apiStop.name,
    time: apiStop.time,
    congestionLevel: apiStop.congestion_level,
    nextSectionColor: apiStop.congestion_level ? CONGESTION_COLORS[apiStop.congestion_level] : undefined
  };
};

// Helper to map API segment to internal RouteSegment
const mapSegment = (apiSegment: ApiSegment): RouteSegment => {
  return {
    line: apiSegment.line,
    fromStation: apiSegment.from_station,
    toStation: apiSegment.to_station,
    departureTime: apiSegment.departure_time,
    arrivalTime: apiSegment.arrival_time,
    stops: apiSegment.stops.map(mapStop)
  };
};

// Helper to map API route to internal RouteResult
const mapRoute = (apiRoute: ApiRoute): RouteResult => {
  return {
    id: apiRoute.id,
    totalDuration: apiRoute.total_duration,
    fare: apiRoute.fare,
    transfers: apiRoute.transfers,
    segments: apiRoute.segments.map(mapSegment)
  };
};

export const getCachedRoutes = (from: string, to: string, departureTime?: string): RouteResult[] | null => {
  if (
    lastSearchParams &&
    lastSearchParams.from === from &&
    lastSearchParams.to === to &&
    lastSearchParams.departureTime === departureTime &&
    resultCache.length > 0
  ) {
    return resultCache;
  }
  return null;
};

export const searchRoutes = async (from: string, to: string, departureTime?: string): Promise<RouteResult[]> => {
  const cached = getCachedRoutes(from, to, departureTime);
  if (cached) {
    return cached;
  }

  // Use local proxy to avoid CORS
  const endpoint = new URL('/api/', window.location.origin);
  endpoint.searchParams.append('from', from);
  endpoint.searchParams.append('to', to);
  
  if (departureTime && departureTime.includes(':')) {
    const now = new Date();
    const [hours, minutes] = departureTime.split(':').map(Number);
    
    // Format: YYYY-MM-DDTHH:mm:ss+09:00
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    
    const formattedTime = `${YYYY}-${MM}-${DD}T${HH}:${mm}:00+09:00`;
    endpoint.searchParams.append('departure_time', formattedTime);
  }

  try {
    const response = await fetch(endpoint.toString());
    
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data: ApiSearchResponse = await response.json();
    
    const results = data.routes.map(mapRoute);
    resultCache = results; // Update cache
    lastSearchParams = { from, to, departureTime };
    return results;
  } catch (error) {
    console.error('Failed to fetch routes:', error);
    return [];
  }
};

export const getRouteById = async (id: string): Promise<RouteResult | undefined> => {
  // Return from cache (synchronous lookup effectively, but keeping async signature)
  return resultCache.find(r => r.id === id);
};