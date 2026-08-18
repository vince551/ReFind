package com.vince.refind

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import java.util.UUID

class MainActivity : ComponentActivity() {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    private val prefs by lazy { getSharedPreferences("refind", MODE_PRIVATE) }
    private val deviceId by lazy {
        prefs.getString("device_id", null) ?: UUID.randomUUID().toString().also {
            prefs.edit().putString("device_id", it).apply()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); showScreen() }

    private fun showScreen() {
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(32, 40, 32, 32) }
        root.addView(TextView(this).apply { text = "ReFind\n\nFind your registered phone when it gets lost."; textSize = 24f; setPadding(0,0,0,24) })
        val email = EditText(this).apply { hint = "Email"; inputType = 33 }
        val password = EditText(this).apply { hint = "Password"; inputType = 129 }
        val signIn = Button(this).apply { text = "Sign in" }
        val create = Button(this).apply { text = "Create ReFind account" }
        val register = Button(this).apply { text = "Register this phone" }
        val tracking = Button(this).apply { text = "Start recovery protection" }
        val status = TextView(this).apply { text = if (auth.currentUser != null) "Signed in ✓" else "Not signed in" }
        listOf(email,password,signIn,create,register,tracking,status).forEach(root::addView)
        setContentView(root)

        signIn.setOnClickListener { authenticate(email.text.toString(), password.text.toString(), false, status) }
        create.setOnClickListener { authenticate(email.text.toString(), password.text.toString(), true, status) }
        register.setOnClickListener {
            val user = auth.currentUser ?: run { status.text = "Sign in first."; return@setOnClickListener }
            db.collection("users").document(user.uid).collection("devices").document(deviceId)
                .set(mapOf("deviceId" to deviceId, "name" to android.os.Build.MODEL, "platform" to "android", "registeredAt" to com.google.firebase.firestore.FieldValue.serverTimestamp(), "status" to "protected"))
                .addOnSuccessListener { status.text = "Phone registered ✓\nDevice ID: $deviceId" }
                .addOnFailureListener { status.text = "Registration failed: ${it.message}" }
        }
        tracking.setOnClickListener {
            if (auth.currentUser == null) { status.text = "Sign in first."; return@setOnClickListener }
            if (!hasLocationPermission()) { ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 100); return@setOnClickListener }
            if (android.os.Build.VERSION.SDK_INT >= 29 && !hasBackgroundLocation()) {
                status.text = "Enable 'Allow all the time' for recovery protection, then return to ReFind."
                startActivity(Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply { data = android.net.Uri.parse("package:$packageName") }); return@setOnClickListener
            }
            ContextCompat.startForegroundService(this, Intent(this, LocationService::class.java))
            status.text = "Recovery protection active ✓"
        }
    }

    private fun authenticate(email: String, password: String, create: Boolean, status: TextView) {
        if (email.isBlank() || password.length < 6) { status.text = "Enter an email and a password of at least 6 characters."; return }
        val task = if (create) auth.createUserWithEmailAndPassword(email, password) else auth.signInWithEmailAndPassword(email, password)
        task.addOnSuccessListener { status.text = "Signed in ✓" }.addOnFailureListener { status.text = "Authentication failed: ${it.message}" }
    }
    private fun hasLocationPermission() = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    private fun hasBackgroundLocation() = android.os.Build.VERSION.SDK_INT < 29 || ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION) == PackageManager.PERMISSION_GRANTED
}
