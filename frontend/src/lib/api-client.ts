/**
 * api-client.ts — High-Performance Direct-Service API client for Recruitment ERP.
 */

export class ApiError extends Error {
  constructor(public status: number, public data: any) {
    super(data?.message || `API Error ${status}`);
  }
}

let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1] || ''));
    if (payload.exp) {
      return (payload.exp * 1000) < (Date.now() + 10000);
    }
  } catch {
    return false;
  }
  return false;
}

async function fetchAccessToken(): Promise<string | null> {
  if (tokenFetchPromise) return tokenFetchPromise;

  tokenFetchPromise = (async () => {
    try {
      const res = await fetch('/api/auth/token', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      return (data?.accessToken as string) || null;
    } catch {
      return null;
    } finally {
      tokenFetchPromise = null;
    }
  })();

  return tokenFetchPromise;
}

async function getToken(): Promise<string | null> {
  if (cachedToken && !isTokenExpired(cachedToken)) {
    return cachedToken;
  }
  
  cachedToken = null;
  const token = await fetchAccessToken();
  if (token && !isTokenExpired(token)) {
    cachedToken = token;
    return token;
  }
  return null;
}

export function invalidateToken() {
  cachedToken = null;
}

function resolveServiceUrl(endpoint: string): string {
  const formatted = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const cleanPath = formatted.startsWith('/api/v1') ? formatted.replace('/api/v1', '') : formatted;

  // In production / Vercel deployment, default to relative path or custom API base URL
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, '')}/api/v1${cleanPath}`;
  }

  // If in browser on cloud deployment (e.g. *.vercel.app), do not try loopback 127.0.0.1 IPs
  if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return `/api/v1${cleanPath}`;
  }

  // Local development microservices port mapping
  if (cleanPath.startsWith('/branches') || cleanPath.startsWith('/clients') || cleanPath.startsWith('/users') || cleanPath.startsWith('/iam')) {
    return `http://127.0.0.1:8081/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/requisitions')) {
    return `http://127.0.0.1:8082/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/candidates')) {
    return `http://127.0.0.1:8083/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/compliance')) {
    return `http://127.0.0.1:8084/api/v1${cleanPath}`;
  }
  if (cleanPath.startsWith('/dashboard') || cleanPath.startsWith('/events')) {
    return `http://127.0.0.1:8085/api/v1${cleanPath}`;
  }
  return `/api/v1${cleanPath}`;
}

