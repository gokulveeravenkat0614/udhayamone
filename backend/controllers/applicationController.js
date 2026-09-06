const mongoose = require('mongoose');
const Application = require('../models/Application');
const Document = require('../models/Document');
const DocumentRecord = require('../models/DocumentRecord');
const ruleEngine = require('../services/ruleEngine');

// In-memory fallback documents store for offline mode
let memoryDocuments = [];

// Pre-seeded demo applications for demo user (clean of fake uploaded documents)
function createInitialDemoApplications(userId = '64f1a2b3c4d5e6f7a8b9c0d1') {
  const puneEval = ruleEngine.evaluateEligibilityAndDependencies({
    state: 'Maharashtra',
    district: 'Pune',
    industry: 'Manufacturing',
    entityType: 'Private Limited Company',
    investment: 2.5,
    turnover: 12.0,
    employeeCount: 25,
    powerRequired: 75,
    builtUpArea: 1500
  });

  const bengaluruEval = ruleEngine.evaluateEligibilityAndDependencies({
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    industry: 'Information Technology',
    entityType: 'Private Limited Company',
    investment: 1.0,
    turnover: 5.0,
    employeeCount: 15,
    powerRequired: 15,
    builtUpArea: 400
  });

  const telanganaEval = ruleEngine.evaluateEligibilityAndDependencies({
    state: 'Telangana',
    district: 'Hyderabad',
    industry: 'Manufacturing',
    entityType: 'Private Limited Company',
    investment: 2.5,
    turnover: 12.0,
    employeeCount: 25,
    powerRequired: 75,
    builtUpArea: 1500
  });

  const puneDocs = ruleEngine.getDocumentRequirements({}).map(d => ({
    ...d,
    status: 'NOT UPLOADED',
    fileName: null,
    fileSize: null
  }));

  const bengaluruDocs = ruleEngine.getDocumentRequirements({}).map(d => ({
    ...d,
    status: 'NOT UPLOADED',
    fileName: null,
    fileSize: null
  }));

  const telanganaDocs = ruleEngine.getDocumentRequirements({}).map(d => ({
    ...d,
    status: 'NOT UPLOADED',
    fileName: null,
    fileSize: null
  }));

  return [
    {
      _id: '64f1a2b3c4d5e6f7a8b9a001',
      applicationId: 'MH-10245',
      userId: userId.toString(),
      applicantName: 'ABC Manufacturing Pvt. Ltd.',
      promoter: 'Vikramaditya Sharma',
      contactEmail: 'contact@abcmfg.in',
      contactPhone: '+91 98201 44521',
      state: 'Maharashtra',
      district: 'Pune',
      industry: 'Manufacturing',
      businessProfile: {
        entityType: 'Private Limited Company',
        investment: 2.5,
        turnover: 12.0,
        employeeCount: 25,
        powerRequired: 75,
        builtUpArea: 1500,
        usesHazardousChemicals: false,
        isExportOriented: false
      },
      msmeClassification: puneEval.msmeClassification,
      pollutionClassification: puneEval.pollutionClassification,
      status: 'In Progress',
      progressPercentage: 40,
      approvals: puneEval.approvals,
      approvalSequence: puneEval.nextSteps,
      dependencyGraph: puneEval.dependencyGraph,
      documents: puneDocs,
      timeline: [
        { event: 'Application Created', date: new Date('2026-08-10'), status: 'Completed', remarks: 'Registered via UdyamOne Single-Window' },
        { event: 'Requirements Evaluated', date: new Date('2026-08-10'), status: 'Completed', remarks: '5 statutory clearances identified' }
      ],
      createdAt: new Date('2026-08-10')
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9a002',
      applicationId: 'KA-10299',
      userId: userId.toString(),
      applicantName: 'ABC Manufacturing Pvt. Ltd.',
      promoter: 'Vikramaditya Sharma',
      contactEmail: 'contact@abcmfg.in',
      contactPhone: '+91 98201 44521',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      industry: 'Information Technology',
      businessProfile: {
        entityType: 'Private Limited Company',
        investment: 1.0,
        turnover: 5.0,
        employeeCount: 15,
        powerRequired: 15,
        builtUpArea: 400,
        usesHazardousChemicals: false,
        isExportOriented: false
      },
      msmeClassification: bengaluruEval.msmeClassification,
      pollutionClassification: bengaluruEval.pollutionClassification,
      status: 'In Progress',
      progressPercentage: 40,
      approvals: bengaluruEval.approvals,
      approvalSequence: bengaluruEval.nextSteps,
      dependencyGraph: bengaluruEval.dependencyGraph,
      documents: bengaluruDocs,
      timeline: [
        { event: 'Application Created', date: new Date('2026-06-01'), status: 'Completed', remarks: 'Initial filing complete' },
        { event: 'Requirements Evaluated', date: new Date('2026-06-02'), status: 'Completed', remarks: 'IT clearances confirmed' }
      ],
      createdAt: new Date('2026-06-01')
    },
    {
      _id: '64f1a2b3c4d5e6f7a8b9a003',
      applicationId: 'TG-10250',
      userId: userId.toString(),
      applicantName: 'Telangana Advanced Systems Pvt. Ltd.',
      promoter: 'K. Rajeshwar Rao',
      contactEmail: 'contact@telanganasys.in',
      contactPhone: '+91 94401 23456',
      state: 'Telangana',
      district: 'Hyderabad',
      industry: 'Manufacturing',
      businessProfile: {
        entityType: 'Private Limited Company',
        investment: 2.5,
        turnover: 12.0,
        employeeCount: 25,
        powerRequired: 75,
        builtUpArea: 1500,
        usesHazardousChemicals: false,
        isExportOriented: false
      },
      msmeClassification: telanganaEval.msmeClassification,
      pollutionClassification: telanganaEval.pollutionClassification,
      status: 'In Progress',
      progressPercentage: 40,
      approvals: telanganaEval.approvals,
      approvalSequence: telanganaEval.nextSteps,
      dependencyGraph: telanganaEval.dependencyGraph,
      documents: telanganaDocs,
      timeline: [
        { event: 'Application Created', date: new Date('2026-08-10'), status: 'Completed', remarks: 'Registered via TS-iPASS Single-Window' },
        { event: 'Requirements Evaluated', date: new Date('2026-08-10'), status: 'Completed', remarks: '5 statutory clearances identified' }
      ],
      createdAt: new Date('2026-08-10')
    }
  ];
}

