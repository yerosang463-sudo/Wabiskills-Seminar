/** Resolve REST API base (e.g. https://host/api or same-origin /api). */
export function resolveApiBase() {
  const v = import.meta.env.VITE_API_URL;
  if (typeof v === 'string' && v.startsWith('http')) return v;
  if (typeof v === 'string' && v.startsWith('/') && typeof window !== 'undefined') {
    return `${window.location.origin}${v}`;
  }
  if (import.meta.env.DEV) return 'http://localhost:3000/api';
  if (typeof window !== 'undefined') return `${window.location.origin}/api`;
  return 'http://localhost:3000/api';
}

/** Socket.IO connects to HTTP origin without /api. */
export function resolveSocketOrigin() {
  const v = import.meta.env.VITE_API_URL;
  if (typeof v === 'string' && v.startsWith('http')) {
    return v.replace(/\/?api\/?$/, '') || v;
  }
  if (typeof v === 'string' && v.startsWith('/') && typeof window !== 'undefined') {
    return window.location.origin;
  }
  if (import.meta.env.DEV) return 'http://localhost:3000';
  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}
