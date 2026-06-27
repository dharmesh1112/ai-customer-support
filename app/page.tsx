// ===========================================
// Main Page — Assembles Everything
// ===========================================

"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { FileUpload } from "@/components/file-upload";
import { SampleLoader } from "@/components/sample-loader";
import { ChatInterface } from "@/components/chat-interface";
import { KnowledgeChunk } from "@/lib/types";
import { Database, MessageSquare, Zap } from "lucide-react";

export default function Home() {
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeChunk[]>([]);
  const isLoaded = knowledgeBase.length > 0;

  // Reset everything — clears knowledge base and chat history
  const handleReset = () => {
    setKnowledgeBase([]);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header onReset={handleReset} />

      <main className="flex-1 flex flex-col overflow-hidden max-w-5xl mx-auto w-full">
        {/* Top panel: Upload + Sample loader */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 w-full sm:w-auto">
              <FileUpload
                onKnowledgeBaseLoaded={setKnowledgeBase}
                isLoaded={isLoaded}
              />
            </div>

            {!isLoaded && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">or</span>
                <SampleLoader
                  onLoaded={setKnowledgeBase}
                  disabled={isLoaded}
                />
              </div>
            )}
          </div>

          {/* Stats bar when KB is loaded */}
          {isLoaded && (
            <div className="flex items-center gap-4 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Database className="w-3.5 h-3.5" />
                <span>{knowledgeBase.length} chunks indexed</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Zap className="w-3.5 h-3.5" />
                <span>TF-IDF retrieval active</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ready for questions</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface knowledgeBase={knowledgeBase} />
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-2 text-center">
          <p className="text-[11px] text-gray-400 dark:text-gray-500">
            Built by{" "}
            <a
              href="https://linkedin.com/in/dharmesh1112"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Dharmesh Gidwani
            </a>
            {" "}• RAG Architecture • Llama 3.3 70B • Next.js + TypeScript
          </p>
        </div>
      </main>
    </div>
  );
}
