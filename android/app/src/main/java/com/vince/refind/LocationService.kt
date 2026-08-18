package com.vince.refind

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.concurrent.TimeUnit

class LocationService : Service() {
    private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private val auth by lazy { FirebaseAuth.getInstance() }
    private val db by lazy { FirebaseFirestore.getInstance() }
    private lateinit var callback: LocationCallback

    override fun onCreate() {
        super.onCreate()
        createChannel()
        startForeground(42, notification())

        val deviceId = getSharedPreferences("refind", MODE_PRIVATE).getString("device_id", null) ?: return
        val userId = auth.currentUser?.uid ?: return

        val request = LocationRequest.Builder(60_000L)
            .setMinUpdateIntervalMillis(30_000L)
            .setPriority(com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY)
            .build()

        callback = object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                val location = result.lastLocation ?: return
                val payload = mapOf(
                    "latitude" to location.latitude,
                    "longitude" to location.longitude,
                    "accuracy" to location.accuracy,
                    "timestamp" to com.google.firebase.firestore.FieldValue.serverTimestamp()
                )
                db.collection("users").document(userId).collection("devices").document(deviceId)
                    .collection("locations").add(payload)
                db.collection("users").document(userId).collection("devices").document(deviceId)
                    .update("lastLocation", payload, "lastSeen", com.google.firebase.firestore.FieldValue.serverTimestamp())
            }
        }

        try {
            fused.requestLocationUpdates(request, callback, mainLooper)
        } catch (_: SecurityException) {
            stopSelf()
        }
    }

    override fun onDestroy() {
        if (::callback.isInitialized) fused.removeLocationUpdates(callback)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            val channel = NotificationChannel("refind_location", "ReFind recovery protection", NotificationManager.IMPORTANCE_LOW)
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun notification(): Notification = NotificationCompat.Builder(this, "refind_location")
        .setContentTitle("ReFind is protecting this phone")
        .setContentText("Location recovery is active for your registered device.")
        .setSmallIcon(android.R.drawable.ic_menu_mylocation)
        .setOngoing(true)
        .build()
}
