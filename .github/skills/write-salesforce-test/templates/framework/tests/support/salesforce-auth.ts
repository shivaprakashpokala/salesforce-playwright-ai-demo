import crypto from 'node:crypto';
import fs from 'node:fs';
import { Connection } from 'jsforce';

/**
 * Salesforce sign-in without a password or a verification code.
 *
 * 1. Sign a short-lived JWT with our private key (OAuth 2.0 JWT bearer flow).
 * 2. jsforce swaps it for an access token.
 * 3. That token gives us an API connection, and a "front door" URL that opens
 *    the browser already signed in.
 *
 * Needs an External Client App (or Connected App) with the JWT bearer flow enabled,
 * our certificate uploaded, the user pre-authorised, and the `api` and `web` scopes.
 */

export const SESSION_FILE = '.auth/session.json';

export interface SalesforceSession {
  accessToken: string;
  instanceUrl: string;
}

interface JwtSettings {
  loginUrl: string;
  username: string;
  clientId: string;
  privateKey: string;
  audience: string;
}

/** True when the environment has what the JWT flow needs. */
export function jwtConfigured(env = process.env): boolean {
  return Boolean(env.SF_CLIENT_ID && (env.SF_PRIVATE_KEY || env.SF_PRIVATE_KEY_PATH));
}

function readSettings(env = process.env): JwtSettings {
  const missing = ['SF_LOGIN_URL', 'SF_USERNAME', 'SF_CLIENT_ID'].filter((name) => !env[name]);
  if (missing.length) throw new Error(`Missing ${missing.join(', ')} (see .env.example).`);

  // The key comes either inline (handy for CI secrets) or from a file (handy locally).
  let privateKey = env.SF_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!privateKey && env.SF_PRIVATE_KEY_PATH) privateKey = fs.readFileSync(env.SF_PRIVATE_KEY_PATH, 'utf8');
  if (!privateKey) throw new Error('Set SF_PRIVATE_KEY or SF_PRIVATE_KEY_PATH (see .env.example).');

  return {
    loginUrl: env.SF_LOGIN_URL!.replace(/\/+$/, ''),
    username: env.SF_USERNAME!,
    clientId: env.SF_CLIENT_ID!,
    privateKey,
    // Production and developer orgs use login.salesforce.com; sandboxes use test.salesforce.com.
    audience: env.SF_JWT_AUDIENCE ?? 'https://login.salesforce.com',
  };
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString('base64url');

/** Build and sign the JWT that proves who we are. Valid for three minutes. */
export function buildJwtAssertion(settings: Pick<JwtSettings, 'clientId' | 'username' | 'audience' | 'privateKey'>): string {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(
    JSON.stringify({
      iss: settings.clientId,
      sub: settings.username,
      aud: settings.audience,
      exp: Math.floor(Date.now() / 1000) + 180,
    }),
  );
  const signature = crypto.createSign('RSA-SHA256').update(`${header}.${claims}`).sign(settings.privateKey);
  return `${header}.${claims}.${base64url(signature)}`;
}

const proxyOptions = () => (process.env.HTTPS_PROXY ? { httpProxy: process.env.HTTPS_PROXY } : {});

/** Sign in with the JWT bearer flow and return a ready-to-use jsforce connection. */
export async function connectWithJwt(env = process.env): Promise<Connection> {
  const settings = readSettings(env);
  const connection = new Connection({ loginUrl: settings.loginUrl, ...proxyOptions() });
  try {
    await connection.authorize({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: buildJwtAssertion(settings),
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Salesforce rejected the JWT sign-in: ${reason}. Check that the client id is right, the certificate ` +
        'matches the private key, the user is pre-authorised on the app, and SF_JWT_AUDIENCE suits the org.',
    );
  }
  return connection;
}

/** Rebuild a connection from a saved session (used by each test worker). */
export function connectionFrom(session: SalesforceSession): Connection {
  return new Connection({ instanceUrl: session.instanceUrl, accessToken: session.accessToken, ...proxyOptions() });
}

export function saveSession(connection: Connection, file = SESSION_FILE) {
  if (!connection.accessToken) throw new Error('The Salesforce connection has no access token to save.');
  const session: SalesforceSession = { accessToken: connection.accessToken, instanceUrl: connection.instanceUrl };
  fs.mkdirSync('.auth', { recursive: true });
  fs.writeFileSync(file, JSON.stringify(session), { mode: 0o600 });
}

export function loadSession(file = SESSION_FILE): SalesforceSession {
  if (!fs.existsSync(file)) throw new Error(`No saved Salesforce session at ${file}. Did the sign-in setup run?`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

/**
 * A URL that opens the browser already signed in as the API user.
 *
 * Prefers Salesforce's single-access endpoint, which returns a one-time front door
 * link so the access token never appears in a URL. Falls back to the classic
 * frontdoor.jsp?sid= link on orgs where that endpoint is not available.
 */
export async function frontDoorUrl(connection: Connection, startPath = '/lightning/page/home'): Promise<string> {
  try {
    const result = await connection.request<{ frontdoor_uri?: string }>({
      method: 'POST',
      url: `${connection.instanceUrl}/services/oauth2/singleaccess`,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ redirect_uri: startPath }).toString(),
    });
    if (result?.frontdoor_uri) return result.frontdoor_uri;
  } catch {
    // Fall through to the classic front door.
  }
  const url = new URL('/secur/frontdoor.jsp', connection.instanceUrl);
  url.searchParams.set('sid', connection.accessToken!);
  url.searchParams.set('retURL', startPath);
  return url.toString();
}
