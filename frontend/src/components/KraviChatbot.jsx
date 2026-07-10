import React, { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import API from '../api/axios';
import kraviAssistantImage from '../images/kravi-ai-assistant.png';
import { format } from 'date-fns';
import { PRIMARY_SUPPORT_TOPIC_LIMIT, supportFaqTopics } from '../data/supportFaqs';

const WELCOME_MESSAGES = {
  hi: " Namaste! Main KRAVI AI Assistant hoon. Main aapki kaise sahayata kar sakta hoon?",
  en: " Hello! I am KRAVI AI Assistant. How can I assist you today?",
  mr: " Namaskar! Mi KRAVI AI Assistant aahe. Mi tumhala kashi madat karu shakto?"
};

const PLACEHOLDER_TEXT = 'Apna sawaal type karein...';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function ChatBubble({ role, text }) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${isUser
            ? 'bg-blue-500 text-white rounded-br-sm shadow-lg shadow-blue-500/20'
            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
          }`}
      >
        {text}
      </div>
    </div>
  );
}

function MessageBubble({ role, text, timestamp }) {
  const formattedTime = timestamp ? format(new Date(timestamp), 'h:mm a') : null;

  return (
    <div className="flex w-full mb-3">
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${role === 'user'
            ? 'ml-auto rounded-br-sm bg-blue-500 text-white shadow-lg shadow-blue-500/20'
            : 'rounded-bl-sm bg-white text-slate-800 border border-slate-200 shadow-sm'
          }`}
      >
        <div>{text}</div>
        {formattedTime && (
          <div className="mt-2 text-[10px] text-slate-400 text-right">{formattedTime}</div>
        )}
      </div>
    </div>
  );
}

