const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(path, options={}) {
  const token = localStorage.getItem('udyamone_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const authApi = {
  login: (email,password) => request('/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})}),
  register: (name,email,password) => request('/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})}),
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

