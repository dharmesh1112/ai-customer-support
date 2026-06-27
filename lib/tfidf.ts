// ===========================================
// TF-IDF Vectorizer (Local Embeddings)
// ===========================================
// Instead of calling an external API for embeddings,
// we compute TF-IDF vectors locally. This is:
// - FREE (no API calls)
// - FAST (instant, no network latency)
// - RELIABLE (no rate limits or model availability issues)
//
// TF-IDF = Term Frequency × Inverse Document Frequency
// It measures how important a word is to a document
// relative to the entire collection.
//
// For a demo with 10-20 FAQ chunks, TF-IDF performs
// nearly as well as transformer embeddings.

/** Tokenize text into words (lowercase, remove punctuation) */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2); // Skip very short words
}

/** Calculate term frequency for a document */
function termFrequency(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  // Normalize by document length
  for (const [term, count] of tf) {
    tf.set(term, count / tokens.length);
  }
  return tf;
}

/** Build a vocabulary and IDF values from all documents */
function buildIDF(documents: string[][]): Map<string, number> {
  const docCount = documents.length;
  const docFreq = new Map<string, number>();

  for (const tokens of documents) {
    const unique = new Set(tokens);
    for (const token of unique) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [term, freq] of docFreq) {
    // IDF formula: log(total docs / docs containing term)
    idf.set(term, Math.log((docCount + 1) / (freq + 1)) + 1);
  }

  return idf;
}

/** Convert a document to a TF-IDF vector given a vocabulary */
function toTFIDFVector(
  tokens: string[],
  vocabulary: string[],
  idf: Map<string, number>
): number[] {
  const tf = termFrequency(tokens);
  return vocabulary.map((term) => {
    const tfValue = tf.get(term) || 0;
    const idfValue = idf.get(term) || 0;
    return tfValue * idfValue;
  });
}

/**
 * Compute TF-IDF embeddings for a set of text chunks.
 * Returns the chunks with their vector representations.
 */
export function computeLocalEmbeddings(
  chunks: { content: string; source: string }[]
): { id: string; content: string; source: string; embedding: number[] }[] {
  // Tokenize all documents
  const tokenizedDocs = chunks.map((chunk) => tokenize(chunk.content));

  // Build vocabulary (all unique terms across all documents)
  const vocabSet = new Set<string>();
  for (const tokens of tokenizedDocs) {
    for (const token of tokens) {
      vocabSet.add(token);
    }
  }
  const vocabulary = Array.from(vocabSet).sort();

  // Calculate IDF values
  const idf = buildIDF(tokenizedDocs);

  // Convert each chunk to a TF-IDF vector
  return chunks.map((chunk, i) => ({
    id: `chunk-${Date.now()}-${i}`,
    content: chunk.content,
    source: chunk.source,
    embedding: toTFIDFVector(tokenizedDocs[i], vocabulary, idf),
  }));
}

/**
 * Embed a single query against an existing vocabulary
 * (derived from the knowledge base chunks).
 */
export function embedQuery(
  query: string,
  knowledgeBase: { content: string; embedding: number[] }[]
): number[] {
  // Reconstruct vocabulary from all KB chunks + the query
  const allTexts = knowledgeBase.map((chunk) => chunk.content);
  allTexts.push(query);

  const tokenizedDocs = allTexts.map((text) => tokenize(text));
  const vocabSet = new Set<string>();
  for (const tokens of tokenizedDocs) {
    for (const token of tokens) {
      vocabSet.add(token);
    }
  }
  const vocabulary = Array.from(vocabSet).sort();
  const idf = buildIDF(tokenizedDocs);

  // Return the query's vector
  const queryTokens = tokenize(query);
  return toTFIDFVector(queryTokens, vocabulary, idf);
}

/**
 * Re-embed all chunks + query together for accurate comparison.
 * This ensures all vectors share the same vocabulary space.
 */
export function embedAllWithQuery(
  chunks: { content: string; source: string }[],
  query: string
): { chunkVectors: number[][]; queryVector: number[] } {
  const allTexts = [...chunks.map((c) => c.content), query];
  const tokenizedDocs = allTexts.map((text) => tokenize(text));

  // Build shared vocabulary
  const vocabSet = new Set<string>();
  for (const tokens of tokenizedDocs) {
    for (const token of tokens) {
      vocabSet.add(token);
    }
  }
  const vocabulary = Array.from(vocabSet).sort();
  const idf = buildIDF(tokenizedDocs);

  // Vectorize all
  const vectors = tokenizedDocs.map((tokens) =>
    toTFIDFVector(tokens, vocabulary, idf)
  );

  return {
    chunkVectors: vectors.slice(0, chunks.length),
    queryVector: vectors[vectors.length - 1],
  };
}
