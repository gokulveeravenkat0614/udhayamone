const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const documentRoutes = require('./routes/documentRoutes');
const applicationRoutes = require('./routes/applicationRoutes');

const app = express();
app.use(cors({ origin:true, credentials:true }));
app.use(express.json());
app.get('/api/health', (_,res)=>res.json({success:true,service:'udyamone-backend'}));
app.get('/health', (_,res)=>res.json({success:true,service:'udyamone-backend'}));

// Primary API routes (/api/*)
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/applications', applicationRoutes);

// Direct root fallbacks (supports environments where API base URL omits /api)
app.use('/auth', authRoutes);
app.use('/verification', verificationRoutes);
app.use('/approvals', approvalRoutes);
app.use('/documents', documentRoutes);
app.use('/applications', applicationRoutes);

app.use('/uploads', express.static(path.join(__dirname,'uploads')));
app.use((req,res)=>res.status(404).json({success:false,message:`Route not found: ${req.method} ${req.originalUrl}`}));
module.exports = app;
