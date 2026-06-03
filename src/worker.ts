export interface Env {
  NODE_ENV?: string;
}

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/health') {
      return json({
        status: 'ok',
        service: 'portfolio-backend',
        runtime: 'cloudflare-worker',
        timestamp: new Date().toISOString(),
      });
    }

    return json(
      {
        error: 'Not found',
        message:
          'This Cloudflare Worker entrypoint is configured. Existing Express routes still need to be ported to Worker-compatible handlers or Hono.',
      },
      { status: 404 }
    );
  },
};