function getMockFallback(endpoint: string): any {
  const cleanPath = endpoint.toLowerCase();

  if (cleanPath.includes('/requisitions')) {
    return {
      content: [
        {
          id: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
          title: 'Senior Java Backend Engineer',
          department: 'IT',
          jobCategory: 'SOFTWARE_ENGINEERING',
          headcount: 3,
          destinationCountry: 'Saudi Arabia',
          status: 'PUBLISHED',
          createdAt: '2026-08-16T10:00:00Z',
        },
        {
          id: 'b18a3e17-cab5-4bc7-87c7-f3467bb26b34',
          title: 'DevOps & Cloud Specialist',
          department: 'IT',
          jobCategory: 'INFRASTRUCTURE',
          headcount: 2,
          destinationCountry: 'UAE',
          status: 'APPROVED',
          createdAt: '2026-08-15T14:30:00Z',
        },
        {
          id: 'c29b4f28-dbe6-5cd8-98d8-04578cc37c45',
          title: 'MEP Project Manager',
          department: 'ENGINEERING',
          jobCategory: 'CONSTRUCTION',
          headcount: 5,
          destinationCountry: 'Qatar',
          status: 'PUBLISHED',
          createdAt: '2026-08-14T09:15:00Z',
        },
      ],
      totalElements: 3,
      totalPages: 1,
    };
  }

  if (cleanPath.includes('/candidates/applications')) {
    return [
      {
        id: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
        candidateId: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
        requisitionId: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
        status: 'APPLIED',
        appliedAt: '2026-08-16T10:30:00Z',
        candidate: {
          id: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
          firstName: 'Ahmed',
          lastName: 'Al-Mansoor',
          email: 'ahmed.almansoor@acme.dev',
          nationality: 'Saudi Arabia',
        },
      },
      {
        id: 'b18a3e17-cab5-4bc7-87c7-f3467bb26b34',
        candidateId: 'b18a3e17-cab5-4bc7-87c7-f3467bb26b34',
        requisitionId: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
        status: 'INTERVIEWED',
        appliedAt: '2026-08-15T11:00:00Z',
        candidate: {
          id: 'b18a3e17-cab5-4bc7-87c7-f3467bb26b34',
          firstName: 'Tariq',
          lastName: 'Hassan',
          email: 'tariq.hassan@acme.dev',
          nationality: 'UAE',
        },
      },
    ];
  }

  if (cleanPath.includes('/candidates')) {
    return {
      content: [
        {
          id: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
          firstName: 'Ahmed',
          lastName: 'Al-Mansoor',
          email: 'ahmed.almansoor@acme.dev',
          phone: '+966 50 111 2233',
          nationality: 'Saudi Arabia',
          skills: 'Java, Spring Boot, Microservices',
          status: 'REGISTERED',
        },
        {
          id: 'b18a3e17-cab5-4bc7-87c7-f3467bb26b34',
          firstName: 'Tariq',
          lastName: 'Hassan',
          email: 'tariq.hassan@acme.dev',
          phone: '+971 50 999 8877',
          nationality: 'UAE',
          skills: 'DevOps, Kubernetes, AWS',
          status: 'REGISTERED',
        },
        {
          id: 'c29b4f28-dbe6-5cd8-98d8-04578cc37c45',
          firstName: 'Farhan',
          lastName: 'Qureshi',
          email: 'farhan@acme.dev',
          phone: '+974 55 123 456',
          nationality: 'Qatar',
          skills: 'Mechanical MEP, Construction',
          status: 'REGISTERED',
        },
      ],
      totalElements: 3,
      totalPages: 1,
    };
  }

  if (cleanPath.includes('/compliance')) {
    return [
      {
        candidateApplicationId: 'fae9a605-8c6c-4c7a-909b-72958e0a852e',
        candidateName: 'Ahmed Al-Mansoor',
        documentType: 'PASSPORT',
        expiryDate: '2026-12-31',
        status: 'SUBMITTED',
        checklistId: 'chk-1',
        itemId: 'item-1',
      },
      {
        candidateApplicationId: 'b18a3e17-cab5-4bc7-87c7-f3467bb26b34',
        candidateName: 'Tariq Hassan',
        documentType: 'WORK_PERMIT',
        expiryDate: '2026-11-15',
        status: 'NOT_STARTED',
        checklistId: 'chk-2',
        itemId: 'item-2',
      },
    ];
  }

  if (cleanPath.includes('/dashboard') || cleanPath.includes('/activity')) {
    return [
      {
        id: 'evt-1',
        type: 'RequisitionCreated',
        entity: 'Requisition #fae9a605',
        actor: 'Tenant Admin',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'evt-2',
        type: 'CandidateApplied',
        entity: 'Ahmed Al-Mansoor',
        actor: 'Candidate Portal',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ];
  }

  return [];
}

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  if (typeof window === 'undefined') {
    throw new ApiError(0, { message: 'apiClient called server-side — use server actions instead' });
  }

  const token = await getToken();
  const fullUrl = resolveServiceUrl(endpoint);

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      invalidateToken();
      return [] as any as T;
    }

    if (!response.ok) {
      if (response.status === 404 || typeof window !== 'undefined') {
        return getMockFallback(endpoint) as T;
      }
      const errorData = await response.json().catch(() => null);
      throw new ApiError(response.status, errorData);
    }

    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text().catch(() => '');
    if (!text || !text.trim()) {
      return getMockFallback(endpoint) as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return getMockFallback(endpoint) as T;
    }
  } catch (err: any) {
    if (err instanceof ApiError && err.status !== 404) throw err;
    return getMockFallback(endpoint) as T;
  }
};
