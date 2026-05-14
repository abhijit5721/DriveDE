package de.drivede.app.tracking;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.annotation.NonNull;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import android.Manifest;
import android.content.pm.PackageManager;

@CapacitorPlugin
public class DriveTrackingPlugin extends Plugin {

    public static final String PREFS_NAME = "drivede_tracking";
    private static DriveTrackingPlugin instance;

    public static DriveTrackingPlugin getInstance() {
        return instance;
    }

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @PluginMethod
    public void startTracking(PluginCall call) {
        Context context = bridge.getContext();
        try {
            Intent serviceIntent = new Intent(context, DriveTrackingService.class);
            serviceIntent.setAction("START");
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent);
            } else {
                context.startService(serviceIntent);
            }
            call.resolve(new JSObject().put("success", true));
        } catch (Exception e) {
            call.reject("Failed to start tracking service", e);
        }
    }

    @PluginMethod
    public void stopTracking(PluginCall call) {
        Context context = bridge.getContext();
        try {
            Intent serviceIntent = new Intent(context, DriveTrackingService.class);
            serviceIntent.setAction("STOP");
            context.startService(serviceIntent);
            call.resolve(new JSObject().put("success", true));
        } catch (Exception e) {
            call.reject("Failed to stop tracking service", e);
        }
    }

    @PluginMethod
    public void isTracking(PluginCall call) {
        Context context = bridge.getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        boolean tracking = prefs.getBoolean("is_tracking", false);
        call.resolve(new JSObject().put("tracking", tracking));
    }

    @PluginMethod
    public void getLastLocation(PluginCall call) {
        SharedPreferences prefs = bridge.getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        double lat = Double.longBitsToDouble(prefs.getLong("last_lat", Double.doubleToLongBits(0)));
        double lng = Double.longBitsToDouble(prefs.getLong("last_lng", Double.doubleToLongBits(0)));
        if (lat == 0 && lng == 0) {
            call.resolve(new JSObject().put("lat", 0).put("lng", 0));
            return;
        }
        JSObject result = new JSObject();
        result.put("lat", lat);
        result.put("lng", lng);
        result.put("speed", prefs.getFloat("last_speed", 0f));
        result.put("accuracy", prefs.getFloat("last_accuracy", 0f));
        result.put("bearing", prefs.getFloat("last_bearing", 0f));
        result.put("altitude", Double.longBitsToDouble(prefs.getLong("last_altitude", Double.doubleToLongBits(0))));
        result.put("timestamp", prefs.getLong("last_timestamp", 0));
        call.resolve(result);
    }

    @PluginMethod
    public void requestBackgroundPermission(PluginCall call) {
        Context context = bridge.getContext();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            boolean granted = context.checkSelfPermission(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                == PackageManager.PERMISSION_GRANTED;
            call.resolve(new JSObject().put("granted", granted));
        } else {
            call.resolve(new JSObject().put("granted", true));
        }
    }

    @PluginMethod
    public void enableAutoStart(PluginCall call) {
        boolean enable = call.getBoolean("enable", false);
        Context context = bridge.getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putBoolean("auto_start_tracking", enable).apply();
        call.resolve();
    }

    public void notifyLocationUpdate(double lat, double lng, float speed, float accuracy, float bearing, double altitude, long timestamp) {
        Context context = bridge.getContext();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putBoolean("is_tracking", true)
            .putLong("last_lat", Double.doubleToLongBits(lat))
            .putLong("last_lng", Double.doubleToLongBits(lng))
            .putFloat("last_speed", speed)
            .putFloat("last_accuracy", accuracy)
            .putFloat("last_bearing", bearing)
            .putLong("last_altitude", Double.doubleToLongBits(altitude))
            .putLong("last_timestamp", timestamp)
            .apply();

        JSObject ret = new JSObject();
        ret.put("lat", lat);
        ret.put("lng", lng);
        ret.put("speed", speed);
        ret.put("accuracy", accuracy);
        ret.put("bearing", bearing);
        ret.put("altitude", altitude);
        ret.put("timestamp", timestamp);
        notifyListeners("onLocationUpdate", ret);
    }
}