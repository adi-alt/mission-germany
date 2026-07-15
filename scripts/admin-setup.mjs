// One-shot Firebase admin setup: deploys firestore.rules, uploads the master
// packing list to /seedItems, and bootstraps the first admin invite.
//
//   node scripts/admin-setup.mjs /path/to/service-account.json
//
// ponytail: stdlib REST instead of firebase-admin — saves a 100MB dependency.
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { seedItems } from '../lib/seed.ts'; // node 23.6+ strips types natively

const BOOTSTRAP_ADMIN = 'aditya.verma@softage.ai';

const saPath = process.argv[2] ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!saPath) throw new Error('Usage: node scripts/admin-setup.mjs <service-account.json>');
const sa = JSON.parse(readFileSync(saPath, 'utf8'));
const PID = sa.project_id;

async function getToken() {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: sa.token_uri, iat: now, exp: now + 3600,
  })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.private_key, 'base64url');
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${sig}`,
    }),
  });
  if (!res.ok) throw new Error(`token: ${await res.text()}`);
  return (await res.json()).access_token;
}

const token = await getToken();
async function api(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${method} ${url}: ${res.status} ${await res.text()}`);
  return res.json();
}

// --- 1. deploy firestore.rules ---
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
const ruleset = await api(`https://firebaserules.googleapis.com/v1/projects/${PID}/rulesets`, 'POST', {
  source: { files: [{ name: 'firestore.rules', content: rules }] },
});
await api(
  `https://firebaserules.googleapis.com/v1/projects/${PID}/releases/cloud.firestore?updateMask=rulesetName`,
  'PATCH',
  { release: { name: `projects/${PID}/releases/cloud.firestore`, rulesetName: ruleset.name } },
);
console.log('✓ rules deployed:', ruleset.name);

// --- 2. bootstrap admin user + their seeded list ---
const DOCS = `projects/${PID}/databases/(default)/documents`;

// One-time cleanup of the old schema (seedItems + invites collections, uid-keyed users/presence docs)
async function listIds(col) {
  const res = await fetch(`https://firestore.googleapis.com/v1/${DOCS}/${col}?pageSize=300&mask.fieldPaths=__name__`, {
    headers: { authorization: `Bearer ${token}` },
  });
  return ((await res.json()).documents ?? []).map((d) => d.name);
}
const stale = [
  ...(await listIds('seedItems')),
  ...(await listIds('invites')),
  ...(await listIds('users')).filter((n) => !n.split('/').pop().includes('@')),
  ...(await listIds('presence')).filter((n) => !n.split('/').pop().includes('@')),
];
if (stale.length) {
  await api(`https://firestore.googleapis.com/v1/${DOCS}:batchWrite`, 'POST', {
    writes: stale.map((name) => ({ delete: name })),
  });
  console.log(`✓ removed ${stale.length} old-schema docs`);
}
const val = (v) =>
  typeof v === 'boolean' ? { booleanValue: v }
  : typeof v === 'number' ? { integerValue: String(v) }
  : Array.isArray(v) ? { arrayValue: { values: v.map(val) } }
  : typeof v === 'object' ? { mapValue: { fields: fields(v) } }
  : { stringValue: v };
const fields = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, val(v)]));

// Both writes are create-only (exists:false): reruns never reset live data
const writes = [
  {
    update: {
      name: `${DOCS}/users/${BOOTSTRAP_ADMIN}`,
      fields: fields({ email: BOOTSTRAP_ADMIN, type: 'admin', status: 'invited', invitedBy: 'bootstrap' }),
    },
    currentDocument: { exists: false },
  },
  {
    update: {
      name: `${DOCS}/lists/${BOOTSTRAP_ADMIN}`,
      fields: fields({ items: seedItems().map((it, i) => ({ id: `item-${String(i).padStart(3, '0')}`, ...it })) }),
    },
    currentDocument: { exists: false },
  },
];
const res = await api(`https://firestore.googleapis.com/v1/${DOCS}:batchWrite`, 'POST', { writes });
const failed = res.status.filter((s) => s.code && s.code !== 6); // 6 = already exists, fine
if (failed.length) throw new Error(`batchWrite failures: ${JSON.stringify(failed.slice(0, 3))}`);
console.log(`✓ admin user ${BOOTSTRAP_ADMIN} + seeded packing list ready`);
