// @ts-nocheck
// ===========================================
// Chat Interface Component
// ===========================================
// The main chat container. Handles:
// - Message state management
// - Sending messages to the API
// - Parsing streaming responses
// - Auto-scrolling to new messages
// - Chat history during session
// - Suggested question chips

"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { ChatMessage as ChatMessageType, KnowledgeChunk } from "@/lib/types";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

interface ChatInterfaceProps {
  knowledgeBase: KnowledgeChunk[];
}

// Suggested questions for the demo
const SUGGESTED_QUESTIONS = [
  "How do I reset my password?",
  "What are your pricing plans?",
  "How do I integrate with Slack?",
  "Can I export my data?",
  "Do you have a mobile app?",
  "What security certifications do you have?",
];

export function ChatInterface({ knowledgeBase }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Clear messages when knowledge base is reset (user clicked logo)
  useEffect(() => {
    if (knowledgeBase.length === 0) {
      setMessages([]);
    }
  }, [knowledgeBase]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Auto-resize textarea as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  // Send message to AI
  const sendMessage = async (messageText?: string) => {
    const trimmed = (messageText || input).trim();
    if (!trimmed || isLoading) return;

    // Add user message to chat
    const userMessage: ChatMessageType = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          knowledgeBase: knowledgeBase,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("text/event-stream")) {
        // STREAMING RESPONSE
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        let assistantContent = "";
        let sources: string[] = [];
        let confidence: "high" | "medium" | "low" = "medium";

        const assistantId = `msg-${Date.now()}-assistant`;
        setMessages((prev) => [
          ...prev,
          {
            id: assistantId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);

        if (reader) {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === "metadata") {
                    sources = data.sources || [];
                    confidence = data.confidence || "medium";
                  } else if (data.type === "content") {
                    assistantContent += data.content;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantId
                          ? { ...msg, content: assistantContent, sources, confidence }
                          : msg
                      )
                    );
                  } else if (data.type === "done") {
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === assistantId
                          ? { ...msg, content: assistantContent, sources, confidence }
                          : msg
                      )
                    );
                  }
                } catch (e) {
                  // Skip malformed lines
                }
              }
            }
          }
        }
      } else {
        // NON-STREAMING fallback
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-assistant`,
            role: "assistant",
            content: data.content,
            sources: data.sources,
            confidence: data.confidence,
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          confidence: "low",
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isReady = knowledgeBase.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-4">
        {messages.length === 0 ? (
          // Empty state with suggested questions
          <div className="h-full flex items-center justify-center px-4">
            <div className="text-center max-w-lg">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {isReady ? "Knowledge base ready! Ask me anything." : "Load a knowledge base to get started"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {isReady
                  ? "I'll find answers from the loaded FAQ with source attribution and confidence scoring."
                  : "Upload a file or click 'Try with Sample FAQ' above."}
              </p>

              {/* Suggested question chips */}
              {isReady && (
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="px-3 py-1.5 text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-gray-700 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Message list
          <div className="space-y-1">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={
                isReady
                  ? "Ask a question about the knowledge base..."
                  : "Load a knowledge base first..."
              }
              disabled={!isReady}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed py-1.5"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || !isReady}
              className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 text-center">
            Powered by RAG • Llama 3.3 70B via Groq • Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
