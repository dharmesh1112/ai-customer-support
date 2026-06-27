// ===========================================
// Confidence Badge Component
// ===========================================
// Shows a colored badge indicating how confident
// the AI is in its answer. Includes an icon for visual impact.

"use client";

import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface ConfidenceBadgeProps {
  confidence: "high" | "medium" | "low";
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  const styles = {
    high: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    low: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  };

  const labels = {
    high: "High Confidence",
    medium: "Medium Confidence",
    low: "Low Confidence",
  };

  const icons = {
    high: <CheckCircle className="w-3 h-3" />,
    medium: <AlertCircle className="w-3 h-3" />,
    low: <XCircle className="w-3 h-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[confidence]}`}
    >
      {icons[confidence]}
      {labels[confidence]}
    </span>
  );
}
