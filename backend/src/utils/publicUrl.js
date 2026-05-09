import config from '../config/config.js';

function norm(origin) {
  return String(origin || '').trim().replace(/\/+$/, '');
}

/**
 * Origin where users actually open the app in the browser (no /path, no /api).
 * Invite links + OAuth redirects must target this host — often the STATIC site (e.g. …-1.onrender.com),
 * while GOOGLE_CALLBACK_URL points at the API host. Prefer CORS_ORIGIN or PUBLIC_APP_URL.
 */
export function getPublicAppOrigin() {
  if (process.env.PUBLIC_APP_URL) return norm(process.env.PUBLIC_APP_URL);
  if (process.env.FRONTEND_URL) return norm(process.env.FRONTEND_URL);

  const o = config.cors.origin;
  if (Array.isArray(o)) {
    for (const entry of o) {
      const n = norm(entry);
      if (n) return n;
    }
  } else if (typeof o === 'string' && o.includes(',')) {
    for (const part of o.split(',')) {
      const n = norm(part);
      if (n) return n;
    }
  } else if (typeof o === 'string' && o.trim()) {
    return norm(o);
  }

  if (config.google?.callbackUrl) {
    const base = config.google.callbackUrl.replace(/\/api\/auth\/google\/callback\/?$/i, '');
    if (base) return norm(base);
  }
  return 'http://localhost:5173';
}
