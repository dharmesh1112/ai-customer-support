// ===========================================
// Vector Similarity Search
// ===========================================
// This is the RETRIEVAL part of RAG.
//
// Given a user's question (as an embedding vector),
// find the most similar knowledge base chunks.
//
// Uses COSINE SIMILARITY — measures the angle between
// two vectors. Score of 1.0 = identical direction (same meaning).
// Score of 0.0 = perpendicular (completely unrelated).

import { KnowledgeChunk } from "./types";

/**
 * Calculate cosine similarity between two vectors.
 * This is the core math that powers semantic search.
 *
 * Formula: dot(A, B) / (magnitude(A) * magnitude(B))
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);
  if (magnitude === 0) return 0;

  return dotProduct / magnitude;
}

/**
 * Search the knowledge base for chunks most relevant to a query.
 *
 * @param queryEmbedding - The user's question as a vector
 * @param chunks - All knowledge base chunks with their embeddings
 * @param topK - How many results to return (default: 3)
 * @returns Top matching chunks with their similarity scores
 */
export function searchKnowledgeBase(
  queryEmbedding: number[],
  chunks: KnowledgeChunk[],
  topK: number = 3
): { chunk: KnowledgeChunk; score: number }[] {
  // Calculate similarity between the question and every chunk
  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));

  // Sort by score (highest first) and take top K
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

/**
 * Determine confidence level based on the best similarity score.
 *
 * These thresholds are tuned for TF-IDF cosine similarity:
 * - >= 0.35: Strong match — answer with confidence
 * - >= 0.15: Decent match — answer but note uncertainty
 * - < 0.15: Poor match — suggest human handoff
 */
export function getConfidenceLevel(
  topScore: number
): "high" | "medium" | "low" {
  if (topScore >= 0.35) return "high";
  if (topScore >= 0.15) return "medium";
  return "low";
}
