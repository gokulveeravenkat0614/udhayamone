import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Send, Sparkles, X, Loader2, RotateCcw } from 'lucide-react';
import { assistantApi, buildApiUrl } from '../services/api';
import { getRequirements } from '../data/requirementsData';
import { SCHEMES_DATA } from '../data/schemesData';
import { useTranslation } from '../i18n/LanguageContext';

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

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: "Hi! I’m UdyamOne AI. I can answer any question about starting a business, licenses, Udyam registration, pollution categories, taxes, government schemes, and more. How can I help you today?"
};

const starterQuestions = [
  'What is Udyam registration?',
  'What documents do I need?',
  'What is GST?',
  'Explain pollution categories',
  'Which government schemes can help me?',
  'What should I do first?'
];

function formatInline(text) {
  if (typeof text !== 'string') return text;
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} className="font-semibold text-inherit">{match[1]}</strong>);
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}

function FormattedMessage({ content, isUser }) {
  if (isUser) {
    return <span>{content}</span>;
  }

  const lines = String(content || '').split('\n');
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }
        if (/^[-*•]\s+/.test(trimmed)) {
          const itemText = trimmed.replace(/^[-*•]\s+/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-brand-600 font-bold select-none">•</span>
              <span className="flex-1">{formatInline(itemText)}</span>
            </div>
          );
        }
        const numMatch = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-semibold text-brand-700 min-w-[1.2rem] select-none">{numMatch[1]}.</span>
              <span className="flex-1">{formatInline(numMatch[2])}</span>
            </div>
          );
        }
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headerText = trimmed.replace(/^#{1,4}\s+/, '');
          return (
            <div key={idx} className="font-bold text-slate-900 pt-1 text-sm">
              {formatInline(headerText)}
            </div>
          );
        }
        return (
          <p key={idx} className="text-slate-800">
            {formatInline(line)}
          </p>
        );
      })}
    </div>
  );
}

