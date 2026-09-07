import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X, Loader2 } from 'lucide-react';
import { assistantApi } from '../services/api';
import { getRequirements } from '../data/requirementsData';
import { SCHEMES_DATA } from '../data/schemesData';

function getSessionId() {
  const key = 'udyamone_ai_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

const starterQuestions = [
  'What documents do I need for my business?',
  'What is my identity verification status?',
  'Which government schemes may help my business?',
  'What should I do next?'
];

export function AIAssistant({
  currentUser,
  selectedState,
  selectedDistrict,
  selectedIndustry
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I’m UdyamOne AI. I can help with business approvals, documents, schemes, compliance, and your identity-verification status.'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiConfigured, setAiConfigured] = useState(null);
  const bottomRef = useRef(null);
  const sessionId = useMemo(() => getSessionId(), []);

  const websiteContext = useMemo(() => {
    const requirementData = getRequirements(
      selectedState,
      selectedDistrict,
      selectedIndustry
    );

    return {
      selectedState,
      selectedDistrict,
      selectedIndustry,
      requirements: (requirementData.approvals || []).map(item => ({
        name: item.name,
        category: item.category,
        authority: item.authority || item.department,
        applicability: item.applicability,
        requiredDocs: item.requiredDocs,
        officialSource: item.officialSource,
        sourceUrl: item.sourceUrl
      })),
      schemes: SCHEMES_DATA.map(item => ({
        name: item.name,
        department: item.department,
        purpose: item.purpose,
        eligibility: item.eligibility,
        officialLink: item.officialLink
      }))
    };
  }, [selectedState, selectedDistrict, selectedIndustry]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    assistantApi.config()
      .then(cfg => {
        if (!cancelled && cfg && typeof cfg.aiConfigured === 'boolean') {
          setAiConfigured(cfg.aiConfigured);
        }
      })
      .catch(() => {
        // Chat service availability will be verified on send
      });

    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open || !currentUser) return;

    let cancelled = false;

    assistantApi.history(sessionId)
      .then(data => {
        if (cancelled || !data?.messages?.length) return;
        setMessages(data.messages.map(item => ({
          role: item.role,
          content: item.content
        })));
      })
      .catch(() => {
        // Chat history is optional; the assistant still works if it cannot be loaded.
      });

    return () => { cancelled = true; };
  }, [open, currentUser, sessionId]);

  async function sendMessage(messageOverride = null) {
    const message = String(messageOverride ?? input).trim();
    if (!message || loading) return;

    const nextMessages = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const data = await assistantApi.chat({
        message,
        sessionId,
        history: nextMessages.slice(-10),
        websiteContext
      });

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.reply }
      ]);
      setAiConfigured(true);
    } catch (err) {
      if (err.status === 503 || err.response?.data?.code === 'AI_NOT_CONFIGURED') {
        setAiConfigured(false);
        setError('AI assistant is temporarily unavailable. Please try again later.');
      } else if (err.status === 401) {
        setError('Please sign in to use UdyamOne AI.');
      } else if (err.status === 429) {
        setError('AI service is temporarily busy. Please try again in a moment.');
      } else if (err.status === 0 || err.name === 'NetworkError') {
        setError('Unable to connect to application service. Please check your network connection.');
      } else {
        const rawMsg = String(err.message || '');
        if (rawMsg.toLowerCase().includes('.env') || rawMsg.toLowerCase().includes('openai')) {
          setError('AI assistant is temporarily unavailable. Please try again later.');
        } else {
          setError(rawMsg || 'Unable to reach UdyamOne AI.');
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-[70] w-[calc(100vw-2rem)] sm:w-[390px] max-h-[min(680px,calc(100vh-7rem))] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-brand-950 via-brand-800 to-brand-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center">
                <Bot size={22} />
              </div>
              <div>
                <div className="font-bold">UdyamOne AI</div>
                <div className="text-xs text-blue-100 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${aiConfigured === false ? 'bg-amber-300' : 'bg-emerald-300'}`} />
                  {aiConfigured === false ? 'Service unavailable' : 'AI business assistant'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl hover:bg-white/10"
              aria-label="Close UdyamOne AI"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
            {currentUser
              ? <>Signed in as <span className="font-semibold text-slate-800">{currentUser.name}</span>. I can also read your latest verification status.</>
              : <>Sign in to let me answer questions using your saved verification status.</>}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-6 ${
                  message.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-slate-500 flex items-center gap-2 text-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Thinking...
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {starterQuestions.map(question => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="text-xs text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50 text-slate-700 transition"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-slate-200 p-3 bg-white">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100 px-3 py-2">
              <textarea
                value={input}
                onChange={event => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={2000}
                placeholder="Ask UdyamOne AI..."
                className="flex-1 resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 max-h-24"
              />
              <button
                type="button"
                disabled={!input.trim() || loading}
                onClick={() => sendMessage()}
                className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles size={11} />
              AI answers are guidance; verify important requirements with official authorities.
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="fixed bottom-5 right-4 sm:right-6 z-[71] w-16 h-16 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/30 flex items-center justify-center transition-all hover:scale-105"
        aria-label="Open UdyamOne AI assistant"
      >
        {open ? <X size={26} /> : <MessageCircle size={28} />}
        {!open && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${aiConfigured === false ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        )}
      </button>
    </>
  );
}
