package com.vince.refind

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.UUID

class MainActivity : ComponentActivity() {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val deviceId by lazy {
        getPreferences(MODE_PRIVATE).getString("device_id", null) ?: UUID.randomUUID().toString().also {
            getPreferences(MODE_PRIVATE).edit().putString("device_id", it).apply()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val status = TextView(this).apply {
            text = "ReFind\n\nProtect this phone before you lose it."
            textSize = 22f
            setPadding(48, 64, 48, 32)
        }
        val register = Button(this).apply { text = "Register this phone" }
        val tracking = Button(this).apply { text = "Start recovery protection" }

        val layout = android.widget.LinearLayout(this).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
            addView(status)
            addView(register)
            addView(tracking)
        }
        setContentView(layout)

        register.setOnClickListener {
            if (auth.currentUser == null) {
                status.text = "Sign in is required. Connect this app to the same ReFind account used by the recovery dashboard."
                return@setOnClickListener
            }
            val userId = auth.currentUser!!.uid
            db.collection("users").document(userId).collection("devices").document(deviceId)
                .set(mapOf(
                    "deviceId" to deviceId,
                    "name" to android.os.Build.MODEL,
                    "platform" to "android",
                    "registeredAt" to com.google.firebase.firestore.FieldValue.serverTimestamp(),
                    "status" to "protected"
                ))
            status.text = "Phone registered ✓\nDevice ID: $deviceId"
        }

        tracking.setOnClickListener {
            if (!hasLocationPermission()) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 100)
                return@setOnClickListener
            }
            if (android.os.Build.VERSION.SDK_INT >= 29 && !hasBackgroundLocation()) {
                status.text = "For recovery protection, enable 'Allow all the time' in ReFind's location settings."
                startActivity(Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = android.net.Uri.parse("package:$packageName")
                })
                return@setOnClickListener
            }
            ContextCompat.startForegroundService(this, Intent(this, LocationService::class.java))
            status.text = "Recovery protection is active ✓\nA persistent Android notification will show while location protection runs."
        }
    }

    private fun hasLocationPermission() =
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    private fun hasBackgroundLocation() = android.os.Build.VERSION.SDK_INT < 29 ||
        ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED
}
