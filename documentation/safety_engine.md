# DriveDE Safety Monitoring & Geospatial Logic

## 🛰️ Overview

The `Tracker` component in DriveDE is a real-time safety engine that monitors driving behavior against world geometry data. Unlike basic GPS trackers, DriveDE queries the **OpenStreetMap (OSM) via Overpass API** to understand the road network around the driver.

## 🚦 Safety Checks

### 1. Stop Sign Monitoring
- **Logic**: When the driver is within 20 meters of a known `highway=stop` node, the engine checks for a "Full Stop" (Speed < 2 km/h).
- **Overpass Query**: Searches for nodes with `hw["highway"="stop"]` within a 100m radius of the driver's current coordinates.
- **Throttling**: Queries are throttled to once every 10-15 seconds to avoid API ban and save battery.

### 2. Wrong-Way Driving Detection
- **Logic**: The engine compares the driver's **Current Bearing** with the **Road Segment Bearing**.
- **Geometry Processing**:
    1. Fetches local `ways` (roads).
    2. Identifies the closest node on the nearest road.
    3. Calculates the bearing between two consecutive nodes in the road's coordinate list.
    4. If the difference between driver bearing and road bearing is > 150 degrees (and the road is a `oneway`), an alert is triggered.

### 3. Prohibited Turn Detection
- **Logic**: Monitors `restriction` relations in OSM (e.g., "no_left_turn").
- **State Check**: If the driver's path (sampled every 2 seconds) violates a node-to-node restriction, a mistake is logged.

## 📡 External API: Overpass
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Fallback**: If the API is unreachable, the engine falls back to basic GPS speed/heading monitoring.
- **Optimizations**:
    - **Caching**: Local road IDs are cached in `useRef` to prevent redundant lookups.
    - **Bounding Box**: Queries are limited to a small bounding box centered on the user.

## 📐 Mathematical Formulas Used
- **Haversine Formula**: To calculate distance between two lat/lng points.
- **Bearing Calculation**: `atan2(sin(Δλ) ⋅ cos(φ2), cos(φ1) ⋅ sin(φ2) − sin(φ1) ⋅ cos(φ2) ⋅ cos(Δλ))`

---
*Last Updated: April 2026*
