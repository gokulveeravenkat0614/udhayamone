const API_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api';

async function request(path, options={}) {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('udyamone_token') : null;
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

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
    if (payload instanceof FormData) {
      return request(`/applications/${encodeURIComponent(id)}/documents`, {
        method: 'POST',
        body: payload
      });
    }
    const { docId, documentId, docName, documentType, name, category, whyRequired, file, fileName, fileSize } = payload || {};
    
    // If an actual File object was provided, construct FormData
    if (file && typeof file !== 'string' && file.name) {
      const form = new FormData();
      form.append('documentId', documentId || docId);
      form.append('docId', documentId || docId);
      if (documentType || docName || name) {
        form.append('documentType', documentType || docName || name);
        form.append('docName', documentType || docName || name);
      }
      if (category) form.append('category', category);
      if (whyRequired) form.append('whyRequired', whyRequired);
      form.append('fileName', file.name);
      const sizeStr = file.size < 1024 * 1024 
        ? `${(file.size / 1024).toFixed(1)} KB` 
        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      form.append('fileSize', sizeStr);
      form.append('document', file);
      return request(`/applications/${encodeURIComponent(id)}/documents`, {
        method: 'POST',
        body: form
      });
    }

    // Otherwise send as JSON payload
    return request(`/applications/${encodeURIComponent(id)}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentId: documentId || docId,
        docId: documentId || docId,
        documentType: documentType || docName || name,
        docName: documentType || docName || name,
        category,
        whyRequired,
        fileName: fileName || (file ? file.name : null),
        fileSize: fileSize || '1.2 MB'
      })
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



