addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  // Proxy requests starting with /api to backend
  if (url.pathname.startsWith('/api')) {
    const backendUrl = `https://backend-api-rho-puce.vercel.app${url.pathname}`;
    const init = {
      method: request.method,
      headers: request.headers,
      body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
    };
    const response = await fetch(backendUrl, init);
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Access-Control-Allow-Origin', '*'); // allow FE
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  }

  return new Response('Not Found', { status: 404 });
}
