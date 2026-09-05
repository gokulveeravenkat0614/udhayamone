# UdyamOne Backend

## Setup
1. Copy `.env.example` to `.env`.
2. Make sure MongoDB is running locally, or set `MONGODB_URI` to a MongoDB Atlas connection string.
3. `npm install`
4. `npm run dev`

## Deploying to Render

Render does not provide a MongoDB instance at `127.0.0.1:27017`. Create a MongoDB Atlas database, allow Render to reach it (or temporarily allow `0.0.0.0/0` while testing), then create a Render Web Service with this backend directory as its root directory.

Set these Render environment variables:

- `NODE_ENV=production`
- `MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority`
- `JWT_SECRET` to a long, random value
- `AI_SERVICE_URL` only if the Python AI service is deployed separately

Use build command `npm ci` and start command `npm start`. Do not set `MONGO_URI` or `MONGODB_URI` to `localhost` or `127.0.0.1` on Render. `PORT` is supplied by Render automatically.

Demo accounts:
- Applicant: `demo@udyamone.test` / `Demo@123`
- Admin: `admin@udyamone.test` / `Admin@123`

The backend accepts identity documents and a selfie at `POST /api/verification/submit` and calls the Python AI service. If the AI service is not running, it falls back to an explicitly marked demo verification so the hackathon UI remains demonstrable.
