# UdyamOne — AI Identity Verification Prototype

This version adds a full-stack identity-verification prototype to the existing UdyamOne React app.

## Architecture
- React/Vite frontend: camera capture, verification workflow, user/admin UI
- Node/Express backend: JWT auth, uploads, MongoDB persistence, audit records
- Python/FastAPI AI service: OCR + DeepFace face verification
- MongoDB: users, synthetic identity reference records, verification attempts, login history

## 1. Frontend
From `UdyamOne/`:
```bash
npm install
npm run dev
```
Optional `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## 2. Backend
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```
On PowerShell, if `copy` behaves differently:
```powershell
Copy-Item .env.example .env
```
Make sure MongoDB is running and `.env` contains:
`MONGO_URI=mongodb://127.0.0.1:27017/udyamone`

Demo accounts are seeded automatically:
- Applicant: `demo@udyamone.test` / `Demo@123`
- Admin: `admin@udyamone.test` / `Admin@123`

## 3. AI service
Requires Python 3.11+ and Tesseract OCR installed on the machine.
```bash
cd ai-service
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The Node backend explicitly falls back to **demo verification** if the AI service is unavailable. The UI labels that mode; this is only for a hackathon demo and is not a real identity authority.

## Demo flow
1. Login as Applicant.
2. Open **My Applications → Verify Identity**.
3. Capture a synthetic/demo identity document with the rear camera.
4. Capture a live selfie with the front camera.
5. Run AI verification.
6. Login as Admin and open **Admin Dashboard** to see verification records and statistics.

## Important
Do not use real Aadhaar/PAN or other sensitive identity documents in this hackathon prototype. Use synthetic test data.
