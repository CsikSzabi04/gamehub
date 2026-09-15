// Small fetch wrapper for the review/favorite endpoints (JSON body, optional Firebase ID token).
// Reads responses with res.json() (legacy endpoints may answer plain text such as "OK" -> null).
import { API_BASE } from '../Components/apiCache.js';
import { getIdToken } from '../lib/firebase.js';

export async function reviewRequest(method, path, { body, user } = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = await getIdToken(user);
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = null;
    try {
        data = await res.json();
    } catch {
        data = null;
    }
    if (!res.ok) {
        const error = new Error(data?.error || `Request failed (${res.status})`);
        error.status = res.status;
        error.data = data;
        throw error;
    }
    return data;
}
