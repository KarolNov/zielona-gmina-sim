export async function onRequest(context: any) {
  const { request } = context;

  try {
    const url = new URL(request.url);

    // Convert /api/pvgis/seriescalc -> /api/v5_2/seriescalc
    const targetPath = url.pathname.replace(/^\/api\/pvgis/, '/api/v5_2');
    const targetUrl = `https://re.jrc.ec.europa.eu${targetPath}${url.search}`;

    const init: RequestInit = {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'manual',
    };

    const resp = await fetch(targetUrl, init);

    // Copy response headers and ensure CORS isn't blocking browsers.
    const headers = new Headers(resp.headers);
    // It's safe to allow your origin or '*' here; we set '*' to be permissive.
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
