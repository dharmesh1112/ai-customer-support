// @ts-nocheck
// ===========================================
// /api/embed — Local Embedding Endpoint
// ===========================================
// Computes TF-IDF vectors LOCALLY (no external API calls).
// This means:
// - INSTANT processing (no network latency)
// - ZERO cost (no API charges)
// - ALWAYS works (no model availability issues)
//
// The trade-off: TF-IDF is keyword-based, not semantic.
// But for a focused FAQ with 10-20 chunks, it works great.

import { NextRequest, NextResponse } from "next/server";
import { computeLocalEmbeddings } from "@/lib/tfidf";

export async function POST(request: NextRequest) {
  try {
    const { chunks } = await request.json();

    if (!chunks || !Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json(
        { error: "No chunks provided" },
        { status: 400 }
      );
    }

    // Compute TF-IDF embeddings locally — instant, free, reliable
    const embeddedChunks = computeLocalEmbeddings(chunks);

    return NextResponse.json({ chunks: embeddedChunks });
  } catch (error: any) {
    console.error("Embedding error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate embeddings" },
      { status: 500 }
    );
  }
}
