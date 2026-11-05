import { NextRequest, NextResponse } from 'next/server';

const authRoutes = new Set(['login', 'register', 'verify-email', 'resend-verification', 'refresh', 'logout']);
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';
const rules: [RegExp, string[]][] = [
  [/^auth\/me$/, ['GET']],
  [/^dashboard\/stats$/, ['GET']],
  [/^reports$/, ['GET', 'POST']],
  [new RegExp(`^reports/${uuid}$`, 'i'), ['GET', 'PATCH', 'DELETE']],
  [new RegExp(`^reports/${uuid}/photo$`, 'i'), ['GET']],
  [new RegExp(`^reports/${uuid}/status$`, 'i'), ['PATCH']],
  [/^users$/, ['GET']],
  [new RegExp(`^users/${uuid}$`, 'i'), ['PATCH', 'DELETE']],
];
const accessCookie = 'siklus_access';
const refreshCookie = 'siklus_refresh';

function error(status: number, code: string, message: string) {
  return NextResponse.json({ code, message }, { status });
}

function clearSession(response: NextResponse) {
  for (const name of [accessCookie, refreshCookie]) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}

async function forward(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const path = (await params).path.join('/');
  const method = request.method;
  const action = path.startsWith('auth/') ? path.slice(5) : '';
  const publicAuth = method === 'POST' && authRoutes.has(action);
  if (!publicAuth && !rules.some(([pattern, methods]) => pattern.test(path) && methods.includes(method))) {
    return error(404, 'NOT_FOUND', 'Endpoint tidak ditemukan.');
  }
  if (method !== 'GET') {
    const origin = request.headers.get('origin');
    const expectedOrigin = process.env.WEB_ORIGIN || request.nextUrl.origin;
    if (origin ? origin !== expectedOrigin : request.headers.get('sec-fetch-site') === 'cross-site') {
      return error(403, 'INVALID_ORIGIN', 'Permintaan lintas situs ditolak.');
    }
  }
  const access = request.cookies.get(accessCookie)?.value;
  const refresh = request.cookies.get(refreshCookie)?.value;
  const sessionAction = action === 'refresh' || action === 'logout';
  if (!publicAuth && !access) return error(401, 'MISSING_TOKEN', 'Sesi sudah berakhir.');
  if (sessionAction && !refresh) {
    return clearSession(action === 'logout' ? new NextResponse(null, { status: 204 }) : error(401, 'NO_SESSION', 'Sesi sudah berakhir.'));
  }

  const headers = new Headers();
  if (!publicAuth && access) headers.set('authorization', `Bearer ${access}`);
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('content-type', contentType);
  try {
    let body: ArrayBuffer | string | undefined;
    if (sessionAction) {
      headers.set('content-type', 'application/json');
      body = JSON.stringify({ refreshToken: refresh });
    } else if (request.body && method !== 'GET') {
      if (Number(request.headers.get('content-length')) > 6 * 1024 * 1024) {
        return error(413, 'PHOTO_TOO_LARGE', 'Ukuran foto maksimal 5 MiB.');
      }
      body = await request.arrayBuffer();
      if (body.byteLength > 6 * 1024 * 1024) return error(413, 'PHOTO_TOO_LARGE', 'Ukuran foto maksimal 5 MiB.');
    }
    const upstream = (process.env.BACKEND_URL || 'http://localhost:3001').replace(/\/$/, '');
    const result = await fetch(`${upstream}/api/v1/${path}${request.nextUrl.search}`, {
      method, headers, body, cache: 'no-store', signal: AbortSignal.timeout(25_000),
    });
    if (action === 'logout' && (result.ok || result.status === 401)) {
      return clearSession(new NextResponse(null, { status: 204 }));
    }
    if (action === 'refresh' && result.status === 401) {
      return clearSession(error(401, 'NO_SESSION', 'Sesi sudah berakhir.'));
    }
    if ((action === 'login' || action === 'refresh') && result.ok) {
      const { accessToken, refreshToken, expiresIn, user } = await result.json();
      const response = NextResponse.json({ user }, { headers: { 'cache-control': 'private, no-store' } });
      const secure = new URL(process.env.WEB_ORIGIN || request.url).protocol === 'https:';
      const options = { httpOnly: true, secure, sameSite: 'lax' as const, path: '/' };
      response.cookies.set(accessCookie, accessToken, { ...options, maxAge: expiresIn });
      response.cookies.set(refreshCookie, refreshToken, { ...options, maxAge: 7 * 24 * 60 * 60 });
      return response;
    }
    const responseHeaders = new Headers({ 'cache-control': 'private, no-store' });
    const type = result.headers.get('content-type');
    if (type) responseHeaders.set('content-type', type);
    return new NextResponse(result.body, { status: result.status, headers: responseHeaders });
  } catch {
    return error(503, 'BACKEND_UNAVAILABLE', 'Server belum bisa dihubungi. Coba lagi.');
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
