/** Parse /room/:roomId from pathname (cold loads, shared links, trailing slashes). */
export function roomIdFromPathname(pathname) {
  const pathOnly = pathname.split(/[?#]/)[0] || '';
  const segments = pathOnly.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments[0] !== 'room' || !segments[1]) return null;
  const id = segments[1].replace(/[^a-zA-Z0-9\-]/g, '');
  return id || null;
}
