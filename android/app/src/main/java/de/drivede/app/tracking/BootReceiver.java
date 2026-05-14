package de.drivede.app.tracking;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d("BootReceiver", "Device booted — checking if tracking was active");

            SharedPreferences prefs = context.getSharedPreferences("drivede_tracking", Context.MODE_PRIVATE);
            boolean wasTracking = prefs.getBoolean("auto_start_tracking", false);

            if (wasTracking) {
                Intent serviceIntent = new Intent(context, DriveTrackingService.class);
                serviceIntent.setAction("START");
                try {
                    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                        context.startForegroundService(serviceIntent);
                    } else {
                        context.startService(serviceIntent);
                    }
                    Log.d("BootReceiver", "Tracking service started after boot");
                } catch (Exception e) {
                    Log.e("BootReceiver", "Failed to start service after boot", e);
                }
            }
        }
    }
}