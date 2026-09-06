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
