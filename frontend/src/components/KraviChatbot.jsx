import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Send, X } from 'lucide-react';
import API from '../api/axios';
import { PRIMARY_SUPPORT_TOPIC_LIMIT, supportFaqTopics } from '../data/supportFaqs';
import {
  LANGUAGE_OPTIONS,
  getChatbotCopy,
  getLocalizedAnswer,
  getLocalizedQuestion,
  getLocalizedTopicTitle,
  getSupportedLanguage,
} from '../data/supportFaqTranslations';
import kraviAssistantImage from '../images/kravi-ai-assistant.png';

const DRAG_MARGIN = 12;
const DRAG_CLICK_THRESHOLD = 4;
const AI_TYPING_DELAY_MS = 700;

function clamp(value, min, max) {
  if (max < min) {
    return value;
  }

  return Math.min(Math.max(value, min), max);
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function formatDateLabel(date = new Date()) {
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

function formatTimeLabel(date = new Date()) {
  return date
    .toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
    .toLowerCase();
}

function createMessage(role, text) {
  return {
    role,
    text,
    timestamp: formatTimeLabel(),
  };
}

function getInitialMessages(language) {
  const welcomeMessages = getChatbotCopy(language).welcome;
  const timestamp = formatTimeLabel();

  return welcomeMessages.map((text) => ({
    role: 'assistant',
    text,
    timestamp,
  }));
}

function DateDivider() {
  return (
    <div className="my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">
      <span className="h-px flex-1 bg-slate-200" />
      <span>{formatDateLabel()}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function ChatBubble({ role, text, timestamp }) {
  const isUser = role === 'user';

  return (
    <div className={`mb-3 flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="mr-2 mt-1 h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white p-0.5 shadow-sm">
          <img
            src={kraviAssistantImage}
            alt="KRAVI Bot"
            className="h-full w-full rounded-full object-cover object-top"
          />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
          isUser
            ? 'rounded-br-sm bg-[#6d28d9] text-white'
            : 'rounded-bl-sm border border-slate-200 bg-white text-slate-800'
        }`}
      >
        <div>{text}</div>
        {timestamp && (
          <div className={`mt-1 text-right text-[10px] ${isUser ? 'text-white/70' : 'text-slate-400'}`}>
            {timestamp}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mb-3 flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
      </div>
    </div>
  );
}

function TopicButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-2xl border border-violet-200 bg-white px-4 py-2.5 text-left text-sm font-semibold text-violet-700 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function QuestionButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm leading-snug text-slate-800 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function SupportOptions({
  mode,
  selectedTopic,
  language,
  isLoading,
  onSelectTopic,
  onSelectQuestion,
  onShowOther,
}) {
  const primaryTopics = supportFaqTopics.slice(0, PRIMARY_SUPPORT_TOPIC_LIMIT);
  const otherTopics = supportFaqTopics.slice(PRIMARY_SUPPORT_TOPIC_LIMIT);
  const copy = getChatbotCopy(language);

  if (mode === 'chat') {
    return null;
  }

  if (mode === 'questions' && selectedTopic) {
    return (
      <div className="mb-4 ml-10 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {getLocalizedTopicTitle(selectedTopic, language)}
        </p>
        <div className="space-y-2">
          {selectedTopic.questions.map((item) => (
            <QuestionButton
              key={item.question}
              onClick={() => onSelectQuestion(item)}
              disabled={isLoading}
            >
              {getLocalizedQuestion(item, language)}
            </QuestionButton>
          ))}
        </div>
      </div>
    );
  }

  const isOtherMode = mode === 'other';
  const topics = isOtherMode ? otherTopics : primaryTopics;

  return (
    <div className="mb-4 ml-10 space-y-3">
      {isOtherMode && (
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {copy.otherSupportTopics}
        </p>
      )}
      <div className="flex flex-wrap gap-2.5">
        {topics.map((topic) => (
          <TopicButton
            key={topic.id}
            onClick={() => onSelectTopic(topic)}
            disabled={isLoading}
          >
            {getLocalizedTopicTitle(topic, language)}
          </TopicButton>
        ))}
        {!isOtherMode && (
          <TopicButton onClick={onShowOther} disabled={isLoading}>
            {copy.other}
          </TopicButton>
        )}
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
  const [language, setLanguage] = useState(() =>
    getSupportedLanguage(localStorage.getItem('kravi-chat-language') || initialLanguage)
  );
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => getInitialMessages(language));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [menuMode, setMenuMode] = useState('main');
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const rootRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const dragStateRef = useRef(null);
  const pendingReplyTimeoutRef = useRef(null);
  const chatRequestIdRef = useRef(0);
  const suppressNextToggleClickRef = useRef(false);

  const selectedTopic = useMemo(
    () => supportFaqTopics.find((topic) => topic.id === selectedTopicId),
    [selectedTopicId]
  );
  const copy = getChatbotCopy(language);

  const clearPendingAssistantReply = () => {
    if (pendingReplyTimeoutRef.current) {
      window.clearTimeout(pendingReplyTimeoutRef.current);
      pendingReplyTimeoutRef.current = null;
    }

    chatRequestIdRef.current += 1;
  };

  const resetChat = (nextLanguage = language) => {
    clearPendingAssistantReply();
    setMessages(getInitialMessages(nextLanguage));
    setInput('');
    setError(null);
    setIsLoading(false);
    setMenuMode('main');
    setSelectedTopicId(null);
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

  const keepChatInViewport = () => {
    const rect = rootRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    let nextXAdjustment = 0;
    let nextYAdjustment = 0;

    if (rect.left < DRAG_MARGIN) {
      nextXAdjustment = DRAG_MARGIN - rect.left;
    } else if (rect.right > window.innerWidth - DRAG_MARGIN) {
      nextXAdjustment = window.innerWidth - DRAG_MARGIN - rect.right;
    }

    if (rect.top < DRAG_MARGIN) {
      nextYAdjustment = DRAG_MARGIN - rect.top;
    } else if (rect.bottom > window.innerHeight - DRAG_MARGIN) {
      nextYAdjustment = window.innerHeight - DRAG_MARGIN - rect.bottom;
    }

    if (nextXAdjustment || nextYAdjustment) {
      setDragOffset((currentOffset) => ({
        x: currentOffset.x + nextXAdjustment,
        y: currentOffset.y + nextYAdjustment,
      }));
    }
  };

  const handleDragStart = (event, source) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (event.target.closest?.('[data-no-drag="true"]')) {
      return;
    }

    const rect = rootRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      source,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startOffset: dragOffset,
      startRect: rect,
      hasMoved: false,
    };

    event.currentTarget.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
  };

  const handleDragMove = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - dragState.startClientX;
    const deltaY = event.clientY - dragState.startClientY;

    if (
      !dragState.hasMoved &&
      Math.hypot(deltaX, deltaY) > DRAG_CLICK_THRESHOLD
    ) {
      dragState.hasMoved = true;

      if (dragState.source === 'toggle') {
        suppressNextToggleClickRef.current = true;
      }
    }

    if (!dragState.hasMoved) {
      return;
    }

    event.preventDefault();

    const minDeltaX = DRAG_MARGIN - dragState.startRect.left;
    const maxDeltaX = window.innerWidth - DRAG_MARGIN - dragState.startRect.right;
    const minDeltaY = DRAG_MARGIN - dragState.startRect.top;
    const maxDeltaY = window.innerHeight - DRAG_MARGIN - dragState.startRect.bottom;

    setDragOffset({
      x: dragState.startOffset.x + clamp(deltaX, minDeltaX, maxDeltaX),
      y: dragState.startOffset.y + clamp(deltaY, minDeltaY, maxDeltaY),
    });
  };

  const handleDragEnd = (event) => {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    if (dragState.source === 'toggle' && dragState.hasMoved) {
      window.setTimeout(() => {
        suppressNextToggleClickRef.current = false;
      }, 200);
    }

    dragStateRef.current = null;
    setIsDragging(false);
  };

  const handleToggleClick = (event) => {
    if (suppressNextToggleClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextToggleClickRef.current = false;
      return;
    }

    toggleChat();
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, menuMode, selectedTopicId]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(keepChatInViewport);

    return () => window.cancelAnimationFrame(frameId);
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('resize', keepChatInViewport);

    return () => window.removeEventListener('resize', keepChatInViewport);
  }, []);

  useEffect(() => () => clearPendingAssistantReply(), []);

  const queueAssistantReply = ({
    userText,
    assistantText,
    onBeforeTyping,
    onAfterReply,
  }) => {
    if (isLoading) {
      return;
    }

    clearPendingAssistantReply();
    const requestId = chatRequestIdRef.current;

    onBeforeTyping?.();
    setMessages((currentMessages) => [
      ...currentMessages,
      createMessage('user', userText),
    ]);
    setError(null);
    setIsLoading(true);

    pendingReplyTimeoutRef.current = window.setTimeout(() => {
      if (chatRequestIdRef.current !== requestId) {
        return;
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage('assistant', assistantText),
      ]);
      onAfterReply?.();
      setIsLoading(false);
      pendingReplyTimeoutRef.current = null;
    }, AI_TYPING_DELAY_MS);
  };

  const handleTopicSelect = (topic) => {
    const topicTitle = getLocalizedTopicTitle(topic, language);

    queueAssistantReply({
      userText: topicTitle,
      assistantText: `${topicTitle}\n${copy.chooseQuestion}`,
      onBeforeTyping: () => {
        setSelectedTopicId(null);
        setMenuMode('chat');
      },
      onAfterReply: () => {
        setSelectedTopicId(topic.id);
        setMenuMode('questions');
      },
    });
  };

  const handleShowOther = () => {
    queueAssistantReply({
      userText: copy.other,
      assistantText: `${copy.otherSupportTopics}.`,
      onBeforeTyping: () => {
        setMenuMode('chat');
        setSelectedTopicId(null);
      },
      onAfterReply: () => {
        setMenuMode('other');
        setSelectedTopicId(null);
      },
    });
  };

  const handleQuestionSelect = (item) => {
    queueAssistantReply({
      userText: getLocalizedQuestion(item, language),
      assistantText: getLocalizedAnswer(item, language),
      onBeforeTyping: () => {
        setMenuMode('chat');
        setSelectedTopicId(null);
      },
    });
  };

  const handleLanguageChange = (event) => {
    const nextLanguage = getSupportedLanguage(event.target.value);
    localStorage.setItem('kravi-chat-language', nextLanguage);
    setLanguage(nextLanguage);
    resetChat(nextLanguage);
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const nextMessages = [...messages, createMessage('user', trimmed)];
    clearPendingAssistantReply();
    const requestId = chatRequestIdRef.current;
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    setMenuMode('chat');
    setSelectedTopicId(null);

    const minimumTypingDelay = wait(AI_TYPING_DELAY_MS);

    try {
      const response = await API.post('/kravi-chat', {
        messages: toApiMessages(nextMessages),
        language,
      });
      await minimumTypingDelay;

      if (chatRequestIdRef.current !== requestId) {
        return;
      }

      const replyText = response.data?.reply;
      if (!replyText) {
        throw new Error('Empty response from chat service');
      }

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage('assistant', replyText),
      ]);
    } catch (err) {
      await minimumTypingDelay;

      if (chatRequestIdRef.current !== requestId) {
        return;
      }

      console.error('KRAVI Bot error:', err);
      setError(copy.error);
    } finally {
      if (chatRequestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      ref={rootRef}
      className={`fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans ${
        isDragging ? 'select-none' : ''
      }`}
      style={{
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
      }}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onPointerCancel={handleDragEnd}
    >
      {isOpen && (
        <div className="mb-3 flex h-[620px] max-h-[calc(100vh-7rem)] w-[390px] max-w-[94vw] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div
            className={`flex shrink-0 touch-none items-center justify-between border-b border-slate-100 bg-white px-4 py-3 text-slate-900 ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onPointerDown={(event) => handleDragStart(event, 'header')}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-[#6d28d9] p-0.5">
                <img
                  src={kraviAssistantImage}
                  alt="KRAVI AI Assistant"
                  className="h-full w-full rounded-full object-cover object-top"
                />
              </div>
              <div>
                <p className="text-base font-semibold leading-tight">KRAVI Support</p>
                <p className="text-[11px] leading-tight text-slate-500">{copy.supportStatus}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                data-no-drag="true"
                value={language}
                onChange={handleLanguageChange}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-colors hover:border-violet-300 focus:border-transparent focus:ring-2 focus:ring-violet-400"
                aria-label="Chat language"
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                data-no-drag="true"
                type="button"
                onClick={closeChat}
                className="rounded-full p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50 px-4 py-4">
            <div className="min-h-[72px]" />
            <DateDivider />
            {messages.map((message, index) => (
              <ChatBubble
                key={`${message.role}-${index}`}
                role={message.role}
                text={message.text}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && <TypingIndicator />}
            {error && (
              <div className="mb-2 mt-1 text-center text-xs text-red-500">
                {error}
              </div>
            )}
            <SupportOptions
              mode={menuMode}
              selectedTopic={selectedTopic}
              language={language}
              isLoading={isLoading}
              onSelectTopic={handleTopicSelect}
              onSelectQuestion={handleQuestionSelect}
              onShowOther={handleShowOther}
            />
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={copy.placeholder}
                rows={1}
                className="max-h-24 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="shrink-0 rounded-xl bg-[#7c3aed] p-2.5 text-white transition-colors hover:bg-[#6d28d9] disabled:bg-slate-200 disabled:text-slate-400"
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
        onPointerDown={(event) => handleDragStart(event, 'toggle')}
        onClick={handleToggleClick}
        onDragStart={(event) => event.preventDefault()}
        className={`flex h-16 w-16 touch-none items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-white p-0.5 text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        aria-label="Toggle KRAVI chat"
      >
        {isOpen ? (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-[#7c3aed]">
            <X size={24} />
          </span>
        ) : (
          <img
            src={kraviAssistantImage}
            alt="Open KRAVI chat"
            draggable={false}
            className="h-full w-full rounded-full object-cover object-top"
          />
        )}
      </button>
    </div>
  );
}
