package com.vince.refind

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.BatteryManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit

class LocationService : Service() {
    private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }
    private val executor=Executors.newSingleThreadScheduledExecutor()
    private lateinit var callback: LocationCallback
    private var lastRingCommand:String?=null

    override fun onCreate(){
        super.onCreate();createChannel();startForeground(42,notification())
        val request=LocationRequest.Builder(60_000L).setMinUpdateIntervalMillis(30_000L).setPriority(com.google.android.gms.location.Priority.PRIORITY_HIGH_ACCURACY).build()
        callback=object:LocationCallback(){
            override fun onLocationResult(result:LocationResult){
                val location=result.lastLocation?:return
                executor.execute { try{ReFindApi.updateLocation(this@LocationService,location.latitude,location.longitude,location.accuracy,batteryPercent())}catch(_:Exception){} }
            }
        }
        try{fused.requestLocationUpdates(request,callback,mainLooper)}catch(_:SecurityException){stopSelf()}
        executor.scheduleAtFixedRate({pollCommands()},5,10,TimeUnit.SECONDS)
    }

    private fun pollCommands(){
        try{
            val device=ReFindApi.getDevice(this)
            val requested=device.optString("ringRequestedAt","")
            if(requested.isNotBlank()&&requested!=lastRingCommand){lastRingCommand=requested;playRing()}
        }catch(_:Exception){}
    }

    private fun playRing(){
        try{RingtoneManager.getRingtone(this,RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE))?.play()}catch(_:Exception){}
    }

    private fun batteryPercent():Int?{
        val manager=getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val level=manager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        return if(level in 0..100)level else null
    }

    override fun onDestroy(){if(::callback.isInitialized)fused.removeLocationUpdates(callback);executor.shutdownNow();super.onDestroy()}
    override fun onBind(intent:Intent?):IBinder?=null
    private fun createChannel(){if(Build.VERSION.SDK_INT>=26)getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel("refind_location","ReFind recovery protection",NotificationManager.IMPORTANCE_LOW))}
    private fun notification():Notification=NotificationCompat.Builder(this,"refind_location").setContentTitle("ReFind is protecting this phone").setContentText("Location recovery is active for your registered device.").setSmallIcon(android.R.drawable.ic_menu_mylocation).setOngoing(true).build()
}
