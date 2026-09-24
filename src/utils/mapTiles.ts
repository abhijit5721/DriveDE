/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * mapTiles.ts
 *
 * One tile source for every Leaflet map (Tracker, navigation HUD, hotspot map).
 *
 * OpenStreetMap's standard tiles. Until 24 Sep 2026 this was Carto's
 * voyager/dark_all pair, but Carto started requiring an API key and now stamps
 * "API KEY REQUIRED" on every keyless tile. OSM needs no key, only attribution,
 * and is the provider the privacy policy names. OSM has no dark style, so dark
 * mode inverts the tiles with a CSS filter (see .map-tiles-dark in index.css).
 * Usage policy: https://operations.osmfoundation.org/policies/tiles/ (browser
 * requests with a Referer and visible attribution are fine at our volume).
 */

export interface TileConfig {
  url: string;
  attribution: string;
  /** className for <TileLayer>, so dark mode can filter the tile pane */
  className: string;
}

export function getTileConfig(dark: boolean): TileConfig {
  return {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    className: dark ? 'map-tiles-dark' : 'map-tiles-light',
  };
}
