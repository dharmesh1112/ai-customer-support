// ===========================================
// Type Definitions
// ===========================================
// These define the "shape" of our data.
// Think of them as blueprints — they tell TypeScript
// exactly what fields each object should have.

/** A single chunk of knowledge base content with its embedding */
export interface KnowledgeChunk {
  id: string;                // Unique identifier
  content: string;           // The actual text content
  source: string;            // Where it came from (e.g., "Billing FAQ, Section 3")
  embedding: number[];       // Vector representation (1536 numbers)
}

/** A chat message in the conversation */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";  // Who sent it
  content: string;              // The message text
  sources?: string[];           // Which KB sections were used (assistant only)
  confidence?: "high" | "medium" | "low";  // How confident the AI is
  timestamp: Date;
}

/** What the /api/chat endpoint returns */
export interface ChatResponse {
  content: string;
  sources: string[];
  confidence: "high" | "medium" | "low";
}

/** What the /api/embed endpoint returns */
export interface EmbedResponse {
  chunks: KnowledgeChunk[];
}
