export async function apiFetch(path: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('seraphai_token') : null;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json();
}
