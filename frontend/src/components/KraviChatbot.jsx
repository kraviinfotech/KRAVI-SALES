import React, { useEffect, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import API from '../api/axios';
import kraviAssistantImage from '../images/kravi-ai-assistant.png';

const WELCOME_MESSAGES = {
  hi: 'Welcome to kravi sales Person tracker AI',
  en: 'Welcome to kravi sales Person tracker AI',
  mr: 'Welcome to kravi sales Person tracker AI',
};

const PLACEHOLDER_TEXT = '';

function getInitialMessages(language) {
  return [
    { role: 'assistant', text: WELCOME_MESSAGES[language] || WELCOME_MESSAGES.hi },
  ];
}

function ChatBubble({ role, text }) {
  const isUser = role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="mr-2 mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-blue-100 bg-white p-0.5 shadow-sm">
          <img
            src={kraviAssistantImage}
            alt="KRAVI Bot"
            className="h-full w-full rounded-full object-cover object-top"
          />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm shadow-sm'
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm px-4 py-3 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => getInitialMessages(initialLanguage));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const resetChat = () => {
    setMessages(getInitialMessages(initialLanguage));
    setInput('');
    setError(null);
    setIsLoading(false);
  };

  const closeChat = () => {
    resetChat();
    setIsOpen(false);
  };

  const toggleChat = () => {
    if (isOpen) {
      closeChat();
      return;
    }

    resetChat();
    setIsOpen(true);
  };

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

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages = [...messages, { role: 'user', text: trimmed }];
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
        { role: 'assistant', text: replyText },
      ]);
    } catch (err) {
      console.error('KRAVI Bot error:', err);
      setError('Kuch gadbad ho gayi. Please thodi der baad try karein.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans">
      {isOpen && (
        <div className="mb-3 w-[360px] max-w-[92vw] h-[520px] max-h-[75vh] bg-slate-50 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-[#0b1a4a] to-[#1b3fd6] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-white p-0.5 overflow-hidden shadow-sm">
                <img
                  src={kraviAssistantImage}
                  alt="KRAVI AI Assistant"
                  className="h-full w-full rounded-full object-cover object-top"
                />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">KRAVI Bot</p>
                <p className="text-[11px] text-cyan-200 leading-tight">
                  24/7 Support - Always Ready
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
            <div className="mb-4 flex justify-center">
              <div className="w-28 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
                <img
                  src={kraviAssistantImage}
                  alt="KRAVI AI Assistant 24/7 Support"
                  className="h-auto w-full"
                />
              </div>
            </div>
            {messages.map((message, index) => (
              <ChatBubble key={`${message.role}-${index}`} role={message.role} text={message.text} />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="text-center text-xs text-red-500 mt-1 mb-2">
                {error}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 bg-white px-3 py-3 shrink-0">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDER_TEXT}
                rows={1}
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
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={toggleChat}
        className="w-16 h-16 rounded-full bg-white shadow-lg border border-blue-100 p-0.5 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform overflow-hidden"
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
