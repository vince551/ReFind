package com.vince.refind

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import java.util.UUID

class MainActivity : ComponentActivity() {
    private val prefs by lazy { getSharedPreferences("refind", MODE_PRIVATE) }
    private lateinit var status: TextView
    private lateinit var email: EditText
    private lateinit var password: EditText
    private lateinit var apiUrl: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        status = TextView(this).apply { text = "ReFind\n\nRegister this phone before it gets lost."; textSize = 20f; setPadding(16,16,16,16) }
        email = EditText(this).apply { hint = "ReFind email" }
        password = EditText(this).apply { hint = "Password (8+ characters)"; inputType = 0x81 }
        apiUrl = EditText(this).apply { hint = "PocketBase URL"; setText(prefs.getString("api_url", "http://10.0.2.2:8090")) }
        val login = Button(this).apply { text = "Sign in" }
        val signup = Button(this).apply { text = "Create account" }
        val register = Button(this).apply { text = "Register this phone" }
        val tracking = Button(this).apply { text = "Start recovery protection" }
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL; setPadding(24,24,24,24)
            addView(status); addView(apiUrl); addView(email); addView(password); addView(login); addView(signup); addView(register); addView(tracking)
        }
        setContentView(layout)

        login.setOnClickListener { runCatching { saveApiUrl(); val who = ReFindApi.auth(this, email.text.toString().trim(), password.text.toString()); status.text = "Signed in as $who ✓" }.onFailure { status.text = "Sign in failed: ${it.message}" } }
        signup.setOnClickListener { runCatching { saveApiUrl(); val who = ReFindApi.signup(this, email.text.toString().trim(), password.text.toString()); status.text = "Account created for $who ✓" }.onFailure { status.text = "Sign up failed: ${it.message}" } }
        register.setOnClickListener {
            runCatching {
                if (ReFindApi.token(this) == null) error("Sign in first")
                val deviceId = ReFindApi.savedDeviceId(this) ?: UUID.randomUUID().toString().also { prefs.edit().putString("device_id", it).apply() }
                ReFindApi.registerDevice(this, android.os.Build.MODEL, deviceId)
                status.text = "Phone registered ✓\nDevice ID: $deviceId"
            }.onFailure { status.text = "Registration failed: ${it.message}" }
        }
        tracking.setOnClickListener {
            saveApiUrl()
            if (!hasLocationPermission()) {
                ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 100); return@setOnClickListener
            }
            if (android.os.Build.VERSION.SDK_INT >= 29 && ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                status.text = "Open ReFind location settings and allow background location for recovery protection."
                startActivity(Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply { data = android.net.Uri.parse("package:$packageName") }); return@setOnClickListener
            }
            if (ReFindApi.deviceId(this) == null) { status.text = "Register this phone first."; return@setOnClickListener }
            ContextCompat.startForegroundService(this, Intent(this, LocationService::class.java))
            status.text = "Recovery protection active ✓\nKeep the ReFind notification visible."
        }
    }

    private fun saveApiUrl() { prefs.edit().putString("api_url", apiUrl.text.toString().trim().removeSuffix("/")).apply() }
    private fun hasLocationPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
}
