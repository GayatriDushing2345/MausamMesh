import {
  LocationHierarchy,
  PanchayatForecastResponse,
  MapGeoJSONResponse,
  ModelReliabilityResponse,
  AdvisoryResponse,
  ComparisonResponse,
  DAMUApprovalResponse,
  PriorityQueueResponse,
  PriorityConfigResponse,
  LocationTreeNode,
  LocationSearchItem,
  DataHealthResponse,
  BlockForecastUploadResponse
} from './types';

export const LIVE_BACKEND_URL = 'https://mausammesh.onrender.com/api/v1';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http'))
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : LIVE_BACKEND_URL;

// In-memory cache for ultra-fast tab switches and instant responses
const memoryCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function fetchWithCache<T>(url: string, ttlMs: number = CACHE_TTL_MS): Promise<T> {
  // 1. Check in-memory cache (0ms)
  const mem = memoryCache.get(url);
  if (mem && Date.now() < mem.expiry) {
    return mem.data as T;
  }

  // 2. Check sessionStorage (survives page refreshes, 1ms)
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem(`mm_cache_${url}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() < parsed.expiry) {
          memoryCache.set(url, parsed);
          return parsed.data as T;
        }
      }
    } catch (_) {}
  }

  // 3. Perform network fetch
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();

  // 4. Save to caches
  const cacheItem = { data, expiry: Date.now() + ttlMs };
  memoryCache.set(url, cacheItem);
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(`mm_cache_${url}`, JSON.stringify(cacheItem));
    } catch (_) {}
  }

  return data as T;
}

export async function fetchLocations(): Promise<LocationHierarchy> {
  // Locations are static geographic hierarchy - cache for 2 hours in localStorage
  const cacheKey = 'mm_locations_cache_v1';
  if (typeof window !== 'undefined') {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() < parsed.expiry && parsed.data?.states?.length > 0) {
          // Return cached instantly, revalidate silently in background
          fetch(`${API_BASE}/locations`).then(async res => {
            if (res.ok) {
              const fresh = await res.json();
              localStorage.setItem(cacheKey, JSON.stringify({ data: fresh, expiry: Date.now() + 2 * 60 * 60 * 1000 }));
            }
          }).catch(() => {});
          return parsed.data;
        }
      }
    } catch (_) {}
  }

  const res = await fetch(`${API_BASE}/locations`);
  if (!res.ok) throw new Error('Failed to fetch location hierarchy');
  const data = await res.json();

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ data, expiry: Date.now() + 2 * 60 * 60 * 1000 }));
    } catch (_) {}
  }
  return data;
}

export async function fetchPanchayatForecast(panchayatId: string): Promise<PanchayatForecastResponse> {
  return fetchWithCache<PanchayatForecastResponse>(`${API_BASE}/panchayats/${panchayatId}/forecast`);
}

export async function fetchPanchayatMap(panchayatId: string): Promise<MapGeoJSONResponse> {
  return fetchWithCache<MapGeoJSONResponse>(`${API_BASE}/panchayats/${panchayatId}/map`);
}

export async function fetchPanchayatComparison(panchayatId: string): Promise<ComparisonResponse> {
  return fetchWithCache<ComparisonResponse>(`${API_BASE}/panchayats/${panchayatId}/compare`);
}

export async function fetchPanchayatReliability(panchayatId: string): Promise<ModelReliabilityResponse> {
  return fetchWithCache<ModelReliabilityResponse>(`${API_BASE}/panchayats/${panchayatId}/reliability`);
}

export async function fetchAdvisory(panchayatId: string, cropName: string, growthStage: string): Promise<AdvisoryResponse> {
  const url = `${API_BASE}/advisory?p=${panchayatId}&c=${encodeURIComponent(cropName)}&s=${encodeURIComponent(growthStage)}`;
  return fetchWithCache<AdvisoryResponse>(url, 3 * 60 * 1000).catch(async () => {
    const res = await fetch(`${API_BASE}/advisory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        panchayat_id: panchayatId,
        crop_name: cropName,
        growth_stage: growthStage
      })
    });
    if (!res.ok) throw new Error('Failed to generate agro-advisory');
    return res.json();
  });
}

