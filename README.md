# 🤖 AI Customer Support Agent

An intelligent customer support chatbot powered by **RAG (Retrieval Augmented Generation)** that answers questions from your knowledge base with confidence scoring, source attribution, and smart human escalation.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.0%20Flash-blue?logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

## 🔗 Live Demo

**[→ Try it live](https://ai-customer-support-demo.vercel.app)**

<!-- Add actual Vercel URL after deployment -->

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **Upload Your FAQ** | Drag-and-drop .txt/.md files to create a custom knowledge base |
| 🔍 **Semantic Search** | Uses vector embeddings for meaning-based retrieval (not just keyword matching) |
| 🎯 **Confidence Scoring** | High / Medium / Low confidence badges on every response |
| 📌 **Source Attribution** | Shows exactly which knowledge base section was used |
| 🚨 **Smart Escalation** | Suggests human handoff when confidence is low |
| ⚡ **Streaming Responses** | Real-time token-by-token response (like ChatGPT) |
| 🌗 **Dark/Light Mode** | Automatic theme detection + manual toggle |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |
| 🎮 **Try Sample FAQ** | One-click demo with pre-built CloudDesk FAQ |

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   User UI   │────▶│  /api/embed  │────▶│   OpenAI    │
│  (Next.js)  │     │  (chunking)  │     │  Embeddings │
└─────────────┘     └──────────────┘     └─────────────┘
       │                                        │
       │ stores embeddings                      │
       │ in client state                        ▼
       │            ┌──────────────┐     ┌─────────────┐
       └───────────▶│  /api/chat   │────▶│   OpenAI    │
                    │  (RAG pipe)  │     │  GPT-4o-mini│
                    └──────────────┘     └─────────────┘
                           │
                    1. Embed question
                    2. Cosine similarity search
                    3. Build prompt with context
                    4. Stream response
```

### How RAG Works (Simplified)

1. **Upload** → Document is split into chunks (~500 chars each)
2. **Embed** → Each chunk is converted to a 1536-dimensional vector using OpenAI embeddings
3. **Store** → Vectors are stored in the browser session (stateless server)
4. **Query** → User's question is also embedded
5. **Retrieve** → Cosine similarity finds the top 3 most relevant chunks
6. **Generate** → GPT-4o-mini generates an answer using ONLY the retrieved chunks
7. **Score** → Confidence is calculated from the similarity score of the best match

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 (App Router) | Full-stack in one codebase, API routes, Vercel-optimized |
| Language | TypeScript | Type safety, better DX, professional standard |
| Styling | Tailwind CSS | Rapid development, consistent design, dark mode built-in |
| AI Model | Gemini 2.0 Flash | Free tier, fast, excellent quality for Q&A |
| Embeddings | text-embedding-004 | Free, 768-dim vectors for semantic search |
| Vector Store | Client-side (React state) | Zero infrastructure, serverless-friendly |
| Deployment | Vercel | Zero-config, edge functions, free tier |
| Icons | Lucide React | Clean, consistent icon set |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([get one free here](https://aistudio.google.com/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/dharmesh1112/ai-customer-support.git
cd ai-customer-support

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key (free) | Yes |

---

## 📁 Project Structure

```
ai-customer-support/
├── app/
│   ├── layout.tsx          # Root layout + theme + SEO
│   ├── page.tsx            # Main page (assembles components)
│   ├── globals.css         # Tailwind + custom animations
│   └── api/
│       ├── chat/route.ts   # RAG pipeline (retrieve + generate + stream)
│       └── embed/route.ts  # Embedding generation endpoint
├── components/
│   ├── chat-interface.tsx  # Main chat container + streaming logic
│   ├── chat-message.tsx    # Message bubble with sources + confidence
│   ├── confidence-badge.tsx # High/Medium/Low visual badge
│   ├── file-upload.tsx     # Drag-and-drop document upload
│   ├── header.tsx          # App header + dark mode toggle
│   ├── typing-indicator.tsx # Animated "thinking" dots
│   └── sample-loader.tsx   # "Try Sample FAQ" with CloudDesk data
├── lib/
│   ├── openai.ts           # OpenAI client configuration
│   ├── similarity.ts       # Cosine similarity + vector search
│   ├── chunker.ts          # Document chunking with source tracking
│   └── types.ts            # TypeScript interfaces
└── data/
    └── sample-faq.json     # Pre-computed demo FAQ (optional)
```

---

## 🧠 Key Design Decisions

1. **Client-side vector storage** — No database needed. Embeddings live in React state. This keeps the server stateless (perfect for Vercel serverless) and eliminates infrastructure cost. Trade-off: data doesn't persist between sessions.

2. **Streaming responses** — Uses Server-Sent Events for real-time token delivery. Users see the answer appearing immediately instead of waiting 3-5 seconds.

3. **Confidence-based escalation** — Instead of always answering (and risking hallucination), the system acknowledges uncertainty and suggests human handoff when retrieval quality is low.

4. **Source attribution** — Every answer shows which knowledge base section was used, making responses auditable and trustworthy.

---

## 📈 Future Enhancements

- [ ] Persistent vector storage (Pinecone / Supabase pgvector)
- [ ] Conversation memory (multi-turn context)
- [ ] PDF parsing with OCR
- [ ] Analytics dashboard (popular questions, confidence distribution)
- [ ] Multi-language support
- [ ] Webhook for human escalation (Slack/email notification)
- [ ] Fine-tuned embeddings for domain-specific terminology

---

## 🤝 About

Built by [Dharmesh Gidwani](https://linkedin.com/in/dharmesh1112) — demonstrating AI implementation skills for customer success and AI consultant roles.

**Key skills demonstrated:**
- RAG architecture design & implementation
- LLM integration with OpenAI APIs
- Semantic search with vector embeddings
- Full-stack development (Next.js + TypeScript)
- Production-ready UX (streaming, error handling, responsive design)
- Cost-optimized AI architecture (serverless, client-side vectors)

---

## 📄 License

MIT License — feel free to use this as a starting point for your own projects.
