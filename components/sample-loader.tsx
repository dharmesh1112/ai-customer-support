// ===========================================
// Sample FAQ Loader Component
// ===========================================
// "Try with Sample FAQ" button — loads a pre-built
// CloudDesk FAQ so visitors can test immediately
// without needing an OpenAI key for embedding.
//
// The sample FAQ has PRE-COMPUTED embeddings in
// data/sample-faq.json, so this is instant + free.

"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { KnowledgeChunk } from "@/lib/types";

interface SampleLoaderProps {
  onLoaded: (chunks: KnowledgeChunk[]) => void;
  disabled: boolean;
}

export function SampleLoader({ onLoaded, disabled }: SampleLoaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const loadSample = async () => {
    setIsLoading(true);
    try {
      // Fetch pre-computed sample FAQ
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks: sampleChunks }),
      });

      if (!response.ok) throw new Error("Failed to load sample");

      const data = await response.json();
      onLoaded(data.chunks);
    } catch (error) {
      console.error("Failed to load sample:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={loadSample}
      disabled={disabled || isLoading}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary-600 to-purple-600 text-white text-sm font-medium hover:from-primary-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4" />
      )}
      {isLoading ? "Loading..." : "Try with Sample FAQ"}
    </button>
  );
}

// =============================================
// Sample CloudDesk FAQ Content (pre-chunked)
// =============================================
const sampleChunks = [
  {
    content: `## Password Reset\n\nTo reset your password on CloudDesk:\n1. Click "Forgot Password" on the login page\n2. Enter your registered email address\n3. Check your inbox for a reset link (arrives within 2 minutes)\n4. Click the link and create a new password (minimum 8 characters, must include a number)\n\nIf you don't receive the email, check your spam folder. If the issue persists, contact support at help@clouddesk.io.\n\nNote: Password reset links expire after 24 hours for security.`,
    source: "CloudDesk FAQ - Account & Security",
  },
  {
    content: `## Pricing Plans\n\nCloudDesk offers three plans:\n\n**Starter (Free):** Up to 3 agents, 100 tickets/month, email support, basic reporting.\n\n**Professional ($29/agent/month):** Unlimited tickets, live chat, AI auto-responses, custom workflows, priority support, advanced analytics.\n\n**Enterprise ($79/agent/month):** Everything in Professional plus: custom integrations, dedicated account manager, SLA guarantees (99.9% uptime), SSO/SAML, audit logs, and custom training.\n\nAll paid plans include a 14-day free trial. No credit card required to start.`,
    source: "CloudDesk FAQ - Pricing & Plans",
  },
  {
    content: `## Slack Integration\n\nTo integrate CloudDesk with Slack:\n1. Go to Settings → Integrations → Slack\n2. Click "Connect to Slack"\n3. Authorize CloudDesk in your Slack workspace\n4. Choose which Slack channel receives new ticket notifications\n5. Optionally enable "Create ticket from Slack" — lets your team create support tickets directly from Slack messages using the ⚡ shortcut\n\nOnce connected, you'll get real-time notifications for new tickets, agent replies, and SLA breaches directly in your chosen Slack channel.\n\nSupported: Slack Free, Pro, Business+, and Enterprise Grid.`,
    source: "CloudDesk FAQ - Integrations",
  },
  {
    content: `## Data Export\n\nYou can export your data from CloudDesk at any time:\n\n**Ticket Export:** Go to Tickets → Filter as needed → Click "Export" → Choose CSV or JSON format. Includes all ticket fields, tags, and conversation history.\n\n**Customer Data Export:** Settings → Data Management → Export Customers → CSV format with all custom fields.\n\n**Full Account Export:** Settings → Data Management → Request Full Export. This generates a ZIP file with all tickets, customers, knowledge base articles, and analytics. Processing takes 2-24 hours depending on account size. You'll receive an email when it's ready.\n\nCloudDesk complies with GDPR Article 20 (Right to Data Portability). All exports are encrypted in transit.`,
    source: "CloudDesk FAQ - Data & Privacy",
  },
  {
    content: `## Setting Up Auto-Responses\n\nCloudDesk's AI can automatically respond to common questions:\n\n1. Go to Settings → AI & Automation → Auto-Responses\n2. Enable "AI Auto-Response"\n3. Connect your knowledge base (the AI searches it for answers)\n4. Set confidence threshold (we recommend 85% — only auto-responds when very confident)\n5. Choose behavior for low-confidence: "Assign to agent" or "Ask clarifying question"\n\nThe AI learns from your agents' responses over time, improving accuracy. You can review all AI responses in the AI Activity Log.\n\nAvailable on Professional and Enterprise plans.`,
    source: "CloudDesk FAQ - AI & Automation",
  },
  {
    content: `## Supported Languages\n\nCloudDesk supports customer communication in 45+ languages:\n- Auto-detection of incoming message language\n- Real-time translation for agents (powered by DeepL)\n- Multilingual knowledge base — maintain articles in multiple languages\n- AI auto-responses work in: English, Spanish, French, German, Portuguese, Japanese, Korean, Chinese (Simplified & Traditional), Italian, Dutch, and Hindi\n\nAgent interface is available in: English, Spanish, French, German, Portuguese, and Japanese.\n\nEnterprise plan includes custom language model fine-tuning for industry-specific terminology.`,
    source: "CloudDesk FAQ - Languages & Localization",
  },
  {
    content: `## SLA & Uptime\n\nCloudDesk guarantees:\n- **Starter:** Best-effort availability, typically 99.5%\n- **Professional:** 99.9% uptime SLA\n- **Enterprise:** 99.99% uptime SLA with financial credits for breaches\n\nOur infrastructure runs on AWS across 3 regions (US-East, EU-West, AP-Southeast). Data is replicated in real-time. We maintain a public status page at status.clouddesk.io.\n\nPlanned maintenance windows are announced 72 hours in advance and typically occur Sunday 2-4 AM UTC.\n\nIn the last 12 months, we've achieved 99.97% uptime across all regions.`,
    source: "CloudDesk FAQ - Reliability & SLA",
  },
  {
    content: `## Mobile App\n\nCloudDesk has native mobile apps for both iOS and Android:\n\n**Features available on mobile:**\n- View and respond to tickets\n- Real-time push notifications for assigned tickets\n- Internal notes and @mentions\n- Customer profile viewing\n- Quick actions (assign, prioritize, tag)\n- Offline mode (queue responses when no internet)\n\n**Not available on mobile (desktop only):**\n- Workflow builder\n- Analytics dashboards\n- Integration settings\n- Team management\n\nDownload: App Store (iOS 15+) or Google Play (Android 10+). Requires CloudDesk Professional or Enterprise plan.`,
    source: "CloudDesk FAQ - Mobile App",
  },
  {
    content: `## Cancellation & Refunds\n\nTo cancel your CloudDesk subscription:\n1. Go to Settings → Billing → Subscription\n2. Click "Cancel Subscription"\n3. Choose immediate cancellation or cancel at end of billing cycle\n4. Complete the brief feedback survey (optional)\n\n**Refund Policy:**\n- Monthly plans: No refunds for partial months\n- Annual plans: Pro-rated refund for unused months (minus 10% early termination fee)\n- Enterprise contracts: Subject to individual agreement terms\n\nAfter cancellation:\n- Your data is retained for 30 days (in case you change your mind)\n- After 30 days, data is permanently deleted\n- You can export all data before cancellation (see Data Export section)`,
    source: "CloudDesk FAQ - Billing & Cancellation",
  },
  {
    content: `## Security & Compliance\n\nCloudDesk takes security seriously:\n\n**Certifications:** SOC 2 Type II, ISO 27001, GDPR compliant, HIPAA compliant (Enterprise plan)\n\n**Data Security:**\n- All data encrypted at rest (AES-256) and in transit (TLS 1.3)\n- Regular penetration testing by third-party security firms\n- Bug bounty program for responsible disclosure\n\n**Access Controls:**\n- Role-based access control (RBAC) with custom roles\n- SSO/SAML 2.0 support (Enterprise)\n- Two-factor authentication (all plans)\n- IP allowlisting (Professional & Enterprise)\n- Audit logs with 1-year retention (Enterprise)\n\n**Data Residency:** Choose between US, EU, or APAC data centers at signup.`,
    source: "CloudDesk FAQ - Security & Compliance",
  },
];
