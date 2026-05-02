// Small Fetch wrapper to centralize API calls.
// This is backend-ready: supports baseUrl, JSON headers and token.

const BASE_URL = ''; // keep empty for now; set backend URL when available

function buildHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handleResponse(res) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const err = (data && data.message) || res.statusText || 'API error';
      throw new Error(err);
    }
    return data;
  } catch (e) {
    // if JSON parse failed, still handle status
    if (!res.ok) throw new Error(res.statusText || 'Network error');
    return text;
  }
}

export async function apiGet(path, { token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  return handleResponse(res);
}

export async function apiPost(path, body = {}, { token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export default { apiGet, apiPost };
