import config from '../config/config.js';

/** Where users open the app in the browser (no /api path). Used for OAuth return redirects. */
export function getPublicAppOrigin() {
  if (process.env.PUBLIC_APP_URL) {
    return String(process.env.PUBLIC_APP_URL).replace(/\/$/, '');
  }
  if (config.google?.callbackUrl) {
    const base = config.google.callbackUrl.replace(/\/api\/auth\/google\/callback\/?$/i, '');
    if (base) return base.replace(/\/$/, '');
  }
  const o = config.cors.origin;
  if (Array.isArray(o)) return String(o[0] || '').replace(/\/$/, '');
  return String(o || 'http://localhost:5173').replace(/\/$/, '');
}
