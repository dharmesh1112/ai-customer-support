// ===========================================
// /api/chat — Main RAG Chat Endpoint
// ===========================================
// The full RAG pipeline:
//
// 1. Receive user's question + stored knowledge base chunks
// 2. Compute TF-IDF similarity locally (no API call!)
// 3. Find top matching chunks
// 4. Send matches + question to Groq (Llama 3.3) for answer generation
// 5. Stream response back to frontend
//
// Retrieval: 100% local (TF-IDF)
// Generation: Groq API (free, fast, reliable)

import { NextRequest } from "next/server";
import { cosineSimilarity, getConfidenceLevel } from "@/lib/similarity";
import { embedAllWithQuery } from "@/lib/tfidf";

export async function POST(request: NextRequest) {
  try {
    const { message, knowledgeBase } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "No message provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If no knowledge base loaded, respond with a helpful message
    if (!knowledgeBase || knowledgeBase.length === 0) {
      return new Response(
        JSON.stringify({
          content:
            "I don't have a knowledge base loaded yet. Please upload a FAQ document or click 'Try Sample FAQ' to get started!",
          sources: [],
          confidence: "low" as const,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // STEP 1: Compute TF-IDF vectors for all chunks + query together
    const chunks = knowledgeBase.map((c: any) => ({
      content: c.content,
      source: c.source,
    }));

    const { chunkVectors, queryVector } = embedAllWithQuery(chunks, message);

    // STEP 2: Find top 3 most similar chunks using cosine similarity
    const scored = chunkVectors.map((vec, i) => ({
      chunk: knowledgeBase[i],
      score: cosineSimilarity(queryVector, vec),
    }));
    scored.sort((a, b) => b.score - a.score);
    const topResults = scored.slice(0, 3);

    // STEP 3: Determine confidence based on best match score
    const topScore = topResults.length > 0 ? topResults[0].score : 0;
    const confidence = getConfidenceLevel(topScore);
    const sources = topResults.map((r) => r.chunk.source);

    console.log(`→ Query: "${message}" | Top score: ${topScore.toFixed(3)} | Confidence: ${confidence}`);

    // STEP 4: Build context from retrieved chunks
    const context = topResults
      .map(
        (r, i) => `[Source ${i + 1}: ${r.chunk.source}]\n${r.chunk.content}`
      )
      .join("\n\n---\n\n");

    // STEP 5: Generate answer using Groq API (free, fast, reliable)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          content: "API key not configured. Please add GROQ_API_KEY to .env.local",
          sources: [],
          confidence: "low" as const,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a helpful customer support AI assistant. Your role is to answer questions based ONLY on the provided knowledge base context.

RULES:
1. ONLY answer based on the provided context below. Do NOT use your own knowledge.
2. If the context doesn't contain enough information to answer, say: "I don't have enough information in my knowledge base to answer this question accurately."
3. Be concise, friendly, and professional.
4. When referencing information, naturally mention which section it comes from.
5. If the question is a greeting or casual message, respond warmly but mention you're ready to help with their questions.

CONFIDENCE LEVEL: ${confidence.toUpperCase()}
${confidence === "low" ? "\nIMPORTANT: The retrieval confidence is LOW. Acknowledge that you're not sure and suggest connecting with a human agent." : ""}

KNOWLEDGE BASE CONTEXT:
${context || "No relevant context found."}`;

    // Call Groq API (OpenAI-compatible format) with streaming
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 500,
        stream: true,
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error(`✗ Groq API error (${groqResponse.status}):`, errText.slice(0, 300));
      return new Response(
        JSON.stringify({
          content: `AI service error (${groqResponse.status}). Please check your GROQ_API_KEY.`,
          sources: [],
          confidence: "low" as const,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✓ Groq responded successfully");

    // STEP 6: Stream the response back
    const encoder = new TextEncoder();
    const reader = groqResponse.body?.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata first
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "metadata", sources, confidence })}\n\n`
          )
        );

        if (!reader) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "content", content: "No response received." })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
          return;
        }

        let buffer = "";

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") continue;
                if (!jsonStr) continue;
                try {
                  const data = JSON.parse(jsonStr);
                  const text = data.choices?.[0]?.delta?.content || "";
                  if (text) {
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "content", content: text })}\n\n`
                      )
                    );
                  }
                } catch (parseErr) {
                  // Skip unparseable lines
                }
              }
            }
          }
        } catch (streamErr: any) {
          console.error("Stream read error:", streamErr.message);
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Chat error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to process message" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
