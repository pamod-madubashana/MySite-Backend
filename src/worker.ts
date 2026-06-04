type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type MongoDocument = Record<string, unknown>;

type Env = {
  NODE_ENV?: string;
  CORS_ORIGINS?: string;
  FRONTEND_URL?: string;
  FRONTEND_URL_PROD?: string;
  ADMIN_TOKEN?: string;
  JWT_SECRET?: string;
  MONGODB_DATA_API_URL?: string;
  MONGODB_DATA_API_KEY?: string;
  MONGODB_DATA_SOURCE?: string;
  MONGODB_DATABASE?: string;
};

type RouteParams = Record<string, string>;

type Handler = (ctx: {
  request: Request;
  env: Env;
  url: URL;
  params: RouteParams;
  mongo: MongoDataApi;
}) => Promise<Response>;

const DEFAULT_DATA_SOURCE = 'Cluster0';
const DEFAULT_DATABASE = 'portfolio';

const COLLECTIONS = {
  projects: 'projects',
  articles: 'articles',
  settings: 'settings',
  timeline: 'timelines',
  techSkills: 'techskills',
  interests: 'interests',
  techStackCategories: 'techstackcategories',
  adminMessages: 'adminmessages',
} as const;

const json = (data: unknown, init: ResponseInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
};

const notFound = () => json({ error: 'Not found' }, { status: 404 });

const errorResponse = (message: string, status = 500) => json({ error: message }, { status });

const parseJsonBody = async <T = MongoDocument>(request: Request): Promise<T> => {
  const contentType = request.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    return {} as T;
  }

  return (await request.json()) as T;
};

const normalizeMongoId = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeMongoId);
  }

  if (value && typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;

    if (typeof objectValue.$oid === 'string') {
      return objectValue.$oid;
    }

    if (typeof objectValue.$date === 'string') {
      return objectValue.$date;
    }

    return Object.fromEntries(
      Object.entries(objectValue).map(([key, nestedValue]) => [key, normalizeMongoId(nestedValue)])
    );
  }

  return value;
};

const normalizeDocument = (document: unknown): unknown => normalizeMongoId(document);

const toObjectId = (id: string) => ({ $oid: id });

const isObjectId = (value: string) => /^[a-f\d]{24}$/i.test(value);

const getAllowedOrigins = (env: Env): string[] => {
  const configuredOrigins = env.CORS_ORIGINS
    ? env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  return Array.from(
    new Set([
      ...configuredOrigins,
      env.FRONTEND_URL,
      env.FRONTEND_URL_PROD,
      'http://localhost:3000',
      'http://localhost:4000',
      'http://localhost:8080',
      'https://pamod.is-a.dev',
      'https://pamod.dev',
    ].filter(Boolean) as string[])
  );
};

