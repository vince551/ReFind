const KEY='refind_device_v1';
const $=id=>document.getElementById(id);
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{name:'',location:null,battery:null,updated:null,lost:false};
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),3500)}
function formatLocation(loc){if(!loc)return 'Not available';return `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`}
function render(){
  const name=state.name||'No device registered';
  $('deviceName').textContent=name;$('heroDeviceName').textContent=name;
  $('deviceMeta').textContent=state.name?'This browser is registered as your recovery device.':'Register this phone to begin.';
  $('lastLocation').textContent=formatLocation(state.location);
  $('heroLocation').textContent=state.location?formatLocation(state.location):'Location unavailable';
  $('mapTitle').textContent=state.location?'Location captured':'Waiting for location';
  $('mapCaption').textContent=state.location?`Latest GPS: ${formatLocation(state.location)}`:'Allow location access to place your device on the map.';
  $('battery').textContent=state.battery===null?'Unknown':`${state.battery}%`;
  $('lastUpdate').textContent=state.updated?new Date(state.updated).toLocaleString():'Never';
  $('deviceStatus').textContent=state.lost?'LOST MODE':state.location?'READY':'OFFLINE';
  $('deviceStatus').style.color=state.lost?'#ff9aaa':state.location?'#48e5a0':'';
  $('syncPill').textContent=state.location?'Location permission active':'Local prototype';
}
async function battery(){try{if(navigator.getBattery){const b=await navigator.getBattery();state.battery=Math.round(b.level*100);b.addEventListener('levelchange',()=>{state.battery=Math.round(b.level*100);save()})}}catch(e){}save()}
function updateLocation(){
  if(!navigator.geolocation){toast('This browser does not provide geolocation.');return}
  toast('Requesting your device location…');
  navigator.geolocation.getCurrentPosition(pos=>{
    state.location={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:Math.round(pos.coords.accuracy)};state.updated=Date.now();save();
    toast(`Location updated. Accuracy about ${Math.round(pos.coords.accuracy)}m.`)
  },err=>{toast(err.code===1?'Location permission was denied.':`Location unavailable: ${err.message}`)},{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}
function register(){
  const name=prompt('Give this device a name, e.g. “Vincent’s Phone”');
  if(!name||!name.trim())return;
  state.name=name.trim();state.lost=false;save();battery();updateLocation();toast('Device registered. Keep ReFind ready before you lose it.');
}
$('locateBtn').addEventListener('click',updateLocation);
$('ringBtn').addEventListener('click',()=>{if(!state.name){register();return} if('vibrate' in navigator)navigator.vibrate([300,150,300]);toast('Ring command is ready for the companion app. The web MVP can only vibrate the current device.');});
$('lostBtn').addEventListener('click',()=>{if(!state.name){register();return}state.lost=!state.lost;save();toast(state.lost?'Lost Mode enabled.':'Lost Mode disabled.')});
document.querySelector('[data-scroll="devices"]').addEventListener('click',()=>{document.getElementById('devices').scrollIntoView()});
document.querySelector('[data-scroll="recovery"]').addEventListener('click',()=>{document.getElementById('recovery').scrollIntoView()});
const installBtn=$('installBtn');let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();deferredPrompt=null;installBtn.hidden=true});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
window.addEventListener('storage',render);render();
setTimeout(()=>{if(!state.name)toast('Start by registering the phone you want to protect.')},900);
// The production version will replace localStorage with an authenticated cloud service and a native Android companion agent.
