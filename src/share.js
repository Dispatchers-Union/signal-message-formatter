// Share links for Incident Wrangler. The form data is packed into the URL
// fragment (#iw=...). Browsers never send the fragment to the server, so the
// data only travels inside the link itself.

const PARAM = 'iw';

// UTF-8 safe base64url (emoji survive the round trip).
function encode(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

export function buildShareLink(data) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#${PARAM}=${encode(data)}`;
}

// Returns the decoded data, or null if the URL has no (valid) share data.
export function readShareData(hash = window.location.hash) {
  const match = hash.match(new RegExp(`[#&]${PARAM}=([^&]+)`));
  if (!match) return null;
  try {
    return decode(match[1]);
  } catch {
    return null;
  }
}

export function clearShareData() {
  const { pathname, search } = window.location;
  window.history.replaceState(null, '', pathname + search);
}