const withCors = (response: Response, request: Request, env: Env): Response => {
  const origin = request.headers.get('origin');
  const headers = new Headers(response.headers);
  const allowedOrigins = getAllowedOrigins(env);

  if (origin && allowedOrigins.includes(origin)) {
    headers.set('access-control-allow-origin', origin);
    headers.set('vary', 'Origin');
  } else if (!origin) {
    headers.set('access-control-allow-origin', '*');
  }

  headers.set('access-control-allow-methods', 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS');
  headers.set('access-control-allow-headers', 'Content-Type, Authorization');
  headers.set('access-control-allow-credentials', 'true');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const createOptionsResponse = (request: Request, env: Env): Response =>
  withCors(new Response(null, { status: 204 }), request, env);

const createSearchFilter = (search: string | null, fields: string[]) => {
  if (!search?.trim()) return undefined;

  return {
    $or: fields.map((field) => ({ [field]: { $regex: search.trim(), $options: 'i' } })),
  };
};

const createPagination = (url: URL) => {
  const page = Math.max(Number(url.searchParams.get('page') || 1), 1);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') || 10), 1), 100);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const b64UrlToUint8 = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const constantTimeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }

  return diff === 0;
};

const verifyHs256Jwt = async (token: string, secret: string): Promise<boolean> => {
  const [headerPart, payloadPart, signaturePart] = token.split('.');
  if (!headerPart || !payloadPart || !signaturePart) return false;

  const header = JSON.parse(new TextDecoder().decode(b64UrlToUint8(headerPart))) as { alg?: string };
  if (header.alg !== 'HS256') return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const expectedSignature = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${headerPart}.${payloadPart}`))
  );
  const actualSignature = b64UrlToUint8(signaturePart);

  const payload = JSON.parse(new TextDecoder().decode(b64UrlToUint8(payloadPart))) as { exp?: number };
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return false;

  return constantTimeEqual(expectedSignature, actualSignature);
};

const isAdminRequest = async (request: Request, env: Env): Promise<boolean> => {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

  if (!token) return false;

  if (env.ADMIN_TOKEN && token === env.ADMIN_TOKEN) return true;
  if (env.JWT_SECRET) return verifyHs256Jwt(token, env.JWT_SECRET).catch(() => false);

  return false;
};

const requireAdmin = async (request: Request, env: Env): Promise<Response | undefined> => {
  const authorized = await isAdminRequest(request, env);
  return authorized ? undefined : errorResponse('Unauthorized', 401);
};

class MongoDataApi {
  private readonly env: Env;

  constructor(env: Env) {
    this.env = env;
  }

  private getConfig() {
    const endpoint = this.env.MONGODB_DATA_API_URL?.replace(/\/$/, '');
    const apiKey = this.env.MONGODB_DATA_API_KEY;

    if (!endpoint || !apiKey) {
      throw new Error('Missing MONGODB_DATA_API_URL or MONGODB_DATA_API_KEY');
    }

    return {
      endpoint,
      apiKey,
      dataSource: this.env.MONGODB_DATA_SOURCE || DEFAULT_DATA_SOURCE,
      database: this.env.MONGODB_DATABASE || DEFAULT_DATABASE,
    };
  }

  private async action<T>(action: string, payload: MongoDocument): Promise<T> {
    const config = this.getConfig();
    const response = await fetch(`${config.endpoint}/action/${action}`, {
      method: 'POST',
      headers: {
        'api-key': config.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        dataSource: config.dataSource,
        database: config.database,
        ...payload,
      }),
    });

    const responseBody = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        typeof responseBody === 'object' && responseBody && 'error' in responseBody
          ? String((responseBody as { error: unknown }).error)
          : `MongoDB Data API error: ${response.status}`
      );
    }

    return responseBody as T;
  }

  async find(collection: string, filter: MongoDocument = {}, options: MongoDocument = {}) {
    const result = await this.action<{ documents: MongoDocument[] }>('find', {
      collection,
      filter,
      ...options,
    });

    return result.documents.map(normalizeDocument);
  }

  async findOne(collection: string, filter: MongoDocument = {}) {
    const result = await this.action<{ document: MongoDocument | null }>('findOne', {
      collection,
      filter,
    });

    return result.document ? normalizeDocument(result.document) : null;
  }

  async count(collection: string, filter: MongoDocument = {}) {
    const result = await this.action<{ documents: { total: number }[] }>('aggregate', {
      collection,
      pipeline: [{ $match: filter }, { $count: 'total' }],
    });

    return result.documents[0]?.total || 0;
  }

  async insertOne(collection: string, document: MongoDocument) {
    const now = { $date: new Date().toISOString() };
    return this.action<{ insertedId: string }>('insertOne', {
      collection,
      document: {
        ...document,
        createdAt: document.createdAt || now,
        updatedAt: document.updatedAt || now,
      },
    });
  }

  async updateOne(collection: string, filter: MongoDocument, update: MongoDocument) {
    return this.action<{ matchedCount: number; modifiedCount: number }>('updateOne', {
      collection,
      filter,
      update: {
        $set: {
          ...update,
          updatedAt: { $date: new Date().toISOString() },
        },
      },
    });
  }

  async deleteOne(collection: string, filter: MongoDocument) {
    return this.action<{ deletedCount: number }>('deleteOne', {
      collection,
      filter,
    });
  }
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const listProjects: Handler = async ({ url, mongo }) => {
  const { page, limit, skip } = createPagination(url);
  const filter: MongoDocument = { status: 'published' };
  const searchFilter = createSearchFilter(url.searchParams.get('search'), ['title', 'description', 'techStack', 'tags', 'languages']);

  if (searchFilter) Object.assign(filter, searchFilter);
  if (url.searchParams.get('featured') === 'true') filter.featured = true;

  const [projects, total] = await Promise.all([
    mongo.find(COLLECTIONS.projects, filter, {
      sort: { featured: -1, createdAt: -1 },
      limit,
      skip,
    }),
    mongo.count(COLLECTIONS.projects, filter),
  ]);

  return json({ projects, totalPages: Math.ceil(total / limit), currentPage: page, total });
};

const listAllProjects: Handler = async ({ request, env, url, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  const { page, limit, skip } = createPagination(url);
  const filter: MongoDocument = {};
  const searchFilter = createSearchFilter(url.searchParams.get('search'), ['title', 'description', 'techStack', 'tags', 'languages']);

  if (searchFilter) Object.assign(filter, searchFilter);
  if (url.searchParams.get('status')) filter.status = url.searchParams.get('status');
  if (url.searchParams.has('featured')) filter.featured = url.searchParams.get('featured') === 'true';

  const [projects, total] = await Promise.all([
    mongo.find(COLLECTIONS.projects, filter, {
      sort: { featured: -1, createdAt: -1 },
      limit,
      skip,
    }),
    mongo.count(COLLECTIONS.projects, filter),
  ]);

  return json({ projects, totalPages: Math.ceil(total / limit), currentPage: page, total });
};

const getProjectBySlug: Handler = async ({ params, mongo }) => {
  const project = await mongo.findOne(COLLECTIONS.projects, { slug: params.slug, status: 'published' });
  return project ? json(project) : errorResponse('Project not found', 404);
};

const getProjectById: Handler = async ({ params, mongo }) => {
  if (!isObjectId(params.id)) return errorResponse('Project not found', 404);

  const project = await mongo.findOne(COLLECTIONS.projects, { _id: toObjectId(params.id) });
  return project ? json(project) : errorResponse('Project not found', 404);
};

const createProject: Handler = async ({ request, env, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  const body = await parseJsonBody(request);
  const title = String(body.title || '').trim();

  if (!title || !body.description) {
    return errorResponse('Title and description are required', 400);
  }

  const document = {
    ...body,
    title,
    slug: body.slug || slugify(title),
    status: body.status || 'draft',
    featured: Boolean(body.featured),
  };

  const result = await mongo.insertOne(COLLECTIONS.projects, document);
  return json({ ...document, _id: result.insertedId }, { status: 201 });
};

const updateProject: Handler = async ({ request, env, params, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (!isObjectId(params.id)) return errorResponse('Project not found', 404);

  const body = await parseJsonBody(request);
  const result = await mongo.updateOne(COLLECTIONS.projects, { _id: toObjectId(params.id) }, body);

  return result.matchedCount ? json({ success: true, modifiedCount: result.modifiedCount }) : errorResponse('Project not found', 404);
};

const deleteProject: Handler = async ({ request, env, params, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (!isObjectId(params.id)) return errorResponse('Project not found', 404);

  const result = await mongo.deleteOne(COLLECTIONS.projects, { _id: toObjectId(params.id) });
  return result.deletedCount ? json({ success: true }) : errorResponse('Project not found', 404);
};

const listCollection = (collection: string, defaultFilter: MongoDocument = {}): Handler => async ({ url, mongo }) => {
  const { page, limit, skip } = createPagination(url);
  const filter = { ...defaultFilter };

  const [items, total] = await Promise.all([
    mongo.find(collection, filter, { sort: { order: 1, createdAt: -1 }, limit, skip }),
    mongo.count(collection, filter),
  ]);

  return json({ items, totalPages: Math.ceil(total / limit), currentPage: page, total });
};

const createGenericItem = (collection: string): Handler => async ({ request, env, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  const body = await parseJsonBody(request);
  const result = await mongo.insertOne(collection, body);
  return json({ ...body, _id: result.insertedId }, { status: 201 });
};

const updateGenericItem = (collection: string): Handler => async ({ request, env, params, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (!isObjectId(params.id)) return errorResponse('Item not found', 404);

  const body = await parseJsonBody(request);
  const result = await mongo.updateOne(collection, { _id: toObjectId(params.id) }, body);
  return result.matchedCount ? json({ success: true, modifiedCount: result.modifiedCount }) : errorResponse('Item not found', 404);
};

const deleteGenericItem = (collection: string): Handler => async ({ request, env, params, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;
  if (!isObjectId(params.id)) return errorResponse('Item not found', 404);

  const result = await mongo.deleteOne(collection, { _id: toObjectId(params.id) });
  return result.deletedCount ? json({ success: true }) : errorResponse('Item not found', 404);
};

const contact: Handler = async ({ request, mongo }) => {
  const body = await parseJsonBody(request);

  if (!body.name || !body.email || !body.message) {
    return errorResponse('Name, email, and message are required', 400);
  }

  const result = await mongo.insertOne(COLLECTIONS.adminMessages, {
    ...body,
    read: false,
    source: 'cloudflare-worker',
  });

  return json({ success: true, id: result.insertedId }, { status: 201 });
};

const getDashboard: Handler = async ({ request, env, mongo }) => {
  const unauthorized = await requireAdmin(request, env);
  if (unauthorized) return unauthorized;

  const [projects, articles, messages] = await Promise.all([
    mongo.count(COLLECTIONS.projects, {}),
    mongo.count(COLLECTIONS.articles, {}),
    mongo.count(COLLECTIONS.adminMessages, { read: false }),
  ]);

  return json({ projects, articles, unreadMessages: messages });
};

const routes: { method: string; pattern: RegExp; keys: string[]; handler: Handler }[] = [];

const addRoute = (method: string, path: string, handler: Handler) => {
  const keys: string[] = [];
  const pattern = new RegExp(
    `^${path
      .replace(/\//g, '\\/')
      .replace(/:([A-Za-z0-9_]+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      })}\/?$`
  );

  routes.push({ method, pattern, keys, handler });
};

addRoute('GET', '/', async () =>
  json({ status: 'ok', service: 'portfolio-backend', runtime: 'cloudflare-worker', message: 'Backend is running 🚀' })
);
addRoute('GET', '/health', async () =>
  json({ status: 'OK', runtime: 'cloudflare-worker', timestamp: new Date().toISOString() })
);

addRoute('GET', '/projects', listProjects);
addRoute('GET', '/projects/all', listAllProjects);
addRoute('GET', '/projects/slug/:slug', getProjectBySlug);
addRoute('GET', '/projects/:id', getProjectById);
addRoute('POST', '/projects', createProject);
addRoute('PUT', '/projects/:id', updateProject);
addRoute('DELETE', '/projects/:id', deleteProject);

addRoute('GET', '/articles', listCollection(COLLECTIONS.articles, { status: 'published' }));
addRoute('POST', '/articles', createGenericItem(COLLECTIONS.articles));
addRoute('PUT', '/articles/:id', updateGenericItem(COLLECTIONS.articles));
addRoute('DELETE', '/articles/:id', deleteGenericItem(COLLECTIONS.articles));

addRoute('GET', '/settings', listCollection(COLLECTIONS.settings));
addRoute('POST', '/settings', createGenericItem(COLLECTIONS.settings));
addRoute('PUT', '/settings/:id', updateGenericItem(COLLECTIONS.settings));
addRoute('DELETE', '/settings/:id', deleteGenericItem(COLLECTIONS.settings));

addRoute('GET', '/timeline', listCollection(COLLECTIONS.timeline));
addRoute('GET', '/tech-skills', listCollection(COLLECTIONS.techSkills));
addRoute('GET', '/interests', listCollection(COLLECTIONS.interests));
addRoute('GET', '/tech-stack-categories', listCollection(COLLECTIONS.techStackCategories));

addRoute('POST', '/contact', contact);
addRoute('POST', '/api/contact', contact);
addRoute('GET', '/dashboard', getDashboard);
addRoute('GET', '/dashboard/enhanced', getDashboard);

const dispatch = async (request: Request, env: Env): Promise<Response> => {
  const url = new URL(request.url);
  const method = request.method.toUpperCase();
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const mongo = new MongoDataApi(env);

  for (const route of routes) {
    if (route.method !== method) continue;

    const match = route.pattern.exec(pathname);
    if (!match) continue;

    const params = Object.fromEntries(route.keys.map((key, index) => [key, decodeURIComponent(match[index + 1])])) as RouteParams;
    return route.handler({ request, env, url, params, mongo });
  }

  return notFound();
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method.toUpperCase() === 'OPTIONS') {
      return createOptionsResponse(request, env);
    }

    try {
      const response = await dispatch(request, env);
      return withCors(response, request, env);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const response = errorResponse(message, message.includes('MONGODB_DATA') ? 500 : 500);
      return withCors(response, request, env);
    }
  },
};
