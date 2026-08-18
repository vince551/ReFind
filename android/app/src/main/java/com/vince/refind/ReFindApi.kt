package com.vince.refind

import android.content.Context
import java.net.HttpURLConnection
import java.net.URL
import java.io.OutputStreamWriter
import org.json.JSONObject

object ReFindApi {
    private const val DEFAULT_URL = "http://10.0.2.2:8090"
    private const val PREFS = "refind"
    private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    private fun base(ctx: Context) = prefs(ctx).getString("api_url", DEFAULT_URL)!!.removeSuffix("/")
    fun token(ctx: Context) = prefs(ctx).getString("token", null)
    fun deviceId(ctx: Context) = prefs(ctx).getString("device_record_id", null)
    fun savedDeviceId(ctx: Context) = prefs(ctx).getString("device_id", null)
    fun setSession(ctx: Context, token: String, userId: String) = prefs(ctx).edit().putString("token", token).putString("user_id", userId).apply()
    fun setDevice(ctx: Context, recordId: String, deviceId: String) = prefs(ctx).edit().putString("device_record_id", recordId).putString("device_id", deviceId).apply()
    fun auth(ctx: Context, email: String, password: String): String {
        val json = JSONObject(request(ctx, "POST", "/api/collections/users/auth-with-password", JSONObject().put("identity", email).put("password", password), null))
        setSession(ctx, json.getString("token"), json.getJSONObject("record").getString("id")); return json.getJSONObject("record").getString("email")
    }
    fun signup(ctx: Context, email: String, password: String): String {
        request(ctx, "POST", "/api/collections/users/records", JSONObject().put("email", email).put("password", password).put("passwordConfirm", password), null)
        return auth(ctx, email, password)
    }
    fun registerDevice(ctx: Context, name: String, deviceId: String): String {
        val userId = prefs(ctx).getString("user_id", null) ?: error("Not signed in")
        val json = JSONObject(request(ctx, "POST", "/api/collections/devices/records", JSONObject().put("owner", userId).put("deviceId", deviceId).put("name", name).put("platform", "android").put("status", "protected"), token(ctx)))
        setDevice(ctx, json.getString("id"), deviceId); return json.getString("id")
    }
    fun updateLocation(ctx: Context, lat: Double, lng: Double, accuracy: Float, battery: Int?) {
        val recordId = deviceId(ctx) ?: return
        val now = java.time.Instant.now().toString()
        val body = JSONObject().put("lastLatitude", lat).put("lastLongitude", lng).put("lastAccuracy", accuracy).put("lastSeen", now).put("lastHeartbeat", now)
        if (battery != null) body.put("battery", battery)
        request(ctx, "PATCH", "/api/collections/devices/records/$recordId", body, token(ctx))
        val location = JSONObject().put("device", recordId).put("latitude", lat).put("longitude", lng).put("accuracy", accuracy)
        if (battery != null) location.put("battery", battery)
        request(ctx, "POST", "/api/collections/locations/records", location, token(ctx))
    }
    fun getDevice(ctx: Context): JSONObject = JSONObject(request(ctx, "GET", "/api/collections/devices/records/${deviceId(ctx)}", null, token(ctx)))
    fun heartbeat(ctx: Context) {
        val id=deviceId(ctx) ?: return
        request(ctx,"PATCH","/api/collections/devices/records/$id",JSONObject().put("lastHeartbeat",java.time.Instant.now().toString()),token(ctx))
    }
    fun acknowledgeRing(ctx: Context, requestedAt: String) {
        val id=deviceId(ctx) ?: return
        request(ctx,"PATCH","/api/collections/devices/records/$id",JSONObject().put("ringHandledAt",java.time.Instant.now().toString()).put("lastCommand","ring_ack").put("lastCommandAt",requestedAt),token(ctx))
    }
    private fun request(ctx: Context, method: String, path: String, body: JSONObject?, token: String?): String {
        val c = URL(base(ctx) + path).openConnection() as HttpURLConnection
        c.requestMethod = method; c.setRequestProperty("Content-Type", "application/json"); if (!token.isNullOrBlank()) c.setRequestProperty("Authorization", token)
        c.connectTimeout = 10000; c.readTimeout = 15000
        if (body != null) { c.doOutput = true; OutputStreamWriter(c.outputStream).use { it.write(body.toString()) } }
        val code = c.responseCode; val stream = if (code in 200..299) c.inputStream else c.errorStream; val text = stream.bufferedReader().use { it.readText() }
        if (code !in 200..299) throw IllegalStateException(text); return text
    }
}
