// ===========================================
// Typing Indicator Component
// ===========================================
// Shows animated dots while the AI is "thinking"
// (similar to iMessage or WhatsApp typing indicators).
// This is a UX detail that makes the app feel polished.

"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">AI</span>
      </div>

      {/* Animated dots */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex gap-1">
          <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
          <div className="typing-dot w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
        </div>
      </div>
    </div>
  );
}
