// ===========================================
// Header Component
// ===========================================
// Top bar with app branding, status indicator, dark mode toggle,
// and a subtle GitHub link.

"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Bot, Github } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
}

export function Header({ onReset }: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Title */}
        <button
          onClick={onReset}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          title="Reset chat"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              AI Support Agent
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              RAG-Powered Knowledge Base Chat
            </p>
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Online indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">
              Online
            </span>
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/dharmesh1112/ai-customer-support"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="View source on GitHub"
          >
            <Github className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </a>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
