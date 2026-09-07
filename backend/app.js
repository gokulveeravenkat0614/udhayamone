const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const documentRoutes = require('./routes/documentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const assistantRoutes = require('./routes/assistantRoutes');
const industryAreaRoutes = require('./routes/industryAreaRoutes');

const app = express();

// Robust CORS allowing production Render frontend origins and local development
const allowedOrigins = [
  'https://udhayamone-1.onrender.com',
  'https://udhyayamone-1.onrender.com',
  'https://udhayamone.onrender.com',
  'https://udhyayamone.onrender.com',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.onrender.com')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  try { fs.mkdirSync(uploadsDir, { recursive: true }); } catch {}
}

app.use(express.json());
app.get('/api/health', (_, res) => res.json({ success: true, service: 'udyamone-backend', aiConfigured: Boolean(process.env.OPENAI_API_KEY), providerReachable: Boolean(process.env.OPENAI_API_KEY) }));
app.get('/health', (_, res) => res.json({ success: true, service: 'udyamone-backend', aiConfigured: Boolean(process.env.OPENAI_API_KEY), providerReachable: Boolean(process.env.OPENAI_API_KEY) }));

// Primary API routes (/api/*)
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/ai', assistantRoutes);
app.use('/api/industry-areas', industryAreaRoutes);

// Direct root fallbacks (supports environments where API base URL omits /api)
app.use('/auth', authRoutes);
app.use('/verification', verificationRoutes);
app.use('/admin', adminRoutes);
app.use('/approvals', approvalRoutes);
app.use('/documents', documentRoutes);
app.use('/applications', applicationRoutes);
app.use('/assistant', assistantRoutes);
app.use('/ai', assistantRoutes);

// For /industry-areas root fallback: let browser HTML navigation fall through to static SPA server
app.use('/industry-areas', (req, res, next) => {
  if (req.method === 'GET' && req.accepts('html') && !req.query.state && !req.xhr && !req.headers['x-requested-with']) {
    return next();
  }
  return industryAreaRoutes(req, res, next);
});

app.use('/uploads', express.static(uploadsDir));

// Serve static frontend assets and SPA fallback when dist exists
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (
      req.method === 'GET' &&
      !req.path.startsWith('/api/') &&
      !req.path.startsWith('/auth') &&
      !req.path.startsWith('/verification') &&
      !req.path.startsWith('/admin') &&
      !req.path.startsWith('/approvals') &&
      !req.path.startsWith('/documents') &&
      !req.path.startsWith('/applications') &&
      !req.path.startsWith('/assistant') &&
      !req.path.startsWith('/ai') &&
      !req.path.startsWith('/uploads')
    ) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

app.use((req,res)=>res.status(404).json({success:false,message:`Route not found: ${req.method} ${req.originalUrl}`}));
module.exports = app;
