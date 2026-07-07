import React, { useEffect, useRef, useState, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { Send, X } from 'lucide-react';
import API from '../api/axios';
import kraviAssistantImage from '../images/kravi-ai-assistant.png';
import { format } from 'date-fns';
import { PRIMARY_SUPPORT_TOPIC_LIMIT, supportFaqTopics } from '../data/supportFaqs';
import Draggable from 'react-draggable';

const WELCOME_MESSAGES = {
  hi: " Namaste! Main KRAVI AI Assistant hoon. Main aapki kaise sahayata kar sakta hoon?",
  en: " Hello! I am KRAVI AI Assistant. How can I assist you today?",
  mr: " Namaskar! Mi KRAVI AI Assistant aahe. Mi tumhala kashi madat karu shakto?"
};

const PLACEHOLDER_TEXT = 'Apna sawaal type karein...';

// --- Reducer Setup ---
function createInitialState(initialLanguage) {
  return {
    messages: [
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
    ],
    isLoading: false,
    error: null,
    selectedTopicId: null,
    showOtherTopics: false,
    showTopicPanel: true,
  };
}

function chatReducer(state, action) {
  switch (action.type) {
    case 'SEND_MESSAGE_START':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'user', text: action.payload, timestamp: new Date().toISOString() },
        ],
        isLoading: true,
        error: null,
      };
    case 'SEND_MESSAGE_SUCCESS':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'assistant', text: action.payload, timestamp: new Date().toISOString() },
        ],
        isLoading: false,
      };
    case 'SEND_MESSAGE_FAILURE':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };
    case 'SELECT_FAQ_START':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'user', text: action.payload.question, timestamp: new Date().toISOString() },
        ],
        selectedTopicId: null,
        showOtherTopics: false,
        showTopicPanel: false,
        isLoading: true,
      };
    case 'SELECT_FAQ_SUCCESS':
      return {
        ...state,
        messages: [
          ...state.messages,
          { role: 'assistant', text: action.payload.answer, timestamp: new Date().toISOString() },
        ],
        isLoading: false,
      };
    case 'SELECT_TOPIC':
      return {
        ...state,
        selectedTopicId: action.payload,
      };
    case 'SHOW_OTHER_TOPICS':
      return {
        ...state,
        selectedTopicId: null,
        showOtherTopics: true,
      };
    default:
      return state;
  }
}

