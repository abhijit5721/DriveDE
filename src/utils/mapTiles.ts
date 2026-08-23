/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * mapTiles.ts
 *
 * One tile source for every Leaflet map, theme-aware. Carto's voyager/dark_all
 * pair keeps light and dark cartography consistent across Tracker, the
 * navigation HUD and the hotspot map (previously a mix of OSM and Carto,
 * all light-only). Key the <TileLayer> on the returned url so Leaflet
 * swaps tiles when the theme toggles.
 */

export interface TileConfig {
  url: string;
  attribution: string;
}

export function getTileConfig(dark: boolean): TileConfig {
  return {
    url: dark
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  };
}
