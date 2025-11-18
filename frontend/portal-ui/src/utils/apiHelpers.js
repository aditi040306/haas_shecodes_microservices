/**********************************************************************************************************
 * @file        apiHelpers.js 
 * @description Helper Utility, to request for different services (login/register/etc)
 * @team        SheCodes-Hub (MSITM'26 @ McComb School of Business, UT Austin)
 * @created     2025-07-24
 * @version     v1.0.1  (added optional base override, fully backward compatible)
 **********************************************************************************************************/
import { BASE_URL, PROJECT_BASE, INVENTORY_BASE } from './apiConfig';

// tiny util: pick a base with graceful fallback
function pickBase(base) {
  return base || BASE_URL;
}

// POST
export async function postToEndpoint(endpoint, payload, base) {
  const response = await fetch(`${pickBase(base)}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({ message: 'Unexpected response' }));
  return { ok: response.ok, data };
}

// GET
export async function getFromEndpoint(endpoint, queryParams = {}, base) {
  try {
    const query = new URLSearchParams(queryParams).toString();
    const url = query ? `${pickBase(base)}/${endpoint}?${query}` : `${pickBase(base)}/${endpoint}`;
    const response = await fetch(url);

    const data = await response.json().catch(() => ({ message: 'Unexpected response' }));
    return { ok: response.ok, data };
  } catch (error) {
    return { ok: false, data: { message: error.message } };
  }
}

/* Optional convenience (no breaking changes): if you want,
   you can import these where needed instead of passing `base` manually. */
export const postProject   = (ep, body)     => postToEndpoint(ep, body, PROJECT_BASE);
export const getProject    = (ep, params)   => getFromEndpoint(ep, params, PROJECT_BASE);
export const postInventory = (ep, body)     => postToEndpoint(ep, body, INVENTORY_BASE);
export const getInventory  = (ep, params)   => getFromEndpoint(ep, params, INVENTORY_BASE);
