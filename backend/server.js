require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { ensureDemoUsers } = require('./controllers/authController');
const { ensureDemoDocumentRecords } = require('./controllers/documentController');

const port = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    await ensureDemoUsers();
    await ensureDemoDocumentRecords();
    console.log('MongoDB connected and demo users verified.');
  } catch (err) {
    // All authentication and verification data is MongoDB-backed. Starting
    // without a connection leaves the service up but makes these routes hang
    // or fail later, so fail fast and let Render report the real configuration
    // error in its deploy logs.
    console.error(`Backend startup failed: ${err.message}`);
    process.exit(1);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`UdyamOne backend running on port ${port}`);
  });
})();
