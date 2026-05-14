export interface DriveTrackingPluginDefinition {
  startTracking(): Promise<{ success: boolean }>;
  stopTracking(): Promise<{ success: boolean }>;
  isTracking(): Promise<{ tracking: boolean }>;
  getLastLocation(): Promise<{ lat: number; lng: number; speed: number; accuracy: number; bearing: number; altitude: number; timestamp: number } | null>;
  requestBackgroundPermission(): Promise<{ granted: boolean }>;
  enableAutoStart(enable: boolean): Promise<void>;
  addListener(event: string, handler: (location: { lat: number; lng: number; speed: number; accuracy: number; bearing: number; altitude: number; timestamp: number }) => void): Promise<{ remove: () => void }>;
  removeAllListeners(): Promise<void>;
}