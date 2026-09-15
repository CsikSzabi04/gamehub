// Backend calls for the community features.
//
//   const data = await apiGet('/price/steam/730');
//   await apiPost('/notify/social', { type: 'follow', targetUid }, user);   // sends the Firebase ID token
import { API_BASE } from '../Components/apiCache.js';
import { getIdToken } from './firebase.js';

export { API_BASE };

async function request(method, path, body, user) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    const token = await getIdToken(user);
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }
    if (!res.ok) {
        const error = new Error(data?.error || `Request failed (${res.status})`);
        error.status = res.status;
        error.data = data;
        throw error;
    }
    return data;
}

export const apiGet = (path, user) => request('GET', path, undefined, user);
export const apiPost = (path, body, user) => request('POST', path, body ?? {}, user);
export const apiDelete = (path, body, user) => request('DELETE', path, body, user);
