export const getApiBaseUrl = () => {
  let base = '';
  if (typeof import.meta !== 'undefined') {
    if (import.meta.env?.VITE_API_BASE_URL) base = import.meta.env.VITE_API_BASE_URL;
    else if (import.meta.env?.VITE_API_URL) base = import.meta.env.VITE_API_URL;
  }
  if (!base && typeof process !== 'undefined') {
    if (process.env?.VITE_API_BASE_URL) base = process.env.VITE_API_BASE_URL;
    else if (process.env?.VITE_API_URL) base = process.env.VITE_API_URL;
  }
  if (!base && typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // In production on remote host without explicit env var, use relative /api
    base = '/api';
  }
  if (!base) {
    base = 'http://localhost:5000/api';
  }
  return base.replace(/\/+$/, '');
};

export function buildApiUrl(path) {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (base.endsWith('/api') && cleanPath.startsWith('/api/')) {
    return `${base}${cleanPath.slice(4)}`;
  }
  return `${base}${cleanPath}`;
}

async function request(path, options = {}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('udyamone_token') : null;
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  
  const url = buildApiUrl(path);
  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (netErr) {
    const error = new Error('Unable to connect to server. Please try again.');
    error.name = 'NetworkError';
    error.status = 0;
    error.originalError = netErr;
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.response = { status: response.status, data };
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
  register: (name, email, mobile, password, confirmPassword) =>
    request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, mobile, password, confirmPassword })
    }),
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



