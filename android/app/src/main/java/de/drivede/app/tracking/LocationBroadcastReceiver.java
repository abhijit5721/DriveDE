package de.drivede.app.tracking;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

public class LocationBroadcastReceiver extends BroadcastReceiver {
    public interface LocationReceiverDelegate {
        void onLocationUpdate(double lat, double lng, float speed, float accuracy, float bearing, double altitude, long timestamp);
    }

    private static LocationReceiverDelegate delegate;

    public static void setDelegate(LocationReceiverDelegate d) {
        delegate = d;
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (DriveTrackingService.ACTION_LOCATION_UPDATE.equals(intent.getAction())) {
            double lat = intent.getDoubleExtra(DriveTrackingService.EXTRA_LAT, 0);
            double lng = intent.getDoubleExtra(DriveTrackingService.EXTRA_LNG, 0);
            float speed = intent.getFloatExtra(DriveTrackingService.EXTRA_SPEED, 0f);
            float accuracy = intent.getFloatExtra(DriveTrackingService.EXTRA_ACCURACY, 0f);
            float bearing = intent.getFloatExtra(DriveTrackingService.EXTRA_BEARING, 0f);
            double altitude = intent.getDoubleExtra(DriveTrackingService.EXTRA_ALTITUDE, 0);
            long timestamp = intent.getLongExtra(DriveTrackingService.EXTRA_TIMESTAMP, 0);

            Log.d("LocationReceiver", String.format("Lat: %.6f, Lng: %.6f, Speed: %.1f", lat, lng, speed * 3.6f));

            if (delegate != null) {
                delegate.onLocationUpdate(lat, lng, speed, accuracy, bearing, altitude, timestamp);
            }
        }
    }
}