const pb = new PocketBase(window.REFIND_CONFIG?.apiUrl || 'http://127.0.0.1:8090');
pb.autoCancellation(false);
const KEY='refind_device_v2';
const $=id=>document.getElementById(id);
const state=JSON.parse(localStorage.getItem(KEY)||'null')||{deviceId:null,name:'',lost:false};
let map=null,marker=null,accuracyCircle=null,unsubscribe=null;
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function toast(message){const el=$('toast');el.textContent=message;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),3500)}
function fmt(n){return Number(n).toFixed(5)}
function formatLocation(d){return d?.lastLatitude==null?'Not available':`${fmt(d.lastLatitude)}, ${fmt(d.lastLongitude)}`}
function initMap(){if(map||!window.L)return;map=L.map('mapArea',{zoomControl:true,attributionControl:true}).setView([-1.2864,36.8172],12);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map)}
function drawLocation(d,fit=true){
  if(d?.lastLatitude==null||d?.lastLongitude==null)return;
  initMap();const point=[d.lastLatitude,d.lastLongitude];
  if(!marker){marker=L.marker(point).addTo(map)}else marker.setLatLng(point);
  marker.bindPopup(`<strong>${escapeHtml(d.name||'Registered phone')}</strong><br>Last seen: ${d.lastSeen?new Date(d.lastSeen).toLocaleString():'Unknown'}`).openPopup();
  if(!accuracyCircle){accuracyCircle=L.circle(point,{radius:Number(d.lastAccuracy||50),weight:1,fillOpacity:.12}).addTo(map)}else accuracyCircle.setLatLng(point).setRadius(Number(d.lastAccuracy||50));
  if(fit)map.setView(point,16);
}
function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function render(){
  $('deviceName').textContent=state.name||'No device registered';$('heroDeviceName').textContent=state.name||'No device registered';
  $('deviceMeta').textContent=pb.authStore.isValid?'Cloud account connected':'Sign in to sync your device';
  $('deviceStatus').textContent=state.lost?'LOST MODE':state.deviceId?'PROTECTED':'OFFLINE';$('syncPill').textContent=pb.authStore.isValid?'Realtime cloud sync':'Sign in required';
}
function applyDevice(d){
  if(!d)return;state.name=d.name||state.name;state.lost=d.status==='lost';state.deviceId=d.id;localStorage.setItem(KEY,JSON.stringify(state));render();
  $('lastLocation').textContent=formatLocation(d);$('heroLocation').textContent=formatLocation(d);$('mapTitle').textContent=d.lastLatitude==null?'Waiting for location':'Phone location updated';
  $('mapCaption')?.remove();$('battery').textContent=d.battery==null?'Unknown':`${Math.round(d.battery)}%`;$('lastUpdate').textContent=d.lastSeen?new Date(d.lastSeen).toLocaleString():'Never';
  if(d.lastLatitude!=null)drawLocation(d,true);
}
async function refreshDevice(){
  if(!pb.authStore.isValid||!state.deviceId)return;
  try{const d=await pb.collection('devices').getOne(state.deviceId);applyDevice(d);subscribeDevice()}catch(e){toast('Could not load your device. Check the backend URL and account.')}
}
function subscribeDevice(){
  if(!state.deviceId||!pb.authStore.isValid)return; if(unsubscribe){unsubscribe();unsubscribe=null}
  pb.collection('devices').subscribe(state.deviceId,e=>{if(e.action==='update'||e.action==='create')applyDevice(e.record)}).then(()=>{unsubscribe=()=>pb.collection('devices').unsubscribe(state.deviceId).catch(()=>{})}).catch(()=>{});
}
function authPanel(){
  if(document.getElementById('authPanel'))return;
  const panel=document.createElement('div');panel.id='authPanel';panel.className='glass';panel.style.cssText='position:fixed;inset:auto 20px 20px auto;z-index:50;width:min(360px,calc(100vw - 40px));padding:20px;box-shadow:0 20px 60px #0008';
  panel.innerHTML=`<h3>ReFind account</h3><p id="authStatus">Sign in to sync your phone.</p><input id="authEmail" type="email" placeholder="Email" style="width:100%;padding:12px;margin:6px 0"><input id="authPass" type="password" placeholder="Password" style="width:100%;padding:12px;margin:6px 0"><div style="display:flex;gap:8px;margin-top:8px"><button class="btn primary" id="loginBtn">Sign in</button><button class="btn secondary" id="signupBtn">Create account</button></div>`;
  document.body.appendChild(panel);$('loginBtn').onclick=()=>authenticate(false);$('signupBtn').onclick=()=>authenticate(true);
}
async function authenticate(create){
  const email=$('authEmail').value.trim(),password=$('authPass').value;if(!email||password.length<8){toast('Use an email and a password of at least 8 characters.');return}
  try{if(create)await pb.collection('users').create({email,password,passwordConfirm:password});await pb.collection('users').authWithPassword(email,password);$('authStatus').textContent=`Signed in as ${pb.authStore.record.email}`;toast('ReFind account connected.');await refreshDevice()}catch(e){toast(e?.response?.message||'Authentication failed.')}
}
async function register(){
  if(!pb.authStore.isValid){authPanel();toast('Sign in first so this device is securely owned by your account.');return}
  const name=prompt('Device name, e.g. “Vincent’s Phone”');if(!name?.trim())return;const deviceId=crypto.randomUUID();
  try{const d=await pb.collection('devices').create({owner:pb.authStore.record.id,deviceId,name:name.trim(),platform:'web',status:'protected'});state.deviceId=d.id;state.name=d.name;state.lost=false;save();applyDevice(d);toast('Device registered in the ReFind cloud.')}catch(e){toast(e?.response?.message||'Could not register device.')}
}
async function updateLocation(){
  if(!pb.authStore.isValid||!state.deviceId){register();return}if(!navigator.geolocation){toast('This browser does not provide geolocation.');return}
  navigator.geolocation.getCurrentPosition(async pos=>{try{await pb.collection('devices').update(state.deviceId,{lastLatitude:pos.coords.latitude,lastLongitude:pos.coords.longitude,lastAccuracy:pos.coords.accuracy,lastSeen:new Date().toISOString()});await pb.collection('locations').create({device:state.deviceId,latitude:pos.coords.latitude,longitude:pos.coords.longitude,accuracy:pos.coords.accuracy});toast(`Location sent. Accuracy ~${Math.round(pos.coords.accuracy)}m.`)}catch(e){toast('Location was captured but could not be uploaded.')}},err=>toast(err.code===1?'Location permission was denied.':err.message),{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}
async function lostMode(){if(!state.deviceId){register();return}try{state.lost=!state.lost;await pb.collection('devices').update(state.deviceId,{status:state.lost?'lost':'protected'});toast(state.lost?'Lost Mode enabled.':'Lost Mode disabled.')}catch(e){toast('Could not change Lost Mode.')}}
async function ring(){if(!state.deviceId){register();return}try{await pb.collection('devices').update(state.deviceId,{ringRequestedAt:new Date().toISOString()});toast('Ring command sent. The registered Android companion will act when online.')}catch(e){toast('Could not send ring command.')}}
$('locateBtn').addEventListener('click',updateLocation);$('ringBtn').addEventListener('click',ring);$('lostBtn').addEventListener('click',lostMode);
document.querySelector('[data-scroll="devices"]').addEventListener('click',()=>document.getElementById('devices').scrollIntoView());document.querySelector('[data-scroll="recovery"]').addEventListener('click',()=>document.getElementById('recovery').scrollIntoView());
const installBtn=$('installBtn');let deferredPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false});installBtn.addEventListener('click',async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;installBtn.hidden=true}});
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
pb.authStore.onChange(()=>{render();refreshDevice()});
initMap();if(pb.authStore.isValid)authPanel();render();refreshDevice();
