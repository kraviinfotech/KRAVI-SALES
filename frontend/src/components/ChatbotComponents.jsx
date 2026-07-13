import React from 'react';
import { format } from 'date-fns';

export function MessageBubble({ role, text, timestamp }) {
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

export function DateDivider({ date }) {
  if (!date) return null;
  return (
    <div className="flex items-center gap-3 py-2 text-xs text-slate-500 uppercase tracking-[0.25em]">
      <span className="h-px flex-1 bg-slate-200" />
      <span>{date}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function TopicButton({ label, onClick, active }) {
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

export function TypingIndicator() {
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