export async function approveAdvisoryByDAMUOfficer(
  panchayatId: string,
  cropName: string,
  growthStage: string,
  officerName: string,
  targetChannels: string[]
): Promise<DAMUApprovalResponse> {
  const res = await fetch(`${API_BASE}/advisory/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      panchayat_id: panchayatId,
      crop_name: cropName,
      growth_stage: growthStage,
      officer_name: officerName,
      target_channels: targetChannels
    })
  });
  if (!res.ok) throw new Error('Failed to approve advisory bulletin');
  return res.json();
}

export function getReportDownloadUrl(panchayatId: string, cropName: string = 'Cotton', lang: string = 'en'): string {
  const base = API_BASE.startsWith('http') ? API_BASE : LIVE_BACKEND_URL;
  return `${base}/panchayats/${panchayatId}/report?crop=${encodeURIComponent(cropName)}&lang=${encodeURIComponent(lang)}`;
}

// Priority Queue API Callers
export async function fetchPriorityQueue(
  blockId?: string,
  districtId?: string,
  leadDay: number = 1,
  hazard: string = 'all',
  crop: string = 'all',
  weights?: Record<string, number>
): Promise<PriorityQueueResponse> {
  const params = new URLSearchParams();
  if (blockId) params.append('block_id', blockId);
  if (districtId) params.append('district_id', districtId);
  params.append('lead_day', String(leadDay));
  if (hazard && hazard !== 'all') params.append('hazard', hazard);
  if (crop && crop !== 'all') params.append('crop', crop);
  if (weights) {
    const weightsStr = Object.entries(weights).map(([k, v]) => `${k}=${v}`).join(',');
    params.append('weights', weightsStr);
  }

  const res = await fetch(`${API_BASE}/v1/priority-queue?${params.toString()}`);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to fetch priority queue');
  }
  return res.json();
}

export async function fetchPriorityConfig(): Promise<PriorityConfigResponse> {
  const res = await fetch(`${API_BASE}/v1/priority-queue/config`);
  if (!res.ok) throw new Error('Failed to fetch priority config');
  return res.json();
}

export function getPriorityCsvExportUrl(
  blockId?: string,
  districtId?: string,
  leadDay: number = 1,
  hazard: string = 'all',
  crop: string = 'all',
  weights?: Record<string, number>
): string {
  const params = new URLSearchParams();
  if (blockId) params.append('block_id', blockId);
  if (districtId) params.append('district_id', districtId);
  params.append('lead_day', String(leadDay));
  if (hazard && hazard !== 'all') params.append('hazard', hazard);
  if (crop && crop !== 'all') params.append('crop', crop);
  if (weights) {
    const weightsStr = Object.entries(weights).map(([k, v]) => `${k}=${v}`).join(',');
    params.append('weights', weightsStr);
  }
  return `${API_BASE}/v1/priority-queue/export.csv?${params.toString()}`;
}

// --- ROUND 4A & 4B API Methods ---
export async function fetchLocationTree(level: 'state' | 'district' | 'block' | 'panchayat' = 'state', parentId?: string): Promise<LocationTreeNode[]> {
  const params = new URLSearchParams({ level });
  if (parentId) params.append('parent_id', parentId);
  const res = await fetch(`${API_BASE}/locations/tree?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch location tree');
  return res.json();
}

export async function searchLocations(q: string, lang: string = 'en'): Promise<LocationSearchItem[]> {
  const params = new URLSearchParams({ q, lang });
  const res = await fetch(`${API_BASE}/locations/search?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to search locations');
  return res.json();
}

export async function fetchNearestLocation(lat: number, lon: number): Promise<LocationSearchItem | null> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const res = await fetch(`${API_BASE}/locations/nearest?${params.toString()}`);
  if (!res.ok) return null;
  return res.json();
}

export async function fetchDataHealth(): Promise<DataHealthResponse> {
  const res = await fetch(`${API_BASE}/system/data-health`);
  if (!res.ok) throw new Error('Failed to fetch data health');
  return res.json();
}

export async function uploadBlockForecastCSV(csvContent: string, dryRun: boolean = false): Promise<BlockForecastUploadResponse> {
  const res = await fetch(`${API_BASE}/block-forecast/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csv_content: csvContent, dry_run: dryRun })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload CSV');
  }
  return res.json();
}

