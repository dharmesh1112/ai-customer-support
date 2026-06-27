// ===========================================
// Chat Message Component
// ===========================================
// Renders a single message bubble (user or AI).
// AI messages also show:
// - Confidence badge (High/Medium/Low)
// - Source attribution (which KB sections were used)
// - Human handoff suggestion (when confidence is low)

"use client";

import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ConfidenceBadge } from "./confidence-badge";
import { MarkdownText } from "./markdown-text";
import { User, Bot, AlertTriangle } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isError = message.content.includes("error") || message.content.includes("Unable to connect") || message.content.includes("API key not configured");

  return (
    <div className={`flex items-start gap-3 px-4 py-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-gray-200 dark:bg-gray-700"
            : "bg-gradient-to-br from-primary-500 to-purple-600"
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isUser
              ? "bg-primary-600 text-white rounded-tr-sm"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-gray-700"
          }`}
        >
          {/* Message text — renders markdown for AI, plain text for user */}
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <MarkdownText content={message.content} />
          )}
        </div>

        {/* AI-specific metadata (only show for actual answers, not errors) */}
        {!isUser && message.confidence && !isError && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <ConfidenceBadge confidence={message.confidence} />

            {/* Source attribution — show only the primary source */}
            {message.sources && message.sources.length > 0 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                📄 Found in: <span className="font-medium">{message.sources[0]}</span>
              </span>
            )}
          </div>
        )}

        {/* Human handoff suggestion when confidence is low (and not an error) */}
        {!isUser && message.confidence === "low" && !isError && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-xs text-amber-700 dark:text-amber-300">
              I'm not fully confident in this answer. Let me connect you with a human agent for accurate assistance.
            </span>
          </div>
        )}

        {/* Timestamp */}
        <p className={`text-[10px] text-gray-400 mt-1 ${isUser ? "text-right" : ""}`}>
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
