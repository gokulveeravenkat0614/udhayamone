require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { ensureDemoUsers } = require('./controllers/authController');
const port = process.env.PORT || 5000;

(async()=>{
  try {
    await connectDB();
    await ensureDemoUsers();
    app.listen(port,()=>console.log(`UdyamOne backend running on http://localhost:${port}`));
  } catch (err) {
    console.error('Backend startup failed:', err.message);
    process.exit(1);
  }
})();
