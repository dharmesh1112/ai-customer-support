// ===========================================
// Root Layout
// ===========================================
// This wraps EVERY page in our app.
// It sets up: HTML structure, fonts, dark mode support, metadata (SEO).

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter is a clean, modern font used by most SaaS products
const inter = Inter({ subsets: ["latin"] });

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "AI Customer Support Agent | RAG-Powered Knowledge Base Chat",
  description:
    "Intelligent customer support chatbot that answers questions from your knowledge base using RAG (Retrieval Augmented Generation) with confidence scoring and source attribution.",
  keywords: ["AI", "customer support", "RAG", "chatbot", "knowledge base"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 min-h-screen`}>
        {/* Script to check dark mode preference BEFORE page renders (prevents flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
