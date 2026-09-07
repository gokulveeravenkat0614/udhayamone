import http from 'http';
import app from '../backend/app.js';
import { evaluateEligibilityAndDependencies } from '../backend/services/ruleEngine.js';

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${name}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${name}`);
  }
}

console.log("\n=======================================================");
console.log("🚀 RUNNING END-TO-END INTEGRATION & DAG VALIDATION TESTS");
console.log("=======================================================\n");

// 1. DAG ACYCLIC VALIDATION TEST
console.log("▶ TEST SUITE 1: DAG Structural Integrity & Acyclicity");
const fullEval = evaluateEligibilityAndDependencies({
  state: 'Maharashtra',
  district: 'Pune',
  industry: 'Manufacturing',
  employeeCount: 25,
  powerRequired: 75,
  builtUpArea: 1500
});

const { nodes, edges } = fullEval.dependencyGraph;
assert(nodes.length === 5, `Expected 5 approval nodes in graph, received ${nodes.length}`);
assert(edges.length > 0, `Expected directed edges, received ${edges.length}`);

// Detect cycles using DFS
const adjacency = new Map();
nodes.forEach(n => adjacency.set(n.id, []));
edges.forEach(e => {
  if (adjacency.has(e.source)) {
    adjacency.get(e.source).push(e.target);
  }
});

const visited = new Set();
const recStack = new Set();
let hasCycle = false;

function isCyclic(nodeId) {
  visited.add(nodeId);
  recStack.add(nodeId);

  const neighbors = adjacency.get(nodeId) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (isCyclic(neighbor)) return true;
    } else if (recStack.has(neighbor)) {
      return true;
    }
  }

  recStack.delete(nodeId);
  return false;
}

for (const node of nodes) {
  if (!visited.has(node.id)) {
    if (isCyclic(node.id)) {
      hasCycle = true;
      break;
    }
  }
}
assert(!hasCycle, "Approval Dependency Graph is strictly Acyclic (DAG validated)");

// Check topological order: prerequisite nodes must appear in equal or earlier phase than dependent nodes
let topologicalOrderValid = true;
const nodeMap = new Map();
nodes.forEach(n => nodeMap.set(n.id, n));

for (const edge of edges) {
  const sourceNode = nodeMap.get(edge.source);
  const targetNode = nodeMap.get(edge.target);
  if (sourceNode && targetNode) {
    if (sourceNode.phase > targetNode.phase) {
      topologicalOrderValid = false;
      console.error(`Topological violation: ${sourceNode.id} (Phase ${sourceNode.phase}) -> ${targetNode.id} (Phase ${targetNode.phase})`);
    }
  }
}
assert(topologicalOrderValid, "Topological phase ordering holds for all directed prerequisite edges");

// 2. BACKEND REST API ENDPOINT INTEGRATION
console.log("\n▶ TEST SUITE 2: Backend REST API Endpoints");

const server = app.listen(5098, async () => {
  try {
    // Test 1: Health
    await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:5098/api/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(json.success === true, "GET /api/health returned success:true");
          assert(json.service === 'udyamone-backend', "GET /api/health identified service");
          resolve();
        });
      }).on('error', reject);
    });

    // Test 2: POST /api/approvals/evaluate
    await new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        state: 'Maharashtra',
        district: 'Pune',
        industry: 'Manufacturing',
        employeeCount: 8, // Triggers factory exemption
        powerRequired: 20
      });

      const req = http.request('http://127.0.0.1:5098/api/approvals/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(json.success === true, "POST /api/approvals/evaluate returned HTTP 200 with success:true");
          assert(json.data.summary.approvalsCount >= 4, `Evaluated approvals count is ${json.data.summary.approvalsCount}`);
          assert(json.data.exemptApprovals.length >= 1, `Exempt approvals recorded: ${json.data.exemptApprovals.length}`);
          const hasShopEst = json.data.approvals.some(a => a.name.includes("Shop & Establishment"));
          assert(hasShopEst, "Evaluated response includes Shop & Establishment for 8 workers");
          resolve();
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    // Test 3: GET /api/approvals/catalog
    await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:5098/api/approvals/catalog?state=Maharashtra&district=Pune', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(json.success === true, "GET /api/approvals/catalog returned catalog list");
          assert(Array.isArray(json.data) && json.data.length >= 5, `Catalog contains ${json.data.length} master approvals`);
          resolve();
        });
      }).on('error', reject);
    });

    // Test 4: Document Approval Logic - Database Record Exists -> APPROVED
    console.log("\n▶ TEST SUITE 3: Document Approval Database Validation Logic");
    await new Promise((resolve, reject) => {
      const docPayload = JSON.stringify({
        documentId: 'doc-pan',
        documentType: 'PAN Card / Business PAN',
        applicationId: 'MH-10245',
        userId: 'demo-user'
      });
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5098,
        path: '/api/documents/validate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(docPayload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(json.success === true, "POST /api/documents/validate returned HTTP 200 with success:true");
          assert(json.recordExists === true, "Matching record found in database for doc-pan");
          assert(json.status === 'APPROVED', "Document with matching database record is marked APPROVED");
          assert(json.badge === 'APPROVED', "Status badge for matching database record is APPROVED");
          resolve();
        });
      });
      req.on('error', reject);
      req.write(docPayload);
      req.end();
    });

    // Test 5: Document Approval Logic - Database Record DOES NOT Exist -> REJECTED
    await new Promise((resolve, reject) => {
      const docPayload = JSON.stringify({
        documentId: 'doc-project',
        documentType: 'Project Report',
        applicationId: 'MH-10245',
        userId: 'demo-user'
      });
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5098,
        path: '/api/documents/validate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(docPayload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(json.success === true, "POST /api/documents/validate returned HTTP 200");
          assert(json.recordExists === false, "No matching record in database for doc-project");
          assert(json.status === 'REJECTED', "Document WITHOUT matching database record is marked REJECTED");
          assert(json.badge === 'REJECTED', "Status badge for missing database record is REJECTED");
          resolve();
        });
      });
      req.on('error', reject);
      req.write(docPayload);
      req.end();
    });

    // Test 6: Core Rule - Never mark document as APPROVED only because file was uploaded
    await new Promise((resolve, reject) => {
      const arbitraryPayload = JSON.stringify({
        documentId: 'doc-arbitrary-unregistered-file',
        documentType: 'Arbitrary Random Document',
        fileName: 'arbitrary_uploaded_document.pdf',
        fileSize: '5.2 MB'
      });
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5098,
        path: '/api/documents/validate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(arbitraryPayload)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const json = JSON.parse(data);
          assert(json.recordExists === false, "Arbitrary uploaded file does NOT match database record");
          assert(json.status === 'REJECTED', "Core Rule Enforced: Uploaded file without DB record is REJECTED, never APPROVED");
          resolve();
        });
      });
      req.on('error', reject);
      req.write(arbitraryPayload);
      req.end();
    });

    // TEST SUITE 4: Client Authentication & Application Workspace API
    console.log("\n▶ TEST SUITE 4: Client Authentication & Application Workspace API");

    function makeJsonRequest({ path, method = 'GET', headers = {}, body = null }) {
      return new Promise((resolve, reject) => {
        const postData = body ? JSON.stringify(body) : null;
        const reqHeaders = { ...headers };
        if (postData) {
          reqHeaders['Content-Type'] = 'application/json';
          reqHeaders['Content-Length'] = Buffer.byteLength(postData);
        }
        const req = http.request({
          hostname: '127.0.0.1',
          port: 5098,
          path,
          method,
          headers: reqHeaders
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            let json = null;
            try { json = JSON.parse(data); } catch {}
            resolve({ statusCode: res.statusCode, data: json, raw: data });
          });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
      });
    }

    // 4.1 Register validation: Reject short mobile
    const regInvalidMobile = await makeJsonRequest({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Test Enterprise',
        email: 'test@enterprise.in',
        mobile: '12345',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      }
    });
    assert(regInvalidMobile.statusCode === 400, "Registration rejects mobile number under 10 digits");

    // 4.2 Register validation: Reject mismatched password
    const regMismatch = await makeJsonRequest({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Test Enterprise',
        email: 'test@enterprise.in',
        mobile: '9876543210',
        password: 'Password@123',
        confirmPassword: 'DifferentPassword'
      }
    });
    assert(regMismatch.statusCode === 400, "Registration rejects mismatched password confirmation");

    // 4.3 Register: Successful new user creation
    const uniqueEmail = `client_${Date.now()}@enterprise.in`;
    const uniqueMobile = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
    const regSuccess = await makeJsonRequest({
      path: '/api/auth/register',
      method: 'POST',
      body: {
        name: 'Apex Industrial Corp',
        email: uniqueEmail,
        mobile: uniqueMobile,
        password: 'Password@123',
        confirmPassword: 'Password@123'
      }
    });
    assert(regSuccess.statusCode === 201 && regSuccess.data?.token, "Registration successfully creates new client and issues JWT token");
    const newClientToken = regSuccess.data?.token;

    // 4.4 Login: Authenticate with demo email and Password@123
    const loginEmail = await makeJsonRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: 'demo@udyamone.test', password: 'Password@123' }
    });
    assert(loginEmail.statusCode === 200 && loginEmail.data?.token, "Login succeeds with demo email and Password@123");
    const demoToken = loginEmail.data?.token;

    // 4.5 Login: Authenticate with mobile number and password
    const loginMobile = await makeJsonRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: '9820144521', password: 'Password@123' }
    });
    assert(loginMobile.statusCode === 200 && loginMobile.data?.token, "Login succeeds with 10-digit mobile number");

    // 4.6 Login: Rejects invalid password
    const loginBadPass = await makeJsonRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: 'demo@udyamone.test', password: 'WrongPassword' }
    });
    assert(loginBadPass.statusCode === 401, "Login rejects incorrect password with HTTP 401");

    // 4.7 GET /api/auth/me returns current user
    const meRes = await makeJsonRequest({
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(meRes.statusCode === 200 && meRes.data?.user?.email === 'demo@udyamone.test', "GET /api/auth/me returns authenticated user");

    // 4.8 Unauthenticated access to /api/applications rejected
    const unauthApps = await makeJsonRequest({ path: '/api/applications' });
    assert(unauthApps.statusCode === 401, "GET /api/applications returns 401 Unauthorized without token");

    // 4.9 GET /api/applications with token returns client's applications
    const demoApps = await makeJsonRequest({
      path: '/api/applications',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(demoApps.statusCode === 200 && Array.isArray(demoApps.data?.applications), "GET /api/applications returns client-owned applications");
    assert(demoApps.data.applications.length >= 2, "Demo user has pre-evaluated applications loaded");

    // 4.10 POST /api/applications creates new application with rules evaluation
    const createNewApp = await makeJsonRequest({
      path: '/api/applications',
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
      body: {
        state: 'Maharashtra',
        district: 'Pune',
        industry: 'Manufacturing',
        businessProfile: {
          entityType: 'Private Limited Company',
          investment: 2.5,
          turnover: 12.0,
          employeeCount: 25,
          powerRequired: 75,
          builtUpArea: 1500
        }
      }
    });
    assert(createNewApp.statusCode === 201 && createNewApp.data?.application?.applicationId, "POST /api/applications creates new application with unique ID");
    const createdAppId = createNewApp.data?.application?.applicationId;

    // 4.11 GET /api/applications/:id fetches application workspace data
    const getApp = await makeJsonRequest({
      path: `/api/applications/${createdAppId}`,
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(getApp.statusCode === 200 && getApp.data?.application?.approvals?.length > 0, "GET /api/applications/:id returns application with evaluated statutory approvals");

    // 4.12 PUT /api/applications/:id updates application progress
    const updateApp = await makeJsonRequest({
      path: `/api/applications/${createdAppId}`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${demoToken}` },
      body: {
        progressPercentage: 55,
        status: 'In Progress'
      }
    });
    assert(updateApp.statusCode === 200 && updateApp.data?.application?.progressPercentage === 55, "PUT /api/applications/:id updates progress percentage");

    // 4.13 Client Isolation: New Client cannot access Demo Client's application
    const crossAccess = await makeJsonRequest({
      path: `/api/applications/${createdAppId}`,
      headers: { Authorization: `Bearer ${newClientToken}` }
    });
    assert(crossAccess.statusCode === 403, "Backend ownership isolation enforced: Client cannot access another user's application (HTTP 403)");

    // 4.14 POST /api/applications/:id/submit submits application for review
    const submitApp = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/submit`,
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(submitApp.statusCode === 200 && submitApp.data?.application?.status === 'Submitted', "POST /api/applications/:id/submit marks status as Submitted");

    // 4.15 GET /api/applications/:id/documents requires authentication
    const unauthDocs = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents`
    });
    assert(unauthDocs.statusCode === 401, "GET /api/applications/:id/documents rejects unauthenticated request (HTTP 401)");

    // 4.16 User Data Isolation: Client B cannot view Client A's application documents
    const crossDocs = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents`,
      headers: { Authorization: `Bearer ${newClientToken}` }
    });
    assert(crossDocs.statusCode === 403, "User data isolation enforced: Client B cannot view Client A documents (HTTP 403)");

    // 4.17 Initial state: Required documents show strictly 'NOT UPLOADED' with null file fields
    const initialDocs = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents`,
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(initialDocs.statusCode === 200 && Array.isArray(initialDocs.data?.documents), "GET /api/applications/:id/documents returns documents array");
    const allNotUploaded = initialDocs.data.documents.every(d => d.status === 'NOT UPLOADED' && d.fileName === null && d.fileSize === null);
    assert(allNotUploaded, "Real Database Core Rule: Un-uploaded statutory documents strictly show status 'NOT UPLOADED' with no fake files");

    // 4.18 POST /api/applications/:id/documents creates real database record and validates against database source of truth
    const uploadApproved = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents`,
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
      body: {
        documentId: 'doc-pan',
        documentType: 'PAN Card / Business PAN',
        fileName: 'actual_enterprise_pan.pdf',
        fileSize: '1.4 MB'
      }
    });
    assert(uploadApproved.statusCode === 200 && uploadApproved.data?.document?.status === 'APPROVED', "Upload with matching database record creates APPROVED real database document");
    assert(uploadApproved.data?.document?.fileName === 'actual_enterprise_pan.pdf', "Real document displays actual uploaded filename");

    const uploadProject = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents`,
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
      body: {
        documentId: 'doc-project',
        documentType: 'Custom Project Report',
        fileName: 'actual_project_report.pdf',
        fileSize: '3.1 MB'
      }
    });
    assert(uploadProject.statusCode === 200 && uploadProject.data?.document?.status === 'APPROVED', "Upload creates MongoDB document record and is marked APPROVED");
    assert(uploadProject.data?.document?.fileName === 'actual_project_report.pdf', "Real document displays actual uploaded filename");

    // 4.19 DELETE /api/applications/:id/documents/:docId resets status to NOT UPLOADED
    const deleteDoc = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents/doc-pan`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(deleteDoc.statusCode === 200 && deleteDoc.data?.success === true, "DELETE /api/applications/:id/documents/:docId deletes uploaded document");

    // 4.20 Verify state after delete via GET documents
    const afterDeleteDocs = await makeJsonRequest({
      path: `/api/applications/${createdAppId}/documents`,
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    const panAfterDelete = afterDeleteDocs.data.documents.find(d => d.documentId === 'doc-pan');
    assert(panAfterDelete && panAfterDelete.status === 'NOT UPLOADED' && panAfterDelete.fileName === null, "Document status successfully reset to NOT UPLOADED with null filename upon deletion");

    // 4.21 Direct root route /applications/:id/documents without /api prefix works
    const directRootDocs = await makeJsonRequest({
      path: `/applications/${createdAppId}/documents`,
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(directRootDocs.statusCode === 200 && Array.isArray(directRootDocs.data?.documents), "GET /applications/:id/documents works with and without /api prefix");

    // 4.22 Non-existent application returns HTTP 404 with Application not found
    const notFoundDocs = await makeJsonRequest({
      path: `/api/applications/non-existent-app-99999/documents`,
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(notFoundDocs.statusCode === 404, "GET /api/applications/:id/documents returns HTTP 404 when application does not exist");

    // 4.23 Real document counts come strictly from database records without hardcoded numbers
    const totalDocsCount = directRootDocs.data.documents.length;
    const approvedDocsCount = directRootDocs.data.documents.filter(d => d.status === 'APPROVED').length;
    const rejectedDocsCount = directRootDocs.data.documents.filter(d => d.status === 'REJECTED').length;
    const notUploadedDocsCount = directRootDocs.data.documents.filter(d => d.status === 'NOT UPLOADED').length;
    assert(totalDocsCount > 0 && approvedDocsCount === 1 && rejectedDocsCount === 0 && (approvedDocsCount + notUploadedDocsCount === totalDocsCount), "Document counts dynamically calculated from actual database records (zero fake uploaded documents)");

    // TEST SUITE 5: Identity Verification & Authentication Flow
    console.log("\n▶ TEST SUITE 5: Identity Verification & Authentication Flow");

    // 5.1 GET /api/verification/status requires authentication
    const unauthStatus = await makeJsonRequest({
      path: '/api/verification/status'
    });
    assert(unauthStatus.statusCode === 401, "GET /api/verification/status rejects unauthenticated request (HTTP 401)");

    // 5.2 POST /api/verification/submit requires authentication
    const unauthSubmit = await makeJsonRequest({
      path: '/api/verification/submit',
      method: 'POST'
    });
    assert(unauthSubmit.statusCode === 401, "POST /api/verification/submit rejects unauthenticated request (HTTP 401)");

    // 5.3 POST /api/verification/submit rejects invalid/expired token
    const invalidTokenSubmit = await makeJsonRequest({
      path: '/api/verification/submit',
      method: 'POST',
      headers: { Authorization: 'Bearer invalid.or.expired.jwt.token' }
    });
    assert(invalidTokenSubmit.statusCode === 401, "POST /api/verification/submit rejects invalid/expired token with HTTP 401");

    // 5.4 POST /api/verification/submit validates required files
    const noFilesSubmit = await makeJsonRequest({
      path: '/api/verification/submit',
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(noFilesSubmit.statusCode === 400, "POST /api/verification/submit returns HTTP 400 when document1 or selfie is missing");

    // 5.5 POST /api/verification/submit with authenticated user and multipart files succeeds
    await new Promise((resolve, reject) => {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);
      const dummyImage = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9]);
      
      let bodyParts = [];
      bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="document1"; filename="pan_card.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`));
      bodyParts.push(dummyImage);
      bodyParts.push(Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="selfie"; filename="live_selfie.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`));
      bodyParts.push(dummyImage);
      bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));
      
      const payload = Buffer.concat(bodyParts);
      const req = http.request({
        hostname: '127.0.0.1',
        port: 5098,
        path: '/api/verification/submit',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${demoToken}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': payload.length
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          assert(res.statusCode === 200, "POST /api/verification/submit succeeds with HTTP 200 for authenticated user");
          const json = JSON.parse(data);
          assert(json.success === true && json.verification, "Verification response contains created verification dossier");
          assert(json.verification.status === 'verified', "Verification status completed with status 'verified'");
          assert(json.verification.documentMatch === true, "Verification document match confirmed");
          assert(json.verification.faceMatch === true, "Verification facial match confirmed");
          resolve();
        });
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    // 5.6 GET /api/verification/status returns verified status for authenticated user
    const authedStatus = await makeJsonRequest({
      path: '/api/verification/status',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(authedStatus.statusCode === 200 && authedStatus.data?.success === true, "GET /api/verification/status returns HTTP 200");
    assert(authedStatus.data?.verificationStatus === 'verified', "User verificationStatus updated to 'verified'");
    assert(authedStatus.data?.verification != null, "Verification record returned for authenticated user");

    // 5.7 GET /api/verification/history returns user's verification records
    const authedHistory = await makeJsonRequest({
      path: '/api/verification/history',
      headers: { Authorization: `Bearer ${demoToken}` }
    });
    assert(authedHistory.statusCode === 200 && Array.isArray(authedHistory.data?.records), "GET /api/verification/history returns records list");
    assert(authedHistory.data?.records.length >= 1, "Verification history records contain newly submitted verification");

    // =========================================================
    // 6. INDUSTRY AREA ELIGIBILITY REST APIS & SITING RULES
    // =========================================================
    console.log("\n▶ TEST SUITE 6: Industry Area Eligibility API & Siting Rules");

    // 6.1 GET /api/industry-areas/states returns supported states list
    const statesRes = await makeJsonRequest({ path: '/api/industry-areas/states' });
    assert(statesRes.statusCode === 200 && statesRes.data?.success === true, "GET /api/industry-areas/states returns HTTP 200 with success:true");
    assert(Array.isArray(statesRes.data?.states) && statesRes.data?.states.length >= 8, "Supported states list contains all 8 website states/UTs");
    const mhState = statesRes.data?.states.find(s => s.name === 'Maharashtra');
    assert(mhState && mhState.hasVerifiedData === true && mhState.verifiedCount >= 6, "Maharashtra has verified industry areas available");

    // 6.2 GET /api/industry-areas rejects request missing mandatory state query param
    const noStateRes = await makeJsonRequest({ path: '/api/industry-areas' });
    assert(noStateRes.statusCode === 400 && noStateRes.data?.success === false, "GET /api/industry-areas returns HTTP 400 when state param is omitted");

    // 6.3 GET /api/industry-areas?state=Maharashtra returns all verified records in state
    const mhAreasRes = await makeJsonRequest({ path: '/api/industry-areas?state=Maharashtra' });
    assert(mhAreasRes.statusCode === 200 && mhAreasRes.data?.success === true, "GET /api/industry-areas?state=Maharashtra returns HTTP 200");
    assert(mhAreasRes.data?.count >= 6, `Maharashtra returned all verified area records (${mhAreasRes.data?.count} found)`);

    // 6.4 Category Filter: RED returns strictly RED category records
    const redAreasRes = await makeJsonRequest({ path: '/api/industry-areas?state=Maharashtra&category=RED' });
    assert(redAreasRes.statusCode === 200 && redAreasRes.data?.areas.length >= 2, "GET /api/industry-areas with category=RED returns records");
    assert(redAreasRes.data?.areas.every(a => a.category === 'RED'), "All returned areas have category === 'RED'");

    // 6.5 Category Filter: ORANGE returns strictly ORANGE category records
    const orangeAreasRes = await makeJsonRequest({ path: '/api/industry-areas?state=Maharashtra&category=ORANGE' });
    assert(orangeAreasRes.statusCode === 200 && orangeAreasRes.data?.areas.length >= 2, "GET /api/industry-areas with category=ORANGE returns records");
    assert(orangeAreasRes.data?.areas.every(a => a.category === 'ORANGE'), "All returned areas have category === 'ORANGE'");

    // 6.6 Category Filter: WHITE returns strictly WHITE category records
    const whiteAreasRes = await makeJsonRequest({ path: '/api/industry-areas?state=Maharashtra&category=WHITE' });
    assert(whiteAreasRes.statusCode === 200 && whiteAreasRes.data?.areas.length >= 1, "GET /api/industry-areas with category=WHITE returns records");
    assert(whiteAreasRes.data?.areas.every(a => a.category === 'WHITE'), "All returned areas have category === 'WHITE'");

    // 6.7 District + Category combination filter
    const puneOrangeRes = await makeJsonRequest({ path: '/api/industry-areas?state=Maharashtra&district=Pune&category=ORANGE' });
    assert(puneOrangeRes.statusCode === 200 && puneOrangeRes.data?.areas.length >= 1, "GET /api/industry-areas with state=Maharashtra&district=Pune&category=ORANGE returns matching records");
    assert(puneOrangeRes.data?.areas.every(a => a.district === 'Pune' && a.category === 'ORANGE'), "Returned areas strictly match Pune district and ORANGE category");

    // 6.8 Free-text and industry search
    const searchRes = await makeJsonRequest({ path: '/api/industry-areas/search?industry=Pharmaceutical' });
    assert(searchRes.statusCode === 200 && searchRes.data?.success === true, "GET /api/industry-areas/search?industry=Pharmaceutical returns HTTP 200");
    assert(searchRes.data?.count >= 1, "Search returns industry-specific areas");

    // 6.9 Regulatory Data Completeness: every record contains mandatory fields
    const sampleArea = mhAreasRes.data?.areas[0];
    assert(sampleArea && Boolean(sampleArea.industrialArea), "Area record contains industrialArea name");
    assert(Boolean(sampleArea.authority), "Area record contains authority/SPCB");
    assert(Boolean(sampleArea.sourceTitle), "Area record contains official sourceTitle");
    assert(Boolean(sampleArea.conditions), "Area record contains statutory siting conditions");
    assert(Boolean(sampleArea.lastVerifiedAt), "Area record contains lastVerifiedAt date");
    assert(typeof sampleArea.latitude === 'number' || (sampleArea.coordinates && typeof sampleArea.coordinates.lat === 'number'), "Area record contains valid latitude");
    assert(typeof sampleArea.longitude === 'number' || (sampleArea.coordinates && typeof sampleArea.coordinates.lng === 'number'), "Area record contains valid longitude");

    // 6.10 Rule 2: Unonboarded state returns empty results (zero fake data)
    const otherStatesRes = await makeJsonRequest({ path: '/api/industry-areas?state=Other%20States' });
    assert(otherStatesRes.statusCode === 200 && otherStatesRes.data?.count === 0, "Unonboarded state strictly returns 0 fake records");

    // 6.11 Admin Data Management: Rejects unauthenticated creation
    const unauthedCreate = await makeJsonRequest({
      path: '/api/industry-areas',
      method: 'POST',
      body: { state: 'Maharashtra', district: 'Pune', industrialArea: 'Test Area', category: 'GREEN' }
    });
    assert(unauthedCreate.statusCode === 401, "POST /api/industry-areas rejects unauthenticated request (HTTP 401)");

    // 6.12 Admin Data Management: Rejects non-admin user
    const nonAdminCreate = await makeJsonRequest({
      path: '/api/industry-areas',
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
      body: { state: 'Maharashtra', district: 'Pune', industrialArea: 'Test Area', category: 'GREEN' }
    });
    assert(nonAdminCreate.statusCode === 403, "POST /api/industry-areas rejects non-admin client (HTTP 403)");

    // 6.13 Admin Data Management: Admin creates a verified record
    const adminLogin = await makeJsonRequest({
      path: '/api/auth/login',
      method: 'POST',
      body: { email: 'admin@udyamone.test', password: 'Admin@123' }
    });
    assert(adminLogin.statusCode === 200 && adminLogin.data?.token, "Admin login succeeds with demo admin credentials");
    const adminToken = adminLogin.data?.token;

    // Rule 9: Reject incomplete record
    const incompleteCreate = await makeJsonRequest({
      path: '/api/industry-areas',
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { state: 'Maharashtra', industrialArea: 'Incomplete Area' }
    });
    assert(incompleteCreate.statusCode === 400, "POST /api/industry-areas rejects incomplete record missing mandatory fields (HTTP 400)");

    // Complete verified record creation
    const validCreate = await makeJsonRequest({
      path: '/api/industry-areas',
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        state: 'Maharashtra',
        district: 'Pune',
        industrialArea: 'Talegaon Industrial Park (Phase II)',
        category: 'GREEN',
        industryType: ['Electronics', 'Renewable Energy'],
        eligibilityStatus: 'Allowed',
        conditions: 'Permitted for dry electronics assembly and solar equipment manufacturing. Zero trade effluent discharge.',
        authority: 'Maharashtra Pollution Control Board (MPCB)',
        sourceTitle: 'MPCB Industrial Siting Guidelines 2026',
        sourceUrl: 'https://mpcb.gov.in',
        lastVerifiedAt: '2026-03-01'
      }
    });
    assert(validCreate.statusCode === 201 && validCreate.data?.area?._id, "Admin successfully creates new verified industry area record (HTTP 201)");
    const createdAreaId = validCreate.data?.area?._id;

    // 6.14 Admin Data Management: Update existing record
    const updateRes = await makeJsonRequest({
      path: `/api/industry-areas/${createdAreaId}`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        eligibilityStatus: 'Conditional',
        conditions: 'Updated: Connection to common rain harvesting system and dry assembly strictly enforced.'
      }
    });
    assert(updateRes.statusCode === 200 && updateRes.data?.area?.eligibilityStatus === 'Conditional', "Admin successfully updates industrial area record (HTTP 200)");

    // 6.15 Admin Data Management: Delete outdated record
    const deleteRes = await makeJsonRequest({
      path: `/api/industry-areas/${createdAreaId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(deleteRes.statusCode === 200 && deleteRes.data?.success === true, "Admin successfully deletes outdated industrial area record (HTTP 200)");

    // ==========================================
    // 7. AI ASSISTANT API ENDPOINTS & ERROR CONTRACTS
    // ==========================================
    console.log("\n▶ TEST SUITE 7: UdyamOne AI Assistant Endpoints & Taxonomy");

    // 7.1 Health check endpoint on /api/ai/health
    const aiHealth = await makeJsonRequest({ path: '/api/ai/health' });
    assert(aiHealth.statusCode === 200, "GET /api/ai/health returns HTTP 200");
    assert(aiHealth.data?.success === true, "GET /api/ai/health returns success: true");
    assert(typeof aiHealth.data?.aiConfigured === 'boolean', "GET /api/ai/health reports boolean aiConfigured status");
    assert(typeof aiHealth.data?.providerReachable === 'boolean', "GET /api/ai/health reports boolean providerReachable status");

    // 7.2 Health check alias on /api/assistant/health
    const assistantHealth = await makeJsonRequest({ path: '/api/assistant/health' });
    assert(assistantHealth.statusCode === 200, "GET /api/assistant/health returns HTTP 200");
    assert(assistantHealth.data?.aiConfigured === aiHealth.data?.aiConfigured, "GET /api/assistant/health matches /api/ai/health");

    // 7.3 Direct fallback endpoint /ai/health
    const rootAiHealth = await makeJsonRequest({ path: '/ai/health' });
    assert(rootAiHealth.statusCode === 200, "GET /ai/health fallback returns HTTP 200");

    // 7.4 Input validation: Empty message rejected with HTTP 400
    const emptyChat = await makeJsonRequest({
      path: '/api/ai/chat',
      method: 'POST',
      body: { message: '   ', sessionId: 'test-session-1' }
    });
    assert(emptyChat.statusCode === 400, "POST /api/ai/chat rejects empty/whitespace message with HTTP 400");

    // 7.5 Input validation: Missing message rejected with HTTP 400
    const noMsgChat = await makeJsonRequest({
      path: '/api/ai/chat',
      method: 'POST',
      body: { sessionId: 'test-session-2' }
    });
    assert(noMsgChat.statusCode === 400, "POST /api/ai/chat rejects missing message parameter with HTTP 400");

    // 7.6 Error contract: When OPENAI_API_KEY is not configured in test environment
    const unconfiguredChat = await makeJsonRequest({
      path: '/api/ai/chat',
      method: 'POST',
      body: { message: 'What should I do next?', sessionId: 'test-session-3' }
    });
    if (!process.env.OPENAI_API_KEY) {
      assert(unconfiguredChat.statusCode === 503, "POST /api/ai/chat returns HTTP 503 when OPENAI_API_KEY is unset");
      assert(unconfiguredChat.data?.code === 'AI_PROVIDER_CONFIGURATION_MISSING', "POST /api/ai/chat returns AI_PROVIDER_CONFIGURATION_MISSING code");
      assert(!JSON.stringify(unconfiguredChat.data).includes('sk-'), "POST /api/ai/chat response never exposes secret API keys");
    }

    // 7.7 Route alias: /api/assistant/chat parity
    const assistantAliasChat = await makeJsonRequest({
      path: '/api/assistant/chat',
      method: 'POST',
      body: { message: 'What should I do next?', sessionId: 'test-session-4' }
    });
    if (!process.env.OPENAI_API_KEY) {
      assert(assistantAliasChat.statusCode === 503, "POST /api/assistant/chat returns HTTP 503 when unconfigured");
      assert(assistantAliasChat.data?.code === 'AI_PROVIDER_CONFIGURATION_MISSING', "POST /api/assistant/chat returns AI_PROVIDER_CONFIGURATION_MISSING");
    }

    // 7.8 Config endpoint backwards compatibility
    const aiConfig = await makeJsonRequest({ path: '/api/ai/config' });
    assert(aiConfig.statusCode === 200, "GET /api/ai/config returns HTTP 200");
    assert(typeof aiConfig.data?.aiConfigured === 'boolean', "GET /api/ai/config returns aiConfigured boolean");

    server.close(() => {
      console.log("\n=======================================================");
      console.log(`🏁 INTEGRATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
      if (failed === 0) {
        console.log("🎉 ALL INTEGRATION AND DAG TESTS PASSED WITH 100% ACCURACY!");
      } else {
        console.error("⚠️ FAILED TESTS DETECTED");
        process.exit(1);
      }
      console.log("=======================================================\n");
    });
  } catch (err) {
    server.close();
    console.error("Test execution error:", err);
    process.exit(1);
  }
});
