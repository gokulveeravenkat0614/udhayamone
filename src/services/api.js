const DEFAULT_PROD_API_URL = 'https://udhayamone.onrender.com';
const DEFAULT_LOCAL_API_URL = 'http://localhost:5000/api';

export const getApiBaseUrl = () => {
  let base = '';

  // 1. Runtime override via window or localStorage (useful for debugging/custom host)
  if (typeof window !== 'undefined') {
    if (window.UDYAMONE_API_URL) {
      base = window.UDYAMONE_API_URL;
    } else {
      try {
        const stored = localStorage.getItem('udyamone_api_url');
        if (stored) base = stored;
      } catch {}
    }
  }

  // 2. Vite / process environment variable
  if (!base && typeof import.meta !== 'undefined' && import.meta.env) {
    base = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';
  }
  if (!base && typeof process !== 'undefined' && process.env) {
    base = process.env.VITE_API_URL || process.env.VITE_API_BASE_URL || '';
  }

  // 3. Normalize typo variations and eliminate any reference to the frontend static host
  if (base) {
    // If someone accidentally configured the frontend host as the API URL, redirect to backend
    base = base.replace(/ud[hy]+ayamone-1\.onrender\.com/gi, 'udhayamone.onrender.com');
    // If phonetic typo with double 'ya' is present
    base = base.replace(/udhyayamone\.onrender\.com/gi, 'udhayamone.onrender.com');
  }

  // 4. Default resolution based on environment
  if (!base) {
    const isLocalhost = typeof window !== 'undefined' && window.location && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]'
    );
    base = isLocalhost ? DEFAULT_LOCAL_API_URL : DEFAULT_PROD_API_URL;
  }

  return base.replace(/\/+$/, '');
};

export function buildApiUrl(path) {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // If base already contains /api (e.g. http://localhost:5000/api or https://.../api)
  if (base.endsWith('/api')) {
    if (cleanPath.startsWith('/api/')) {
      return `${base}${cleanPath.slice(4)}`;
    }
    return `${base}${cleanPath}`;
  }

  // If base does NOT end with /api, ensure path includes /api
  if (!cleanPath.startsWith('/api/')) {
    return `${base}/api${cleanPath}`;
  }

  return `${base}${cleanPath}`;
}

async function request(path, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('udyamone_token') : null;
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const url = buildApiUrl(path);
  const method = (options.method || 'GET').toUpperCase();

  let response;
  try {
    response = await fetch(url, { ...options, method, headers });
  } catch (netErr) {
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.error(`[API Network Error] ${method} ${url}:`, netErr);
    }
    const error = new Error('Unable to connect to application service. Please check your network connection.');
    error.name = 'NetworkError';
    error.status = 0;
    error.originalError = netErr;
    throw error;
  }

  // Verify response type: if static server or CDN returned an HTML error page or index.html rewrite,
  // that indicates the API service endpoint is unreachable or misconfigured.
  const contentType = (response.headers && response.headers.get('content-type')) || '';
  const isJson = contentType.includes('application/json');

  let data = null;
  if (isJson) {
    try {
      data = await response.json();
    } catch {
      data = {};
    }
  } else {
    // Non-JSON response (HTML error page, 502 Bad Gateway from reverse proxy, 404 HTML, etc.)
    const text = await response.text().catch(() => '');
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
      console.warn(`[API Non-JSON Response] ${method} ${url} -> Status ${response.status}:`, text.slice(0, 300));
    }

    let message = 'Unable to connect to application service.';
    if (response.status === 404) {
      message = `API endpoint not found (404). Please verify backend configuration.`;
    } else if (response.status === 502 || response.status === 503 || response.status === 504) {
      message = 'Backend application service is currently starting up. Please retry in a few seconds.';
    } else if (response.status >= 500) {
      message = `Backend server error (${response.status}). Please try again later.`;
    }

    const error = new Error(message);
    error.name = 'HttpError';
    error.status = response.status;
    error.response = { status: response.status, data: null, text };
    throw error;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log(`[API Response] ${method} ${url} -> ${response.status}`, data);
  }

  if (!response.ok) {
    let message = data?.message;
    if (!message) {
      if (response.status === 400) message = 'Bad request. Please check submitted data.';
      else if (response.status === 401) message = 'Authentication required. Please log in.';
      else if (response.status === 403) message = 'Access denied. You do not have permission.';
      else if (response.status === 404) message = 'Resource not found.';
      else if (response.status === 409) message = 'An account with this email or mobile already exists.';
      else if (response.status >= 500) message = 'Internal server error. Please try again later.';
      else message = `Request failed with status ${response.status}`;
    }

    const error = new Error(message);
    error.status = response.status;
    error.response = { status: response.status, data };
    // Only genuine 404 from backend specifically stating Application not found
    error.isApplicationNotFound = response.status === 404 && data?.message === 'Application not found';
    throw error;
  }

  return data;
}

export const api = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { 
    ...options, 
    method: 'POST', 
    headers: body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: body instanceof FormData ? body : JSON.stringify(body) 
  }),
  put: (path, body, options = {}) => request(path, { 
    ...options, 
    method: 'PUT', 
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: JSON.stringify(body) 
  }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};

