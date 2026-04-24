/**
 * (c) 2026 DriveDE. All rights reserved.
 * 
 * spatial.worker.ts
 * 
 * Web Worker for high-performance geospatial calculations.
 * Offloads bearing, distance, and road geometry comparisons from the main thread.
 */

interface WorkerMessage {
  type: 'bearing' | 'distance' | 'wrongWayCheck' | 'findNearest';
  data: {
    start?: { lat: number; lng: number };
    end?: { lat: number; lng: number };
    p1?: { lat: number; lng: number };
    p2?: { lat: number; lng: number };
    travelBearing?: number;
    roadNodes?: { lat: number; lon: number }[];
    // For local cache searches
    position?: { lat: number; lng: number };
    features?: {
      type: 'node' | 'way';
      id: number;
      lat: number;
      lon: number;
      tags: Record<string, string>;
      geometry?: { lat: number; lon: number }[];
    }[];
    maxDistKm?: number;
    tagFilter?: { key: string; value: string };
  };
}

/**
 * Calculates the bearing (compass direction) between two GPS points.
 */
function calculateBearing(startLat: number, startLng: number, endLat: number, endLng: number): number {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const endLatRad = (endLat * Math.PI) / 180;
  const endLngRad = (endLng * Math.PI) / 180;

  const y = Math.sin(endLngRad - startLngRad) * Math.cos(endLatRad);
  const x = Math.cos(startLatRad) * Math.sin(endLatRad) -
            Math.sin(startLatRad) * Math.cos(endLatRad) * Math.cos(endLngRad - startLngRad);
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

/**
 * Calculates the distance in km between two GPS points (Haversine formula).
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  switch (type) {
    case 'bearing': {
      const { start, end } = data;
      if (start && end) {
        const bearing = calculateBearing(start.lat, start.lng, end.lat, end.lng);
        self.postMessage({ type: 'bearing', result: bearing });
      }
      break;
    }

    case 'distance': {
      const { p1, p2 } = data;
      if (p1 && p2) {
        const distance = calculateDistance(p1.lat, p1.lng, p2.lat, p2.lng);
        self.postMessage({ type: 'distance', result: distance });
      }
      break;
    }

    case 'wrongWayCheck': {
      const { travelBearing, roadNodes } = data;
      if (travelBearing === undefined || !roadNodes || roadNodes.length < 2) {
        self.postMessage({ type: 'wrongWayCheck', result: false });
        return;
      }

      const roadBearing = calculateBearing(
        roadNodes[0].lat, roadNodes[0].lon,
        roadNodes[1].lat, roadNodes[1].lon
      );

      let angleDiff = Math.abs(travelBearing - roadBearing);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      // Threshold for wrong way: 120 degrees
      self.postMessage({ type: 'wrongWayCheck', result: angleDiff > 120 });
      break;
    }

    case 'findNearest': {
      const { position, features, maxDistKm, tagFilter } = data;
      if (!position || !features) return;

      let nearest = null;
      let minDist = maxDistKm || 0.05;

      for (const feature of features) {
        if (tagFilter && feature.tags?.[tagFilter.key] !== tagFilter.value) continue;

        const fLat = feature.lat || (feature.geometry ? feature.geometry[0].lat : 0);
        const fLon = feature.lon || (feature.geometry ? feature.geometry[0].lon : 0);
        
        const dist = calculateDistance(position.lat, position.lng, fLat, fLon);
        if (dist < minDist) {
          minDist = dist;
          nearest = feature;
        }
      }

      self.postMessage({ type: 'findNearest', result: nearest, tagFilter });
      break;
    }
  }
};
