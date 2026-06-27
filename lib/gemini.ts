// ===========================================
// Google Gemini Client Configuration
// ===========================================
// This file creates a reusable connection to Google's Gemini API.
// Gemini is 100% FREE (no credit card needed).
//
// We use two models:
// - gemini-2.0-flash: For chat/generation (fast, smart, free)
// - text-embedding-004: For creating embeddings (free)
//
// Get your free API key at: https://aistudio.google.com/apikey

import { GoogleGenerativeAI } from "@google/generative-ai";

// Create a single Gemini client instance
// It reads GEMINI_API_KEY from .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Chat model — for generating answers
export const chatModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Embedding model — for converting text to vectors
export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export default genAI;
