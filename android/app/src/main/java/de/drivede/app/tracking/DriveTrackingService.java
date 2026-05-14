package de.drivede.app.tracking;

import android.app.*;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.location.Location;
import android.os.*;
import android.os.Looper;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import com.google.android.gms.location.*;
import de.drivede.app.MainActivity;
import de.drivede.app.R;

public class DriveTrackingService extends Service {
    private static final String TAG = "DriveTrackingService";
    public static final String CHANNEL_ID = "drivede_tracking_channel";
    public static final int NOTIFICATION_ID = 1001;
    public static final String ACTION_LOCATION_UPDATE = "de.drivede.app.LOCATION_UPDATE";
    public static final String EXTRA_LAT = "lat";
    public static final String EXTRA_LNG = "lng";
    public static final String EXTRA_SPEED = "speed";
    public static final String EXTRA_ACCURACY = "accuracy";
    public static final String EXTRA_BEARING = "bearing";
    public static final String EXTRA_ALTITUDE = "altitude";
    public static final String EXTRA_TIMESTAMP = "timestamp";

    private static final int UPDATE_INTERVAL_MS = 3000;
    private static final int FASTEST_UPDATE_MS = 1000;

    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    private boolean isTracking = false;
    private final IBinder binder = new LocalBinder();

    public class LocalBinder extends Binder {
        DriveTrackingService getService() {
            return DriveTrackingService.this;
        }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "Service onCreate");
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        createNotificationChannel();
        createLocationCallback();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "Service onStartCommand");
        if (intent == null) {
            stopSelf();
            return START_NOT_STICKY;
        }

        String action = intent.getAction();
        if ("STOP".equals(action)) {
            stopTracking();
            stopForeground(STOP_FOREGROUND_REMOVE);
            stopSelf();
            return START_NOT_STICKY;
        }

        startTracking();
        return START_STICKY;
    }

    private void startTracking() {
        if (isTracking) return;

        Notification notification = buildNotification();

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }

        try {
            fusedLocationClient.requestLocationUpdates(
                createLocationRequest(),
                locationCallback,
                Looper.getMainLooper()
            );
            isTracking = true;
            Log.d(TAG, "Location updates started");
        } catch (SecurityException e) {
            Log.e(TAG, "Location permission denied", e);
            stopSelf();
        }
    }

    private void stopTracking() {
        if (!isTracking) return;
        fusedLocationClient.removeLocationUpdates(locationCallback);
        isTracking = false;
        Log.d(TAG, "Location updates stopped");
    }

    private LocationRequest createLocationRequest() {
        LocationRequest.Builder builder = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, UPDATE_INTERVAL_MS);
        builder.setMinUpdateIntervalMillis(FASTEST_UPDATE_MS);
        builder.setWaitForAccurateLocation(true);
        return builder.build();
    }

    private void createLocationCallback() {
        final SharedPreferences prefs = getSharedPreferences("drivede_tracking", MODE_PRIVATE);

        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null || locationResult.getLocations().isEmpty()) return;

                Location location = locationResult.getLastLocation();
                if (location == null) return;

                double lat = location.getLatitude();
                double lng = location.getLongitude();
                float speedMs = location.getSpeed();
                float speedKmh = speedMs * 3.6f;
                float accuracy = location.getAccuracy();
                float bearing = location.getBearing();
                double altitude = location.getAltitude();
                long timestamp = location.getTime();

                prefs.edit()
                    .putBoolean("is_tracking", true)
                    .putLong("last_lat", Double.doubleToLongBits(lat))
                    .putLong("last_lng", Double.doubleToLongBits(lng))
                    .putFloat("last_speed", speedKmh)
                    .putFloat("last_accuracy", accuracy)
                    .putFloat("last_bearing", bearing)
                    .putLong("last_altitude", Double.doubleToLongBits(altitude))
                    .putLong("last_timestamp", timestamp)
                    .apply();

                DriveTrackingPlugin plugin = DriveTrackingPlugin.getInstance();
                if (plugin != null) {
                    plugin.notifyLocationUpdate(lat, lng, speedKmh, accuracy, bearing, altitude, timestamp);
                }

                Log.d(TAG, String.format("Location: %.6f, %.6f | speed: %.1f km/h | accuracy: %.1fm",
                    lat, lng, speedKmh, accuracy));
            }
        };
    }

    private Notification buildNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, DriveTrackingService.class);
        stopIntent.setAction("STOP");
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this, 1, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("DriveDE")
            .setContentText(getString(R.string.tracking_notification_text))
            .setSmallIcon(R.drawable.ic_notification)
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_notification_stop, getString(R.string.tracking_notification_stop), stopPendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                getString(R.string.tracking_channel_name),
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription(getString(R.string.tracking_channel_description));
            channel.setShowBadge(false);
            channel.enableLights(false);
            channel.enableVibration(false);

            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }

    @Override
    public void onDestroy() {
        stopTracking();
        Log.d(TAG, "Service onDestroy");
        super.onDestroy();
    }

    @Override
    public void onTaskRemoved(Intent rootIntent) {
        Log.d(TAG, "Task removed — keeping service alive");
        Intent restartService = new Intent(this, DriveTrackingService.class);
        restartService.setAction("START");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(restartService);
        } else {
            startService(restartService);
        }
        super.onTaskRemoved(rootIntent);
    }
}