export function getStoredToken() {
  return typeof localStorage !== 'undefined' ? localStorage.getItem('udyamone_token') : null;
}

export function getStoredUser() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem('udyamone_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  if (typeof localStorage !== 'undefined') {
    if (token) localStorage.setItem('udyamone_token', token);
    if (user) localStorage.setItem('udyamone_user', JSON.stringify(user));
  }
}

export function clearAuthSession() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('udyamone_token');
    localStorage.removeItem('udyamone_user');
  }
}

export const authApi = {
  login: (emailOrMobile, password) =>
    request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailOrMobile, password })
    }),
  register: (name, email, mobile, password, confirmPassword) => {
    if (typeof name === 'object' && name !== null) {
      const payload = name;
      return request('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: payload.name,
          email: payload.email,
          mobile: payload.mobile,
          password: payload.password,
          confirmPassword: payload.confirmPassword || payload.password
        })
      });
    }
    return request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile, password, confirmPassword: confirmPassword || password })
    });
  },
  me: () => request('/auth/me')
};

export async function submitVerification({document1,document2,selfie}) {
  const form = new FormData();
  form.append('document1',document1,'document-1.jpg');
  if (document2) form.append('document2',document2,'document-2.jpg');
  form.append('selfie',selfie,'selfie.jpg');
  return request('/verification/submit',{method:'POST',body:form});
}

export const verificationApi = {
  status: () => request('/verification/status'),
  history: () => request('/verification/history')
};

export const adminApi = {
  stats: () => request('/admin/statistics'),
  verifications: () => request('/admin/verifications'),
  users: () => request('/admin/users')
};

export const approvalApi = {
  evaluate: (profile, userApplications = []) =>
    request('/approvals/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, userApplications })
    }),
  getCatalog: (state, district) =>
    request(`/approvals/catalog?state=${encodeURIComponent(state || 'Maharashtra')}&district=${encodeURIComponent(district || 'Pune')}`),
  getDependencies: (state, district, industry) =>
    request(`/approvals/dependencies?state=${encodeURIComponent(state || 'Maharashtra')}&district=${encodeURIComponent(district || 'Pune')}&industry=${encodeURIComponent(industry || 'Manufacturing')}`)
};

export const documentApi = {
  validate: ({ documentId, documentType, applicationId, userId }) =>
    request('/documents/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentId, documentType, applicationId, userId })
    }),
  getRecords: () => request('/documents/records'),
  addRecord: (record) =>
    request('/documents/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    }),
  deleteRecord: (id) =>
    request(`/documents/records/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    })
};

export const applicationApi = {
  create: (data) =>
    request('/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }),
  getMyApplications: (status) =>
    request(`/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  getById: (id) =>
    request(`/applications/${encodeURIComponent(id)}`),
  update: (id, data) =>
    request(`/applications/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }),
  getDocuments: (id) =>
    request(`/applications/${encodeURIComponent(id)}/documents`),
  uploadDocument: (id, payload) => {
    const applicationId = encodeURIComponent(id);

    if (payload instanceof FormData) {
      return request(`/applications/${applicationId}/documents`, {
        method: 'POST',
        body: payload,
      });
    }

    const {
      docId,
      documentId,
      docName,
      documentType,
      name,
      category,
      whyRequired,
      file,
    } = payload || {};

    if (typeof File !== 'undefined' && file instanceof File) {
      const form = new FormData();

      const resolvedDocumentId = documentId || docId;
      const resolvedDocumentType = documentType || docName || name;

      if (resolvedDocumentId) {
        form.append('documentId', resolvedDocumentId);
        form.append('docId', resolvedDocumentId);
      }

      if (resolvedDocumentType) {
        form.append('documentType', resolvedDocumentType);
        form.append('docName', resolvedDocumentType);
      }

      if (category) {
        form.append('category', category);
      }

      if (whyRequired) {
        form.append('whyRequired', whyRequired);
      }

      form.append('fileName', file.name);
      form.append('fileSize', String(file.size));
      form.append('document', file);

      return request(`/applications/${applicationId}/documents`, {
        method: 'POST',
        body: form,
      });
    }

    const body = {
      documentId: documentId || docId || null,
      docId: docId || documentId || null,
      documentType: documentType || docName || name || null,
      docName: docName || documentType || name || null,
      category: category || null,
      whyRequired: whyRequired || null,
      fileName: payload?.fileName || null,
      fileSize: payload?.fileSize || null,
    };

    return request(`/applications/${applicationId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },
  deleteDocument: (id, docId) =>
    request(`/applications/${encodeURIComponent(id)}/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE'
    }),
  submit: (id) =>
    request(`/applications/${encodeURIComponent(id)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
};

export const assistantApi = {
  chat: ({ message, sessionId, history, websiteContext }) =>
    request('/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, history, websiteContext })
    }),
  history: (sessionId) => request(`/assistant/history?sessionId=${encodeURIComponent(sessionId)}`)
};
