// Set this to the public HTTPS URL of your PocketBase server in production.
// Local development: http://127.0.0.1:8090
window.REFIND_CONFIG = {
  apiUrl: localStorage.getItem('refind_api_url') || 'http://127.0.0.1:8090'
};
