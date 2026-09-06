# UdyamOne AI Assistant — MVP Integration Pack

This is a drop-in MVP for the existing UdyamOne React + Express + MongoDB project.

## MVP features
- Floating UdyamOne AI chat button
- OpenAI-powered answers
- Uses selected State / District / Industry from the website
- Uses existing requirements and schemes data
- Optional logged-in user context from MongoDB
- Saves signed-in chat history in MongoDB

## 1. Copy these files

Copy the files in this ZIP into the matching folders of your existing project:

- `src/components/AIAssistant.jsx`
- `backend/models/ChatMessage.js`
- `backend/middleware/optionalAuthMiddleware.js`
- `backend/controllers/assistantController.js`
- `backend/routes/assistantRoutes.js`

## 2. Install backend dependency

From the `backend` folder:

```bash
npm install openai
```

## 3. Frontend dependency

From the project root:

```bash
npm install lucide-react
```

If it is already installed, do nothing.

## 4. Add route to backend/app.js

Add:

```js
const assistantRoutes = require('./routes/assistantRoutes');
```

Then add:

```js
app.use('/api/assistant', assistantRoutes);
```

Place it with the other `/api/...` routes.

## 5. Add API methods to src/services/api.js

Add:

```js
export const assistantApi = {
  chat: ({ message, sessionId, history, websiteContext }) =>
    request('/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, sessionId, history, websiteContext })
    }),
  history: (sessionId) =>
    request(`/assistant/history?sessionId=${encodeURIComponent(sessionId)}`)
};
```

## 6. Add the assistant to src/App.jsx

Add import:

```js
import { AIAssistant } from './components/AIAssistant';
```

Before the closing `</div>` of the main App return, add:

```jsx
<AIAssistant
  currentUser={currentUser}
  selectedState={selectedState}
  selectedDistrict={selectedDistrict}
  selectedIndustry={selectedIndustry}
/>
```

## 7. Render environment variables

On the Render backend service, add:

```env
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-4.1-mini
```

Keep the key only in Render Environment Variables. Do not put it in React/Vite or GitHub.

Your existing `MONGO_URI` and `JWT_SECRET` must also remain configured.

## 8. Deploy

Commit/push the changes to GitHub. Render should redeploy the backend/frontend according to your existing service setup.

## MVP demo flow

1. Open UdyamOne.
2. Click the floating chat button.
3. Ask: `What documents do I need for my business?`
4. Ask: `Which government schemes may help me?`
5. Log in and ask: `What is my identity verification status?`

### Important
This MVP does not claim to be a government officer or official government portal. Important legal/official requirements should be verified against the linked government authority.
