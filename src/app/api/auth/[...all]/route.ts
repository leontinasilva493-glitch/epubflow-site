import { toNextJsHandler } from 'better-auth/next-js';

const isStaticOnlyMode = process.env.EPUBFLOW_STATIC_ONLY !== 'false';

async function handleAuthRequest(request: Request) {
  // Static homepage launch mode: disable auth endpoint by default
  // to avoid deployment failures from missing backend env/database.
  if (isStaticOnlyMode) {
    return new Response('Not Found', { status: 404 });
  }

  const { auth } = await import('@/lib/auth');
  const handlers = toNextJsHandler(auth);
  return request.method === 'GET'
    ? handlers.GET(request)
    : handlers.POST(request);
}

export async function GET(request: Request) {
  return handleAuthRequest(request);
}

export async function POST(request: Request) {
  return handleAuthRequest(request);
}