function DateDivider({ date }) {
  if (!date) return null;

  return (
    <div className="flex items-center gap-3 py-2 text-xs text-slate-500 uppercase tracking-[0.25em]">
      <span className="h-px flex-1 bg-slate-200" />
      <span>{date}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function TopicButton({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${active
          ? 'bg-blue-500 text-white border-blue-500 shadow'
          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
        }`}
    >
      {label}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-1">
        <span
          className="h-2 w-2 rounded-full bg-slate-400"
          style={{ animation: 'dot-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) infinite', animationDelay: '-0.3s' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-slate-400"
          style={{ animation: 'dot-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) infinite', animationDelay: '-0.15s' }}
        />
        <span
          className="h-2 w-2 rounded-full bg-slate-400"
          style={{ animation: 'dot-pop 0.6s cubic-bezier(0.16, 1, 0.3, 1) infinite' }}
        />
      </div>
    </div>
  );
}

function toApiMessages(messages) {
  let hasSeenUserMessage = false;

  return messages
    .filter((message) => {
      if (message.role === 'user') {
        hasSeenUserMessage = true;
      }

      return hasSeenUserMessage && (message.role === 'user' || message.role === 'assistant');
    })
    .slice(-20)
    .map((message) => ({
      role: message.role,
      content: message.text,
    }));
}

export default function KraviChatbot({ initialLanguage = 'hi' }) {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: WELCOME_MESSAGES[initialLanguage] || WELCOME_MESSAGES.hi,
      timestamp: new Date().toISOString(),
    },
    {
      role: 'assistant',
      text: 'Aap in topics me se choose kar sakte hain ya niche buttons par click karein.',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [showOtherTopics, setShowOtherTopics] = useState(false);
  const [showTopicPanel, setShowTopicPanel] = useState(true);
  const [language, setLanguage] = useState(initialLanguage);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const [position, setPosition] = useState(() => ({
    x: typeof window !== 'undefined' ? Math.max(16, window.innerWidth - 360) : 16,
    y: typeof window !== 'undefined' ? Math.max(16, window.innerHeight - 120) : 16,
  }));

  const [dragging, setDragging] = useState(false);

  const dragOffset = useRef({
    x: 0,
    y: 0,
  });
  const pointerIdRef = useRef(null);
  const headerRef = useRef(null);
  const pointerDownPosRef = useRef(null);
  const potentialToggleRef = useRef(false);
  const togglePointerIdRef = useRef(null);

  const getTitle = (topic) => topic[`title_${language}`] || topic.title;
  const getQuestionText = (q) => q[`question_${language}`] || q.question;
  const getAnswerText = (q) => q[`answer_${language}`] || q.answer;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!dragging) return undefined;

    const handlePointerMove = (event) => {
      const maxX = Math.max(12, window.innerWidth - 380);
      const maxY = Math.max(12, window.innerHeight - 140);

      setPosition({
        x: clamp(event.clientX - dragOffset.current.x, 12, maxX),
        y: clamp(event.clientY - dragOffset.current.y, 12, maxY),
      });
    };

    const handlePointerUp = () => {
      // release pointer capture if we have it
      try {
        if (headerRef.current && pointerIdRef.current != null && headerRef.current.releasePointerCapture) {
          headerRef.current.releasePointerCapture(pointerIdRef.current);
        }
      } catch (err) {
        // ignore
      }

      pointerIdRef.current = null;
      setDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragging]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages = [
      ...messages,
      { role: 'user', text: trimmed, timestamp: new Date().toISOString(), id: Date.now() + Math.random() },
    ];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await API.post('/kravi-chat', {
        messages: toApiMessages(nextMessages),
      });

      const replyText = response.data?.reply;
      if (!replyText) {
        throw new Error('Empty response from chat service');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        { role: 'assistant', text: replyText, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      console.error('KRAVI Bot error:', err);
      setError('Kuch gadbad ho gayi. Please thodi der baad try karein.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTopic = supportFaqTopics.find((topic) => topic.id === selectedTopicId) || null;

  const mainTopics = supportFaqTopics.slice(0, PRIMARY_SUPPORT_TOPIC_LIMIT);
  const otherTopics = supportFaqTopics.slice(PRIMARY_SUPPORT_TOPIC_LIMIT);

  const insertFaqResponse = (question, answer) => {
    const newMessages = [
      ...messages,
      { role: 'user', text: question, timestamp: new Date().toISOString() },
      { role: 'assistant', text: answer, timestamp: new Date().toISOString() },
    ];
    setMessages(newMessages);
    setSelectedTopicId(null);
    setShowOtherTopics(false);
    setShowTopicPanel(false);
  };

  const handleTopicClick = (topicId) => {
    setSelectedTopicId(topicId);
  };

  const handleOtherClick = () => {
    setSelectedTopicId(null);
    setShowOtherTopics(true);
  };

  const handleBackToTopics = () => {
    setSelectedTopicId(null);
    setShowOtherTopics(false);
  };

  const chatDate = messages[0]?.timestamp
    ? format(new Date(messages[0].timestamp), 'EEEE, MMM d')
    : null;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    // don't start drag when user clicks interactive elements inside header
    try {
      const el = event.target && event.target.closest && event.target.closest('button, a, input, textarea, select');
      if (el) return;
    } catch (err) {
      // ignore
    }

    event.preventDefault();
    setDragging(true);

    dragOffset.current = {
      x: event.clientX - position.x,
      y: event.clientY - position.y,
    };
    // capture pointer for stable dragging across iframes/fast moves
    try {
      pointerIdRef.current = event.pointerId;
      if (headerRef.current && headerRef.current.setPointerCapture) {
        headerRef.current.setPointerCapture(event.pointerId);
      }
    } catch (err) {
      // ignore if not supported
    }
  };

  // Toggle button: support click (toggle) and drag (move) using a small movement threshold
  const handleTogglePointerDown = (event) => {
    if (event.button !== 0) return;

    // record start position and enable potential drag
    pointerDownPosRef.current = { x: event.clientX, y: event.clientY };
    potentialToggleRef.current = true;
    togglePointerIdRef.current = event.pointerId;

    const target = event.currentTarget;
    try {
      if (target && target.setPointerCapture) target.setPointerCapture(event.pointerId);
    } catch (err) {
      // ignore
    }

    const onMove = (ev) => {
      if (!pointerDownPosRef.current) return;
      const dx = ev.clientX - pointerDownPosRef.current.x;
      const dy = ev.clientY - pointerDownPosRef.current.y;
      const dist = Math.hypot(dx, dy);
      const threshold = 8;

      if (dist > threshold) {
        // begin dragging
        potentialToggleRef.current = false;
        setDragging(true);
        dragOffset.current = {
          x: ev.clientX - position.x,
          y: ev.clientY - position.y,
        };
        // update position immediately
        const maxX = Math.max(12, window.innerWidth - 380);
        const maxY = Math.max(12, window.innerHeight - 140);
        setPosition({
          x: clamp(ev.clientX - dragOffset.current.x, 12, maxX),
          y: clamp(ev.clientY - dragOffset.current.y, 12, maxY),
        });
      } else if (dragging) {
        const maxX = Math.max(12, window.innerWidth - 380);
        const maxY = Math.max(12, window.innerHeight - 140);
        setPosition({
          x: clamp(ev.clientX - dragOffset.current.x, 12, maxX),
          y: clamp(ev.clientY - dragOffset.current.y, 12, maxY),
        });
      }
    };

    const onUp = (ev) => {
      try {
        if (target && togglePointerIdRef.current != null && target.releasePointerCapture) {
          target.releasePointerCapture(togglePointerIdRef.current);
        }
      } catch (err) {
        // ignore
      }

      // if we never started dragging, treat as a click (toggle)
      if (!dragging && potentialToggleRef.current) {
        setIsOpen((v) => !v);
      }

      potentialToggleRef.current = false;
      pointerDownPosRef.current = null;
      togglePointerIdRef.current = null;
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      className="fixed z-50 flex flex-col items-end font-sans select-none"
      style={{
        left: position.x,
        top: position.y,
        touchAction: 'none',
      }}
    >      {isOpen && (
      <div className="mb-3 w-[360px] max-w-[92vw] h-[520px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div
          ref={headerRef}
          onPointerDown={handlePointerDown}
          className="bg-white text-slate-900 px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-200 cursor-move"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 p-2 overflow-hidden shadow-sm">
              <img
                src={kraviAssistantImage}
                alt="KRAVI AI Assistant"
                className="h-full w-full rounded-full object-cover object-top"
              />
            </div>
            <div>
              <p className="font-semibold text-sm leading-tight text-slate-900">KRAVI Bot</p>
              <p className="text-[11px] text-slate-500 leading-tight">
                24/7 Support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-md text-sm px-2 py-1 bg-slate-100 text-slate-900"
              aria-label="Select language"
            >
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
              <option value="mr">मराठी</option>
            </select>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full p-1.5 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
          <DateDivider date={chatDate} />
          {messages.map((message, index) => (
            <MessageBubble
              key={`${message.role}-${index}`}
              role={message.role}
              text={message.text}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && <TypingIndicator />}
          {error && (
            <div className="text-center text-xs text-red-500 mt-1 mb-2">
              {error}
            </div>
          )}
        </div>

        {showTopicPanel && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 shrink-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {selectedTopic ? (
                <span className="text-sm font-semibold text-slate-800">{getTitle(selectedTopic)}</span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-slate-800">Choose a topic</span>
                  <span className="text-xs text-slate-500">Tap a category to see subquestions</span>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedTopic
                ? selectedTopic.questions.map((item) => (
                  <TopicButton
                    key={getQuestionText(item)}
                    label={getQuestionText(item)}
                    onClick={() => insertFaqResponse(getQuestionText(item), getAnswerText(item))}
                  />
                ))
                : (showOtherTopics ? otherTopics : mainTopics).map((topic) => (
                  <TopicButton
                    key={topic.id}
                    label={getTitle(topic)}
                    onClick={() => handleTopicClick(topic.id)}
                    active={selectedTopicId === topic.id}
                  />
                ))}
              {!selectedTopic && !showOtherTopics && (
                <TopicButton label="Other" onClick={handleOtherClick} />
              )}
            </div>
          </div>
        )}

        <div className="border-t border-slate-200 bg-white px-3 py-3 shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={PLACEHOLDER_TEXT}
              rows={1}
              aria-label="Type your message"
              className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl p-2.5 transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            Hindi | English | Marathi mein poochein
          </p>
        </div>
      </div>
    )}

      <button
        type="button"
        onClick={() => setIsOpen((currentValue) => !currentValue)}
        className="w-16 h-16 rounded-full bg-blue-600 shadow-xl border border-blue-700 p-0.5 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform overflow-hidden"
        aria-label="Toggle KRAVI chat"
      >
        {isOpen ? (
          <span className="w-full h-full rounded-full bg-gradient-to-br from-[#0b1a4a] to-[#1b5cff] flex items-center justify-center">
            <X size={24} />
          </span>
        ) : (
          <img
            src={kraviAssistantImage}
            alt="Open KRAVI chat"
            className="h-full w-full rounded-full object-cover object-top"
          />
        )}
      </button>
    </div>
  );
}