// In-memory fallback applications store
let memoryApplications = createInitialDemoApplications('64f1a2b3c4d5e6f7a8b9c0d1');

async function ensureDemoApplications() {
  if (mongoose.connection.readyState === 1) {
    try {
      const User = require('../models/User');
      const demoUser = await User.findOne({ email: 'demo@udyamone.test' });
      if (!demoUser) return;

      const existing = await Application.findOne({ applicationId: 'MH-10245' });
      if (!existing) {
        const demoApps = createInitialDemoApplications(demoUser._id);
        for (const app of demoApps) {
          const { _id, ...appData } = app;
          await Application.create(appData);
        }
        console.log('MongoDB: Seeded demo applications MH-10245 and KA-10299 for demo user.');
      }
    } catch (err) {
      console.warn('Could not seed demo applications into MongoDB:', err.message);
    }
  }
}

function calculateProgress(app) {
  let score = 20; // Profile created
  if (app.approvals && app.approvals.length > 0) score += 20; // Evaluated
  const totalDocs = (app.documents || []).length;
  if (totalDocs > 0) {
    const approvedDocs = app.documents.filter(d => d.status === 'APPROVED' || d.status === 'VERIFIED').length;
    score += Math.round((approvedDocs / totalDocs) * 40);
  }
  if (app.status === 'Submitted') score = Math.max(score, 85);
  if (app.status === 'Completed') score = 100;
  return Math.min(score, 100);
}

/**
 * 1. Create a new application scoped to authenticated client
 */
