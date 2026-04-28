import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing target URL' }, { status: 400 });
    }

    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const host = parsedUrl.hostname.toLowerCase();
    const isAllowedHost =
      host === 'tripo3d.ai' ||
      host.endsWith('.tripo3d.ai') ||
      host.endsWith('.data.tripo3d.com');

    if (!isHttps || !isAllowedHost) {
      return NextResponse.json({ error: `Blocked target URL host: ${host}` }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString(), {
      headers: {
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch target resource (${response.status})` },
        { status: response.status }
      );
    }

    // Proxy the response body along with headers needed for 3D viewing
    const buffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');

    return new NextResponse(buffer, {
      status: 200,
      headers
    });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy fetch failed' }, { status: 500 });
  }
}
