import { json } from '../server/_lib/http.js';
import adminDeleteUser from '../server/admin/delete-user.js';
import adminUsers from '../server/admin/users.js';
import chatCompletions from '../server/chat/completions.js';
import checkinCreate from '../server/checkins/create.js';
import checkinHasToday from '../server/checkins/has-today.js';
import communityCreate from '../server/community/create.js';
import communityDelete from '../server/community/delete.js';
import communityLike from '../server/community/like.js';
import communityList from '../server/community/list.js';
import communityUpdate from '../server/community/update.js';
import fatsecretAnalyze from '../server/fatsecret/analyze.js';
import fatsecretSearch from '../server/fatsecret/search.js';
import health from '../server/health.js';
import userEnsure from '../server/users/ensure.js';

const routes = new Map([
  ['admin/delete-user', adminDeleteUser],
  ['admin/users', adminUsers],
  ['chat/completions', chatCompletions],
  ['checkins/create', checkinCreate],
  ['checkins/has-today', checkinHasToday],
  ['community/create', communityCreate],
  ['community/delete', communityDelete],
  ['community/like', communityLike],
  ['community/list', communityList],
  ['community/update', communityUpdate],
  ['fatsecret/analyze', fatsecretAnalyze],
  ['fatsecret/search', fatsecretSearch],
  ['health', health],
  ['users/ensure', userEnsure],
]);

const allowedOrigins = new Set([
  'https://maharanee4.github.io',
  ...(globalThis.process?.env?.CORS_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  if (origin && allowedOrigins.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = origin && !allowedOrigins.has(origin) ? 403 : 204;
    return res.end();
  }

  const rawRoute = req.query?.route;
  const route = Array.isArray(rawRoute) ? rawRoute.join('/') : String(rawRoute || '');
  const routeHandler = routes.get(route.replace(/^\/+|\/+$/g, ''));

  if (!routeHandler) {
    return json(res, 404, { ok: false, error: 'API route not found' });
  }

  return routeHandler(req, res);
}
