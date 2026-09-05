# UdyamOne Backend

## Setup
1. Copy `.env.example` to `.env`.
2. Make sure MongoDB is running.
3. `npm install`
4. `npm run dev`

Demo accounts:
- Applicant: `demo@udyamone.test` / `Demo@123`
- Admin: `admin@udyamone.test` / `Admin@123`

The backend accepts identity documents and a selfie at `POST /api/verification/submit` and calls the Python AI service. If the AI service is not running, it falls back to an explicitly marked demo verification so the hackathon UI remains demonstrable.