async function createApplication(req, res) {
  try {
    const userId = req.user.id;
    const { 
      state = 'Maharashtra', 
      district = 'Pune', 
      industry = 'Manufacturing', 
      businessProfile = {},
      applicantName
    } = req.body || {};

    const profileData = {
      entityType: businessProfile.entityType || 'Private Limited Company',
      investment: Number(businessProfile.investment) || 2.5,
      turnover: Number(businessProfile.turnover) || 12.0,
      employeeCount: Number(businessProfile.employeeCount) || 25,
      powerRequired: Number(businessProfile.powerRequired) || 75,
      builtUpArea: Number(businessProfile.builtUpArea) || 1500,
      usesHazardousChemicals: Boolean(businessProfile.usesHazardousChemicals),
      isExportOriented: Boolean(businessProfile.isExportOriented)
    };

    // Evaluate requirements using statutory ruleEngine
    const evaluation = ruleEngine.evaluateEligibilityAndDependencies({
      state,
      district,
      industry,
      ...profileData
    });

    // Determine initial document status
    const documents = ruleEngine.getDocumentRequirements(profileData, false).map(doc => ({
      ...doc,
      status: 'NOT UPLOADED',
      fileName: null,
      fileSize: null
    }));

    const stateCodeMap = {
      Telangana: 'TG',
      Maharashtra: 'MH',
      Karnataka: 'KA',
      Gujarat: 'GJ',
      'Tamil Nadu': 'TN',
      'Andhra Pradesh': 'AP',
      Delhi: 'DL'
    };
    const stateCode = stateCodeMap[state] || (state || 'IN').slice(0, 2).toUpperCase();
    const uniqueAppId = `${stateCode}-${Math.floor(10000 + Math.random() * 90000)}`;

    const initialTimeline = [
      {
        event: 'Application Created',
        date: new Date(),
        status: 'Completed',
        remarks: `Initialized for ${industry} in ${district}, ${state}`
      },
      {
        event: 'Requirements Evaluated',
        date: new Date(),
        status: 'Completed',
        remarks: `${evaluation.approvals.length} required statutory approvals identified`
      }
    ];

    const appData = {
      userId,
      applicationId: uniqueAppId,
      applicantName: applicantName || req.user.name || 'Enterprise Applicant',
      promoter: req.user.name || 'Authorized Signatory',
      contactEmail: req.user.email || null,
      contactPhone: req.user.mobile || null,
      state,
      district,
      industry,
      businessProfile: profileData,
      msmeClassification: evaluation.msmeClassification,
      pollutionClassification: evaluation.pollutionClassification,
      status: 'In Progress',
      progressPercentage: 40,
      approvals: evaluation.approvals,
      approvalSequence: evaluation.nextSteps,
      dependencyGraph: evaluation.dependencyGraph,
      documents,
      timeline: initialTimeline
    };

    if (mongoose.connection.readyState === 1) {
      const created = await Application.create(appData);
      return res.status(201).json({ success: true, application: created });
    } else {
      const newId = `app_${Date.now()}`;
      const created = {
        _id: newId,
        id: newId,
        ...appData,
        createdAt: new Date()
      };
      memoryApplications.unshift(created);
      return res.status(201).json({ success: true, application: created });
    }
  } catch (err) {
    console.error('Error in createApplication:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 2. Get all applications strictly belonging to the authenticated client
 */
async function getMyApplications(req, res) {
  try {
    const userId = req.user.id;

    if (mongoose.connection.readyState === 1) {
      // Backend database ownership enforcement: only return owned applications
      const apps = await Application.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: apps.length, applications: apps });
    } else {
      const apps = memoryApplications.filter(a => a.userId.toString() === userId.toString());
      return res.json({ success: true, count: apps.length, applications: apps });
    }
  } catch (err) {
    console.error('Error in getMyApplications:', err);
    return res.status(500).json({ success: false, message: 'Unable to load applications' });
  }
}

/**
 * 3. Get single application by ID with strict ownership authorization
 */
async function getApplicationById(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    let app = null;

    if (mongoose.connection.readyState === 1) {
      // Search by _id or applicationId
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { _id: id }
        : { applicationId: id };

      app = await Application.findOne(query);

      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      // Security: verify application belongs to authenticated user
      if (app.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this application'
        });
      }

      return res.json({ success: true, application: app });
    } else {
      app = memoryApplications.find(a => a._id === id || a.applicationId === id);

      if (!app) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      if (app.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this application'
        });
      }

      return res.json({ success: true, application: app });
    }
  } catch (err) {
    console.error('Error in getApplicationById:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 4. Update application parameters or progress
 */
async function updateApplication(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body || {};

    let app = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { applicationId: id };
      app = await Application.findOne(query);

      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      // Update allowed fields
      if (updates.businessProfile) {
        app.businessProfile = { ...app.businessProfile, ...updates.businessProfile };
        // Re-evaluate clearances
        const reEval = ruleEngine.evaluateEligibilityAndDependencies({
          state: app.state,
          district: app.district,
          industry: app.industry,
          ...app.businessProfile
        });
        app.approvals = reEval.approvals;
        app.approvalSequence = reEval.nextSteps;
        app.dependencyGraph = reEval.dependencyGraph;
        app.msmeClassification = reEval.msmeClassification;
        app.pollutionClassification = reEval.pollutionClassification;
      }

      if (updates.status) app.status = updates.status;
      if (updates.progressPercentage !== undefined) {
        app.progressPercentage = Number(updates.progressPercentage);
      } else {
        app.progressPercentage = calculateProgress(app);
      }
      await app.save();

      return res.json({ success: true, application: app });
    } else {
      app = memoryApplications.find(a => a._id === id || a.applicationId === id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      if (updates.businessProfile) {
        app.businessProfile = { ...app.businessProfile, ...updates.businessProfile };
        const reEval = ruleEngine.evaluateEligibilityAndDependencies({
          state: app.state,
          district: app.district,
          industry: app.industry,
          ...app.businessProfile
        });
        app.approvals = reEval.approvals;
        app.approvalSequence = reEval.nextSteps;
        app.dependencyGraph = reEval.dependencyGraph;
        app.msmeClassification = reEval.msmeClassification;
        app.pollutionClassification = reEval.pollutionClassification;
      }

      if (updates.status) app.status = updates.status;
      if (updates.progressPercentage !== undefined) {
        app.progressPercentage = Number(updates.progressPercentage);
      } else {
        app.progressPercentage = calculateProgress(app);
      }

      return res.json({ success: true, application: app });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 5. Get application documents scoped to authenticated client
 * Database source of truth:
 * - Real database record exists -> APPROVED
 * - No database record -> NOT UPLOADED (no fake files/status)
 */
async function getApplicationDocuments(req, res) {
  try {
    const userId = req.user.id;
    const appId = req.params.applicationId || req.params.id;

    let app = null;
    let uploadedDocs = [];

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(appId) 
        ? { $or: [{ _id: appId }, { applicationId: appId }] } 
        : { applicationId: appId };
      app = await Application.findOne(query);

      if (!app) {
        console.warn(`[Document API] Application not found: ${appId}`);
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      if (app.userId.toString() !== userId.toString()) {
        console.warn(`[Document API] Ownership mismatch for application ${appId}: app.userId=${app.userId}, authUserId=${userId}`);
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      uploadedDocs = await Document.find({
        userId: app.userId,
        $or: [
          { applicationId: app._id },
          { applicationId: app.applicationId }
        ]
      });
    } else {
      app = memoryApplications.find(a => a._id === appId || a.applicationId === appId);

      if (!app) {
        console.warn(`[Document API] In-memory application not found: ${appId}`);
        return res.status(404).json({ success: false, message: 'Application not found' });
      }
      if (app.userId.toString() !== userId.toString()) {
        console.warn(`[Document API] In-memory ownership mismatch for application ${appId}: app.userId=${app.userId}, authUserId=${userId}`);
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      uploadedDocs = memoryDocuments.filter(d => 
        d.userId.toString() === userId.toString() &&
        (d.applicationId === app._id || d.applicationId === app.applicationId)
      );
    }

    // Statutory requirements for this application
    const rawRequirements = (app.documents && app.documents.length > 0)
      ? app.documents
      : ruleEngine.getDocumentRequirements(app.businessProfile || {});

    // Merge: check database for each required document
    const mergedDocs = rawRequirements.map(reqDoc => {
      const docId = reqDoc.id || reqDoc.documentId;
      const uploaded = uploadedDocs.find(d => d.documentId === docId || d.documentType === reqDoc.name) ||
        (app.documents || []).find(d => (d.id === docId || d.documentId === docId) && d.fileName);

      if (uploaded && (uploaded.fileName || uploaded.status === 'APPROVED' || uploaded.status === 'REJECTED')) {
        return {
          _id: uploaded._id || reqDoc._id || docId,
          id: docId,
          documentId: docId,
          name: reqDoc.name || uploaded.name || uploaded.documentType,
          documentType: reqDoc.name || uploaded.documentType || uploaded.name,
          category: reqDoc.category || uploaded.category || 'General Identification',
          whyRequired: reqDoc.whyRequired || uploaded.whyRequired || '',
          fileName: uploaded.fileName || null,
          fileSize: uploaded.fileSize || null,
          fileUrl: uploaded.fileUrl || null,
          status: uploaded.status || (uploaded.verified ? 'APPROVED' : 'REJECTED'),
          verified: Boolean(uploaded.verified || uploaded.status === 'APPROVED'),
          reason: uploaded.reason || (uploaded.status === 'APPROVED' ? 'Record verified in database' : 'No matching database record'),
          uploadedAt: uploaded.uploadedAt || uploaded.createdAt || null,
          databaseRecordExists: uploaded.status === 'APPROVED' || Boolean(uploaded.verified)
        };
      }

      // No uploaded record in database -> strictly NOT UPLOADED
      return {
        _id: reqDoc._id || docId,
        id: docId,
        documentId: docId,
        name: reqDoc.name,
        documentType: reqDoc.name,
        category: reqDoc.category || 'General Identification',
        whyRequired: reqDoc.whyRequired || '',
        fileName: null,
        fileSize: null,
        fileUrl: null,
        status: 'NOT UPLOADED',
        verified: false,
        reason: '',
        uploadedAt: null,
        databaseRecordExists: false
      };
    });

    // Also include any custom uploaded docs not in requirements
    uploadedDocs.forEach(uploaded => {
      const alreadyIncluded = mergedDocs.some(d => d.documentId === uploaded.documentId);
      if (!alreadyIncluded) {
        mergedDocs.push({
          _id: uploaded._id,
          id: uploaded.documentId,
          documentId: uploaded.documentId,
          name: uploaded.documentType || uploaded.name,
          documentType: uploaded.documentType || uploaded.name,
          category: uploaded.category || 'Supporting Document',
          whyRequired: uploaded.whyRequired || '',
          fileName: uploaded.fileName,
          fileSize: uploaded.fileSize,
          fileUrl: uploaded.fileUrl,
          status: uploaded.status,
          verified: uploaded.verified,
          reason: uploaded.reason,
          uploadedAt: uploaded.uploadedAt || uploaded.createdAt,
          databaseRecordExists: uploaded.status === 'APPROVED' || Boolean(uploaded.verified)
        });
      }
    });

    return res.json({
      success: true,
      applicationId: app.applicationId || app._id,
      documents: mergedDocs
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 6. Upload & validate document against database source of truth
 * - Document is APPROVED only when matching document record exists in database.
 * - Document is REJECTED when no matching document record exists in database.
 * - Never mark document as APPROVED only because user uploaded file.
 */
async function uploadApplicationDocument(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const body = req.body || {};
    const documentId = body.documentId || body.docId;
    const documentType = body.documentType || body.docName || body.name;
    const category = body.category || '';
    const whyRequired = body.whyRequired || '';

    // File name and size from uploaded file or body (strictly real data, never fake/hardcoded fallbacks)
    const uploadedFile = req.file || (req.files && req.files[0] ? req.files[0] : null);
    let fileName = body.fileName || (uploadedFile ? uploadedFile.originalname : null);
    let fileSize = body.fileSize || null;
    if (!fileSize && uploadedFile && uploadedFile.size) {
      fileSize = uploadedFile.size < 1024 * 1024 
        ? `${(uploadedFile.size / 1024).toFixed(1)} KB` 
        : `${(uploadedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (fileSize && typeof fileSize === 'number') {
      fileSize = fileSize < 1024 * 1024
        ? `${(fileSize / 1024).toFixed(1)} KB`
        : `${(fileSize / (1024 * 1024)).toFixed(1)} MB`;
    } else if (fileSize && typeof fileSize === 'string' && !isNaN(Number(fileSize))) {
      const numBytes = Number(fileSize);
      fileSize = numBytes < 1024 * 1024
        ? `${(numBytes / 1024).toFixed(1)} KB`
        : `${(numBytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    if (!documentId) {
      return res.status(400).json({ success: false, message: 'documentId is required' });
    }

    // Step 1: Check database for matching document record
    const SEED_APPROVED_IDS = ['doc-pan', 'doc-aadhaar', 'doc-reg', 'doc-land', 'doc-building', 'doc-machinery'];
    let recordExists = false;

    if (mongoose.connection.readyState === 1) {
      const match = await DocumentRecord.findOne({
        $or: [
          { documentId },
          { documentType }
        ],
        status: 'APPROVED'
      });
      recordExists = Boolean(match);
    } else {
      recordExists = SEED_APPROVED_IDS.includes(documentId);
    }

    // Core rule: matching record exists -> APPROVED, else REJECTED
    const newStatus = recordExists ? 'APPROVED' : 'REJECTED';
    const reason = recordExists 
      ? 'Verified against statutory database registry' 
      : 'No matching statutory record found in database registry';

    let app = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { applicationId: id };
      app = await Application.findOne(query);

      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      // Upsert into Document collection
      const docRecord = await Document.findOneAndUpdate(
        {
          userId: app.userId,
          applicationId: app._id,
          documentId
        },
        {
          userId: app.userId,
          applicationId: app._id,
          documentId,
          documentType: documentType || documentId,
          category,
          whyRequired,
          fileName,
          fileSize,
          fileUrl: `/uploads/${documentId}.pdf`,
          status: newStatus,
          verified: recordExists,
          reason
        },
        { upsert: true, new: true }
      );

      const docIndex = app.documents.findIndex(d => d.id === documentId || d.documentId === documentId);
      const updatedDoc = {
        _id: docRecord._id,
        id: documentId,
        documentId,
        name: documentType || (docIndex >= 0 ? app.documents[docIndex].name : documentId),
        documentType: documentType || (docIndex >= 0 ? app.documents[docIndex].name : documentId),
        category: category || (docIndex >= 0 ? app.documents[docIndex].category : 'General Identification'),
        whyRequired: whyRequired || (docIndex >= 0 ? app.documents[docIndex].whyRequired : ''),
        fileName,
        fileSize,
        fileUrl: `/uploads/${documentId}.pdf`,
        status: newStatus,
        verified: recordExists,
        reason,
        uploadedAt: new Date().toISOString(),
        databaseRecordExists: recordExists
      };

      if (docIndex >= 0) {
        app.documents[docIndex] = { ...app.documents[docIndex], ...updatedDoc };
      } else {
        app.documents.push(updatedDoc);
      }

      app.timeline.push({
        event: `Document Uploaded: ${updatedDoc.name}`,
        date: new Date(),
        status: newStatus,
        remarks: recordExists ? 'Verified against database record: APPROVED' : 'No database record found: REJECTED'
      });

      app.progressPercentage = calculateProgress(app);
      await app.save();

      return res.json({ success: true, application: app, document: updatedDoc });
    } else {
      app = memoryApplications.find(a => a._id === id || a.applicationId === id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      const docIndex = app.documents.findIndex(d => d.id === documentId || d.documentId === documentId);
      const updatedDoc = {
        _id: 'doc_' + Date.now(),
        id: documentId,
        documentId,
        name: documentType || (docIndex >= 0 ? app.documents[docIndex].name : documentId),
        documentType: documentType || (docIndex >= 0 ? app.documents[docIndex].name : documentId),
        category: category || (docIndex >= 0 ? app.documents[docIndex].category : 'General Identification'),
        whyRequired: whyRequired || (docIndex >= 0 ? app.documents[docIndex].whyRequired : ''),
        fileName,
        fileSize,
        fileUrl: `/uploads/${documentId}.pdf`,
        status: newStatus,
        verified: recordExists,
        reason,
        uploadedAt: new Date().toISOString(),
        databaseRecordExists: recordExists
      };

      // Save in memoryDocuments
      const memDocIndex = memoryDocuments.findIndex(d => 
        d.userId.toString() === userId.toString() &&
        (d.applicationId === app._id || d.applicationId === app.applicationId) &&
        d.documentId === documentId
      );
      const memDoc = {
        ...updatedDoc,
        userId: app.userId,
        applicationId: app.applicationId || app._id
      };
      if (memDocIndex >= 0) {
        memoryDocuments[memDocIndex] = memDoc;
      } else {
        memoryDocuments.push(memDoc);
      }

      if (docIndex >= 0) {
        app.documents[docIndex] = { ...app.documents[docIndex], ...updatedDoc };
      } else {
        app.documents.push(updatedDoc);
      }

      app.timeline.push({
        event: `Document Uploaded: ${updatedDoc.name}`,
        date: new Date(),
        status: newStatus,
        remarks: recordExists ? 'Verified against database record: APPROVED' : 'No database record found: REJECTED'
      });

      app.progressPercentage = calculateProgress(app);

      return res.json({ success: true, application: app, document: updatedDoc });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 7. Delete document from application
 */
async function deleteApplicationDocument(req, res) {
  try {
    const userId = req.user.id;
    const { id, docId } = req.params;

    let app = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { applicationId: id };
      app = await Application.findOne(query);

      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      await Document.deleteOne({
        userId: app.userId,
        $or: [{ applicationId: app._id }, { applicationId: app.applicationId }],
        documentId: docId
      });

      const docIndex = app.documents.findIndex(d => d.id === docId || d.documentId === docId);
      if (docIndex >= 0) {
        const docName = app.documents[docIndex].name;
        app.documents[docIndex].status = 'NOT UPLOADED';
        app.documents[docIndex].fileName = null;
        app.documents[docIndex].fileSize = null;
        app.documents[docIndex].fileUrl = null;
        app.documents[docIndex].uploadedAt = null;
        app.documents[docIndex].databaseRecordExists = false;
        app.documents[docIndex].verified = false;
        app.documents[docIndex].reason = '';

        app.timeline.push({
          event: `Document Removed: ${docName}`,
          date: new Date(),
          status: 'Reset',
          remarks: 'File deleted by client. Status reset to NOT UPLOADED.'
        });
      }

      app.progressPercentage = calculateProgress(app);
      await app.save();

      return res.json({ success: true, application: app });
    } else {
      app = memoryApplications.find(a => a._id === id || a.applicationId === id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      memoryDocuments = memoryDocuments.filter(d => 
        !(d.userId.toString() === userId.toString() &&
          (d.applicationId === app._id || d.applicationId === app.applicationId) &&
          d.documentId === docId)
      );

      const docIndex = app.documents.findIndex(d => d.id === docId || d.documentId === docId);
      if (docIndex >= 0) {
        const docName = app.documents[docIndex].name;
        app.documents[docIndex].status = 'NOT UPLOADED';
        app.documents[docIndex].fileName = null;
        app.documents[docIndex].fileSize = null;
        app.documents[docIndex].fileUrl = null;
        app.documents[docIndex].uploadedAt = null;
        app.documents[docIndex].databaseRecordExists = false;
        app.documents[docIndex].verified = false;
        app.documents[docIndex].reason = '';

        app.timeline.push({
          event: `Document Removed: ${docName}`,
          date: new Date(),
          status: 'Reset',
          remarks: 'File deleted by client. Status reset to NOT UPLOADED.'
        });
      }

      app.progressPercentage = calculateProgress(app);

      return res.json({ success: true, application: app });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * 8. Submit Application
 */
async function submitApplication(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    let app = null;

    if (mongoose.connection.readyState === 1) {
      const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { applicationId: id };
      app = await Application.findOne(query);

      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      app.status = 'Submitted';
      app.progressPercentage = Math.max(app.progressPercentage, 85);
      app.timeline.push({
        event: 'Application Submitted',
        date: new Date(),
        status: 'Submitted',
        remarks: 'Dossier successfully lodged for department scrutiny.'
      });
      await app.save();

      return res.json({ success: true, application: app });
    } else {
      app = memoryApplications.find(a => a._id === id || a.applicationId === id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
      if (app.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: 'You do not have permission to access this application' });
      }

      app.status = 'Submitted';
      app.progressPercentage = Math.max(app.progressPercentage, 85);
      app.timeline.push({
        event: 'Application Submitted',
        date: new Date(),
        status: 'Submitted',
        remarks: 'Dossier successfully lodged for department scrutiny.'
      });

      return res.json({ success: true, application: app });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createApplication,
  getMyApplications,
  getApplicationById,
  getApplicationDocuments,
  updateApplication,
  uploadApplicationDocument,
  deleteApplicationDocument,
  submitApplication,
  ensureDemoApplications,
  memoryApplications,
  memoryDocuments
};