export function AIAssistant({
  currentUser,
  selectedState,
  selectedDistrict,
  selectedIndustry
}) {
  const { t, language } = useTranslation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(() => [{
    role: 'assistant',
    content: t('ai.initialMessage', INITIAL_MESSAGE.content)
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [aiConfigured, setAiConfigured] = useState(null);
  const bottomRef = useRef(null);
  const isSendingRef = useRef(false);
  const [sessionId, setSessionId] = useState(() => getSessionId());

  // Dynamically update greeting if user switches language and has not yet started chatting
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{
          role: 'assistant',
          content: t('ai.initialMessage', INITIAL_MESSAGE.content)
        }];
      }
      return prev;
    });
  }, [language, t]);

  function handleNewConversation() {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('udyamone_ai_session_id', newId);
    setSessionId(newId);
    setMessages([{
      role: 'assistant',
      content: t('ai.initialMessage', INITIAL_MESSAGE.content)
    }]);
    setError('');
    setLastFailedMessage(null);
    isSendingRef.current = false;
  }

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

    assistantApi.health()
      .then(res => {
        if (!cancelled && res && typeof res.aiConfigured === 'boolean') {
          setAiConfigured(res.aiConfigured);
        }
      })
      .catch(() => {
        assistantApi.config()
          .then(cfg => {
            if (!cancelled && cfg && typeof cfg.aiConfigured === 'boolean') {
              setAiConfigured(cfg.aiConfigured);
            }
          })
          .catch(() => {});
      });

    return () => { cancelled = true; };
  }, [open]);

  useEffect(() => {
    if (!open || !currentUser) return;

    let cancelled = false;

    assistantApi.history(sessionId)
      .then(data => {
        if (cancelled || !data?.messages?.length) return;
        setMessages(prev => {
          if (prev.length <= 1) {
            return data.messages.map(item => ({
              role: item.role,
              content: item.content
            }));
          }
          return prev;
        });
      })
      .catch(() => {
        // Chat history is optional; the assistant still works if it cannot be loaded.
      });

    return () => { cancelled = true; };
  }, [open, currentUser, sessionId]);

  async function sendMessage(messageOverride = null, isRetry = false) {
    const message = String(messageOverride ?? input).trim();
    if (!message || loading || isSendingRef.current) return;
    isSendingRef.current = true;

    // Safe debugging logs per MVP specification (never logs secret keys)
    console.log("AI API URL:", buildApiUrl('/ai/chat'));
    console.log("AI request started");

    let nextMessages = messages;
    setMessages(prev => {
      // Prevent duplicate bubbles: do not re-add if the last message is already this exact user message
      const last = prev[prev.length - 1];
      if (last && last.role === 'user' && last.content === message) {
        nextMessages = prev;
        return prev;
      }
      nextMessages = [...prev, { role: 'user', content: message }];
      return nextMessages;
    });

    setInput('');
    setError('');
    setLastFailedMessage(null);
    setLoading(true);

    try {
      const data = await assistantApi.chat({
        message,
        sessionId,
        history: nextMessages.slice(-10),
        websiteContext,
        language
      });

      if (data && typeof data.reply === 'string' && data.reply.trim().length > 0) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: data.reply }
        ]);
        setAiConfigured(true);
      } else {
        throw new Error('AI returned an empty response');
      }
    } catch (err) {
      console.error('AI chat error:', err?.message || err);
      setLastFailedMessage(message);
      const status = err.status || err.statusCode || err.response?.status;
      const code = err.response?.data?.code || err.data?.code;

      if (status === 401 || status === 403) {
        setError(t('auth.invalidCredentials', 'Please sign in again.'));
      } else if (status === 404) {
        setError(t('ai.serviceUnavailable', 'AI service endpoint is unavailable.'));
      } else if (status === 429) {
        if (code === 'AI_PROVIDER_QUOTA_EXCEEDED') {
          setAiConfigured(false);
          setError(t('ai.serviceUnavailable', 'AI service is temporarily unavailable.'));
        } else {
          setError(t('ai.serviceUnavailable', 'AI service is busy. Please try again shortly.'));
        }
      } else if (status === 502 || status === 503 || code === 'AI_PROVIDER_CONFIGURATION_MISSING' || code === 'AI_NOT_CONFIGURED') {
        setAiConfigured(false);
        setError(t('ai.serviceUnavailable', 'AI service is temporarily unavailable.'));
      } else if (status === 500) {
        setError(t('ai.serviceUnavailable', 'AI service is temporarily unavailable.'));
      } else if (err.name === 'NetworkError' || status === 0 || (typeof navigator !== 'undefined' && !navigator.onLine) || String(err.message || '').toLowerCase().includes('network') || String(err.message || '').toLowerCase().includes('failed to fetch')) {
        setError(t('ai.serviceUnavailable', 'Unable to connect to application service.'));
      } else {
        setError(t('ai.serviceUnavailable', 'AI service is temporarily unavailable.'));
      }
    } finally {
      setLoading(false);
      isSendingRef.current = false;
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!loading && !isSendingRef.current) {
        sendMessage();
      }
    }
  }

  const dynamicStarterQuestions = [
    t('ai.starterQ1', 'What is Udyam registration?'),
    t('ai.starterQ2', 'What documents do I need?'),
    t('ai.starterQ3', 'What is GST?'),
    t('ai.starterQ4', 'Explain pollution categories'),
    t('ai.starterQ5', 'Which government schemes can help me?'),
    t('ai.starterQ6', 'What should I do first?')
  ];

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
                <div className="font-bold">{t('ai.chatTitle', 'UdyamOne AI')}</div>
                <div className="text-xs text-blue-100 flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${aiConfigured === false ? 'bg-amber-300' : 'bg-emerald-300'}`} />
                  {aiConfigured === false ? t('ai.serviceUnavailable', 'Service unavailable') : t('ai.serviceReady', 'Service ready')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewConversation}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition flex items-center gap-1.5 text-xs font-medium border border-white/15"
                title={t('ai.newChat', 'Start new conversation')}
                aria-label={t('ai.newChat', 'Start new conversation')}
              >
                <RotateCcw size={13} />
                <span className="hidden sm:inline">{t('ai.newChat', 'New Chat')}</span>
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10"
                aria-label={t('common.close', 'Close')}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600">
            {currentUser
              ? <>{t('ai.signedIn', 'Signed in as {name}. I can also read your latest verification status.', { name: currentUser.name })}</>
              : <>{t('ai.signInNotice', 'Sign in to let me answer questions using your saved verification status.')}</>}
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-white">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm ${
                  message.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-md whitespace-pre-wrap'
                    : 'bg-slate-100 text-slate-800 rounded-bl-md'
                }`}>
                  <FormattedMessage content={message.content} isUser={message.role === 'user'} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-slate-600 flex items-center gap-2 text-sm shadow-sm">
                  <Loader2 size={16} className="animate-spin text-brand-600" />
                  <span>{t('ai.thinking', 'UdyamOne AI is thinking...')}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <span>{error}</span>
                {lastFailedMessage && (
                  <button
                    type="button"
                    onClick={() => sendMessage(lastFailedMessage, true)}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-sm disabled:opacity-50"
                  >
                    <RotateCcw size={12} />
                    {t('ai.retry', 'Retry')}
                  </button>
                )}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {dynamicStarterQuestions.map(question => (
                <button
                  key={question}
                  type="button"
                  disabled={loading}
                  onClick={() => sendMessage(question)}
                  className="text-xs text-left px-3 py-2 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50 text-slate-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                placeholder={t('ai.placeholder', 'Ask UdyamOne AI...')}
                className="flex-1 resize-none outline-none text-sm text-slate-800 placeholder:text-slate-400 max-h-24"
              />
              <button
                type="button"
                disabled={!input.trim() || loading}
                onClick={() => sendMessage()}
                className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-700 transition"
                aria-label={t('common.submit', 'Send message')}
              >
                <Send size={18} />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles size={11} />
              {t('ai.disclaimer', 'AI answers are guidance; verify important requirements with official authorities.')}
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(value => !value)}
        className="fixed bottom-5 right-4 sm:right-6 z-[71] w-16 h-16 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-600/30 flex items-center justify-center transition-all hover:scale-105"
        aria-label={t('ai.chatTitle', 'Open UdyamOne AI assistant')}
      >
        {open ? <X size={26} /> : <MessageCircle size={28} />}
        {!open && (
          <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${aiConfigured === false ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        )}
      </button>
    </>
  );
}