// --- Sub-components ---
function MessageBubble({ role, text, timestamp }) {
  const formattedTime = timestamp ? format(new Date(timestamp), 'h:mm a') : null;
  return (
    <div className="flex w-full mb-3">
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
          role === 'user'
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
      className={`rounded-2xl border px-3 py-2 text-sm font-medium transition-colors ${
        active
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

function ChatHeader({ language, onLanguageChange, onClose }) {
  return (
    <div
      className="drag-handle relative bg-white text-slate-900 px-4 py-3 flex items-center justify-between shrink-0 border-b border-slate-200 cursor-grab active:cursor-grabbing select-none"
    >
      <div className="absolute left-1/2 top-2 -translate-x-1/2 h-1.5 w-14 rounded-full bg-slate-200" />
      <div className="flex items-center gap-3 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-slate-100 p-2 overflow-hidden shadow-sm">
          <img
            src={kraviAssistantImage}
            alt="KRAVI AI Assistant"
            className="h-full w-full rounded-full object-cover object-top"
          />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight text-slate-900">KRAVI Bot</p>
          <p className="text-[11px] text-slate-500 leading-tight">24/7 Support</p>
        </div>
      </div>
      <div className="flex items-center gap-2" onMouseDown={e => e.stopPropagation()} onTouchStart={e => e.stopPropagation()}>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="rounded-md text-sm px-2 py-1 bg-slate-100 text-slate-900 cursor-pointer"
          aria-label="Select language"
        >
          <option value="hi">हिन्दी</option>
          <option value="en">English</option>
          <option value="mr">मराठी</option>
        </select>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full p-1.5 transition-colors cursor-pointer"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

function ChatBody({ scrollRef, chatDate, messages, isLoading, error }) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
      <DateDivider date={chatDate} />
      {messages.map((message, index) => (
        <MessageBubble key={`${message.role}-${index}`} role={message.role} text={message.text} timestamp={message.timestamp} />
      ))}
      {isLoading && <TypingIndicator />}
      {error && (
        <div className="text-center text-xs text-red-500 mt-1 mb-2">{error}</div>
      )}
    </div>
  );
}

function TopicPanel({
  selectedTopic,
  showOtherTopics,
  mainTopics,
  otherTopics,
  getTitle,
  getQuestionText,
  getAnswerText,
  insertFaqResponse,
  handleTopicClick,
  handleOtherClick,
  selectedTopicId,
}) {
  return (
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
        {!selectedTopic && !showOtherTopics && <TopicButton label="Other" onClick={handleOtherClick} />}
      </div>
    </div>
  );
}

function ChatFooter({ inputRef, input, setInput, handleKeyDown, sendMessage, isLoading }) {
  return (
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
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl p-2.5 transition-colors shrink-0 cursor-pointer"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 text-center">Hindi | English | Marathi mein poochein</p>
    </div>
  );
}

function ChatToggleButton({ isOpen, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="drag-handle w-16 h-16 rounded-full bg-blue-600 shadow-xl border border-blue-700 p-0.5 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform overflow-hidden cursor-grab active:cursor-grabbing"
      aria-label="Toggle KRAVI chat"
    >
      {isOpen ? (
        <span className="w-full h-full rounded-full bg-gradient-to-br from-[#0b1a4a] to-[#1b5cff] flex items-center justify-center pointer-events-none">
          <X size={24} />
        </span>
      ) : (
        <img src={kraviAssistantImage} alt="Open KRAVI chat" className="h-full w-full rounded-full object-cover object-top pointer-events-none" />
      )}
    </button>
  );
}

// --- Main Component ---
export default function KraviChatbot() {
  const { i18n } = useTranslation();
  const TYPING_SIM_DELAY = 700;

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const language = i18n.language?.split('-')[0] || 'hi';
  const setLanguage = (lang) => i18n.changeLanguage(lang);
  
  // Track dragging to prevent accidental clicks
  const [isDragging, setIsDragging] = useState(false);

  const [state, dispatch] = useReducer(chatReducer, language, createInitialState);
  const { messages, isLoading, error, selectedTopicId, showOtherTopics, showTopicPanel } = state;

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

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

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const projectedMessages = [
      ...messages,
      { role: 'user', text: trimmed, timestamp: new Date().toISOString() },
    ];

    dispatch({ type: 'SEND_MESSAGE_START', payload: trimmed });
    setInput('');

    try {
      const response = await API.post('/kravi-chat', {
        messages: toApiMessages(projectedMessages),
      });

      const replyText = response.data?.reply;
      if (!replyText) throw new Error('Empty response from chat service');

      await new Promise((res) => setTimeout(res, TYPING_SIM_DELAY));
      dispatch({ type: 'SEND_MESSAGE_SUCCESS', payload: replyText });
    } catch (err) {
      console.error('KRAVI Bot error:', err);
      dispatch({ type: 'SEND_MESSAGE_FAILURE', payload: 'Kuch gadbad ho gayi. Please thodi der baad try karein.' });
    }
  };

  const insertFaqResponse = async (question, answer) => {
    dispatch({ type: 'SELECT_FAQ_START', payload: { question } });

    try {
      await new Promise((res) => setTimeout(res, TYPING_SIM_DELAY));
      dispatch({ type: 'SELECT_FAQ_SUCCESS', payload: { answer } });
    } catch (err) {
      dispatch({ type: 'SEND_MESSAGE_FAILURE', payload: 'Kuch gadbad ho gayi.' });
    }
  };

  const handleTopicClick = (topicId) => {
    dispatch({ type: 'SELECT_TOPIC', payload: topicId });
  };

  const handleOtherClick = () => {
    dispatch({ type: 'SHOW_OTHER_TOPICS' });
  };

  const selectedTopic = supportFaqTopics.find((topic) => topic.id === selectedTopicId) || null;
  const mainTopics = supportFaqTopics.slice(0, PRIMARY_SUPPORT_TOPIC_LIMIT);
  const otherTopics = supportFaqTopics.slice(PRIMARY_SUPPORT_TOPIC_LIMIT);

  const chatDate = messages[0]?.timestamp
    ? format(new Date(messages[0].timestamp), 'EEEE, MMM d')
    : null;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <Draggable
      handle=".drag-handle"
      bounds="body"
      onDrag={() => setIsDragging(true)}
      onStop={() => {
        setTimeout(() => setIsDragging(false), 100);
      }}
    >
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
        {isOpen && (
          <div className="mb-3 w-[360px] max-w-[92vw] h-[520px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
            <ChatHeader
              language={language}
              onLanguageChange={setLanguage}
              onClose={() => setIsOpen(false)}
            />

            <ChatBody
              scrollRef={scrollRef}
              chatDate={chatDate}
              messages={messages}
              isLoading={isLoading}
              error={error}
            />

            {showTopicPanel && (
              <TopicPanel
                selectedTopic={selectedTopic}
                showOtherTopics={showOtherTopics}
                mainTopics={mainTopics}
                otherTopics={otherTopics}
                getTitle={getTitle}
                getQuestionText={getQuestionText}
                getAnswerText={getAnswerText}
                insertFaqResponse={insertFaqResponse}
                handleTopicClick={handleTopicClick}
                handleOtherClick={handleOtherClick}
                selectedTopicId={selectedTopicId}
              />
            )}

            <ChatFooter
              inputRef={inputRef}
              input={input}
              setInput={setInput}
              handleKeyDown={handleKeyDown}
              sendMessage={sendMessage}
              isLoading={isLoading}
            />
          </div>
        )}

        <ChatToggleButton
          isOpen={isOpen}
          onClick={(e) => {
            if (isDragging) {
              e.preventDefault();
              return;
            }
            setIsOpen((prev) => !prev);
          }}
        />
      </div>
    </Draggable>
  );
}