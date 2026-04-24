/**
 * (c) 2026 DriveDE. All rights reserved.
 * 
 * spatialCache.ts
 * 
 * Manages a local geo-fencing cache to reduce Overpass API calls.
 * Caches road features (stop signs, one-way streets) for a 1km radius.
 */

import { get as getIDB, set as setIDB } from 'idb-keyval';

export interface CachedFeature {
  type: 'node' | 'way';
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
}

export interface SpatialCacheData {
  center: { lat: number; lng: number };
  radius: number; // in meters
  timestamp: number;
  features: CachedFeature[];
}

const CACHE_KEY = 'drivede-spatial-cache';
const REFRESH_DISTANCE = 0.5; // 500 meters
const CACHE_RADIUS = 1000; // 1000 meters

/**
 * Calculates distance between two points in km.
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export async function getSpatialCache(): Promise<SpatialCacheData | null> {
  const data = await getIDB(CACHE_KEY);
  return (data as SpatialCacheData) || null;
}

export async function updateSpatialCache(lat: number, lng: number): Promise<SpatialCacheData | null> {
  const currentCache = await getSpatialCache();
  
  if (currentCache) {
    const distFromCenter = getDistance(lat, lng, currentCache.center.lat, currentCache.center.lng);
    // If we are still within the "safe zone", don't refresh
    if (distFromCenter < REFRESH_DISTANCE && (Date.now() - currentCache.timestamp < 3600000)) {
      return currentCache;
    }
  }

  console.log(`[SpatialCache] Refreshing cache for center: ${lat}, ${lng}...`);

  try {
    // Query for stop signs and one-way streets in a 1km radius
    const query = `[out:json];
      (
        node(around:${CACHE_RADIUS},${lat},${lng})["highway"="stop"];
        way(around:${CACHE_RADIUS},${lat},${lng})["oneway"="yes"];
        way(around:${CACHE_RADIUS},${lat},${lng})["highway"~"residential|living_street"];
        node(around:${CACHE_RADIUS},${lat},${lng})["amenity"~"school|kindergarten"];
      );
      out geom;`;
    
    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
      signal: AbortSignal.timeout(15000)
    });
    const data = await response.json();

    if (data.elements) {
      const newCache: SpatialCacheData = {
        center: { lat, lng },
        radius: CACHE_RADIUS,
        timestamp: Date.now(),
        features: data.elements
      };
      await setIDB(CACHE_KEY, newCache);
      console.log(`[SpatialCache] Cache updated with ${newCache.features.length} features.`);
      return newCache;
    }
  } catch (error) {
    console.warn('[SpatialCache] Failed to refresh cache:', error);
  }

  return currentCache;
}

/**
 * Finds the nearest feature of a specific type in the local cache.
 */
export function findNearestFeature(
  lat: number, 
  lng: number, 
  cache: SpatialCacheData, 
  filter: (f: CachedFeature) => boolean,
  maxDistKm: number = 0.05 // 50 meters default
): CachedFeature | null {
  let nearest: CachedFeature | null = null;
  let minDist = maxDistKm;

  for (const feature of cache.features) {
    if (filter(feature)) {
      const dist = getDistance(lat, lng, feature.lat || (feature.geometry ? feature.geometry[0].lat : 0), feature.lon || (feature.geometry ? feature.geometry[0].lon : 0));
      if (dist < minDist) {
        minDist = dist;
        nearest = feature;
      }
    }
  }

  return nearest;
}
