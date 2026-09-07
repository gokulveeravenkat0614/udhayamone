const OpenAI = require('openai');
const User = require('../models/User');
const Verification = require('../models/Verification');
const ChatMessage = require('../models/ChatMessage');

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  try {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.error('Failed to initialize OpenAI client:', err.message);
    return null;
  }
};

const SYSTEM_PROMPT = `
You are UdyamOne AI, the website's business and identity-verification assistant for Indian entrepreneurs.

Your responsibilities:
- Explain UdyamOne features, business approval requirements, government schemes, compliance concepts, and identity-verification status in simple language.
- Use the UdyamOne website context supplied with each request when it is relevant.
- If personalized verification context is supplied, use it to answer status questions.
- Never claim to be a government officer or government portal.
- Never invent an approval, fee, deadline, eligibility rule, legal requirement, or verification result.
- Government rules can change. When a question requires an official/legal determination, recommend checking the linked official authority/source.
- Do not expose passwords, JWTs, API keys, document file paths, raw identity-document contents, or other secrets.
- Do not infer sensitive identity information that is not explicitly provided in the context.
- Keep responses concise, practical, and easy for an Indian entrepreneur to understand.
- If the user asks something outside UdyamOne, answer briefly if possible and bring the conversation back to the business-assistance use case.
`;

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .slice(-10)
    .filter(item => item && ['user', 'assistant'].includes(item.role))
    .map(item => ({
      role: item.role,
      content: String(item.content || '').slice(0, 3000)
    }));
}

function buildWebsiteContext(body = {}) {
  const context = body.websiteContext || {};

  const requirements = Array.isArray(context.requirements)
    ? context.requirements.slice(0, 12).map(item => ({
        name: item.name,
        category: item.category,
        authority: item.authority || item.department,
        applicability: item.applicability,
        requiredDocs: Array.isArray(item.requiredDocs) ? item.requiredDocs.slice(0, 8) : [],
        officialSource: item.officialSource,
        sourceUrl: item.sourceUrl
      }))
    : [];

  const schemes = Array.isArray(context.schemes)
    ? context.schemes.slice(0, 10).map(item => ({
        name: item.name,
        department: item.department,
        purpose: item.purpose,
        eligibility: item.eligibility,
        officialLink: item.officialLink
      }))
    : [];

  return {
    selectedBusiness: {
      state: context.selectedState || 'Not selected',
      district: context.selectedDistrict || 'Not selected',
      industry: context.selectedIndustry || 'Not selected'
    },
    requirements,
    schemes
  };
}

async function getPersonalContext(userId) {
  if (!userId) return null;

  const [user, verification] = await Promise.all([
    User.findById(userId).select('name email role verificationStatus').lean(),
    Verification.findOne({ userId }).sort({ createdAt: -1 }).select('status confidenceScore failureReason createdAt verifiedAt documentMatch dataMatch faceMatch').lean()
  ]);

  if (!user) return null;

  return {
    userName: user.name,
    verificationStatus: user.verificationStatus,
    latestVerification: verification ? {
      status: verification.status,
      confidenceScore: verification.confidenceScore,
      failureReason: verification.failureReason,
      documentMatch: verification.documentMatch,
      dataMatch: verification.dataMatch,
      faceMatch: verification.faceMatch,
      createdAt: verification.createdAt,
      verifiedAt: verification.verifiedAt
    } : null
  };
}

function config(req, res) {
  return res.json({
    success: true,
    aiConfigured: Boolean(process.env.OPENAI_API_KEY)
  });
}

async function chat(req, res) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return res.status(503).json({
        success: false,
        code: 'AI_NOT_CONFIGURED',
        message: 'AI assistant is temporarily unavailable.'
      });
    }

    const client = getOpenAIClient();
    if (!client) {
      console.error('Failed to initialize OpenAI client');
      return res.status(503).json({
        success: false,
        code: 'AI_UNAVAILABLE',
        message: 'AI assistant is temporarily unavailable.'
      });
    }

    const message = String(req.body?.message || '').trim();
    const sessionId = String(req.body?.sessionId || '').trim();

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message is too long. Keep it under 2000 characters.' });
    }

    if (!sessionId || sessionId.length > 100) {
      return res.status(400).json({ success: false, message: 'A valid chat session is required' });
    }

    const history = cleanHistory(req.body?.history);
    const websiteContext = buildWebsiteContext(req.body);
    const personalContext = await getPersonalContext(req.user?.id);

    const contextMessage = `
UdyamOne website context (reference data, not a government determination):
${JSON.stringify(websiteContext, null, 2)}

Personalized MongoDB context for the signed-in user (may be null for visitors):
${JSON.stringify(personalContext, null, 2)}
`;

    let reply = '';
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    if (client.chat && client.chat.completions) {
      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: `${SYSTEM_PROMPT}\n\n${contextMessage}` },
          ...history,
          { role: 'user', content: message }
        ],
        max_tokens: 500
      });
      reply = (completion.choices?.[0]?.message?.content || '').trim();
    } else if (client.responses && client.responses.create) {
      const response = await client.responses.create({
        model,
        input: [
          { role: 'developer', content: `${SYSTEM_PROMPT}\n\n${contextMessage}` },
          ...history,
          { role: 'user', content: message }
        ],
        max_output_tokens: 500
      });
      reply = (response.output_text || '').trim();
    }

    if (!reply) {
      throw new Error('The AI returned an empty response');
    }

    await ChatMessage.create([
      {
        userId: req.user?.id || null,
        sessionId,
        role: 'user',
        content: message
      },
      {
        userId: req.user?.id || null,
        sessionId,
        role: 'assistant',
        content: reply
      }
    ]);

    return res.json({
      success: true,
      reply,
      personalized: Boolean(req.user?.id)
    });
  } catch (error) {
    console.error('UdyamOne AI error:', error.message || error);

    if (error.status === 429 || error.statusCode === 429 || error.code === 'rate_limit_exceeded') {
      return res.status(429).json({
        success: false,
        message: 'AI service is temporarily busy. Please try again.'
      });
    }

    if (error.status === 401 || error.statusCode === 401) {
      return res.status(503).json({
        success: false,
        message: 'AI service is temporarily unavailable.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'AI service is temporarily unavailable.'
    });
  }
}

async function history(req, res) {
  try {
    const messages = await ChatMessage.find({
      userId: req.user.id,
      sessionId: String(req.query.sessionId || '')
    })
      .sort({ createdAt: 1 })
      .limit(50)
      .select('role content createdAt')
      .lean();

    res.json({ success: true, messages });
  } catch (error) {
    console.error('AI history error:', error);
    res.status(500).json({ success: false, message: 'Unable to load chat history' });
  }
}

module.exports = { chat, history, config };

