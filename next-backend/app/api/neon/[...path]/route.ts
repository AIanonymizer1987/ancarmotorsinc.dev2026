import { NextRequest, NextResponse } from 'next/server';

const NEON_API_URL = process.env.NEON_API_URL || process.env.VITE_NEON_API_URL;
const NEON_ANON_KEY = process.env.NEON_ANON_KEY || process.env.VITE_NEON_ANON_KEY;

function getTargetUrl(pathSegments: string[], request: NextRequest) {
  const path = pathSegments.length ? pathSegments.join('/') : '';
  const query = request.nextUrl.search;
  return `${NEON_API_URL}/${path}${query}`;
}

async function proxy(request: NextRequest, params: { path?: string[] }) {
  if (!NEON_API_URL || !NEON_ANON_KEY) {
    return NextResponse.json(
      { error: 'Missing NEON_API_URL or NEON_ANON_KEY in backend environment' },
      { status: 500 }
    );
  }

  const targetUrl = getTargetUrl(params.path ?? [], request);
  const headers: Record<string, string> = {
    'apikey': NEON_ANON_KEY,
    'Authorization': `Bearer ${NEON_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.text();
  }

  const neonResponse = await fetch(targetUrl, init);
  const responseBody = await neonResponse.text();

  const responseHeaders = new Headers(neonResponse.headers);
  responseHeaders.delete('content-encoding');

  return new NextResponse(responseBody, {
    status: neonResponse.status,
    headers: responseHeaders,
  });
}

export async function GET(request: NextRequest, context: RouteContext<'/api/neon/[...path]'>) {
  return proxy(request, await context.params);
}

export async function POST(request: NextRequest, context: RouteContext<'/api/neon/[...path]'>) {
  return proxy(request, await context.params);
}

export async function PATCH(request: NextRequest, context: RouteContext<'/api/neon/[...path]'>) {
  return proxy(request, await context.params);
}

export async function DELETE(request: NextRequest, context: RouteContext<'/api/neon/[...path]'>) {
  return proxy(request, await context.params);
}

export async function PUT(request: NextRequest, context: RouteContext<'/api/neon/[...path]'>) {
  return proxy(request, await context.params);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Allow': 'GET,POST,PATCH,PUT,DELETE,OPTIONS' } });
}
