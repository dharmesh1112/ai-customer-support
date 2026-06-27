// ===========================================
// Markdown Text Renderer
// ===========================================
// Renders basic markdown formatting in chat messages:
// - **bold** → <strong>bold</strong>
// - *italic* → <em>italic</em>
// - Numbered lists (1. item)
// - Line breaks

"use client";

import React from "react";

interface MarkdownTextProps {
  content: string;
}

export function MarkdownText({ content }: MarkdownTextProps) {
  // Split content into lines for list handling
  const lines = content.split("\n");

  return (
    <div className="text-sm leading-relaxed space-y-1.5">
      {lines.map((line, lineIdx) => {
        // Skip empty lines (but add spacing)
        if (!line.trim()) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Check if it's a numbered list item (e.g., "1. Item")
        const listMatch = line.match(/^(\d+)\.\s+(.+)/);
        if (listMatch) {
          return (
            <div key={lineIdx} className="flex gap-2 pl-1">
              <span className="text-gray-400 dark:text-gray-500 font-mono text-xs mt-0.5 min-w-[1rem]">
                {listMatch[1]}.
              </span>
              <span>{renderInlineMarkdown(listMatch[2])}</span>
            </div>
          );
        }

        // Check if it's a bullet point
        const bulletMatch = line.match(/^[-•]\s+(.+)/);
        if (bulletMatch) {
          return (
            <div key={lineIdx} className="flex gap-2 pl-1">
              <span className="text-gray-400 dark:text-gray-500 mt-1">•</span>
              <span>{renderInlineMarkdown(bulletMatch[1])}</span>
            </div>
          );
        }

        // Regular paragraph
        return <p key={lineIdx}>{renderInlineMarkdown(line)}</p>;
      })}
    </div>
  );
}

/**
 * Renders inline markdown: **bold**, *italic*, `code`
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Regex matches: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-semibold">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index}>{match[3]}</em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={match.index}
          className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono"
        >
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}
