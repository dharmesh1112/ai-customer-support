// @ts-nocheck
// ===========================================
// File Upload Component
// ===========================================
// Drag-and-drop area for uploading FAQ documents.
// Accepts .txt and .pdf files.
//
// FLOW:
// 1. User drops/selects a file
// 2. We read the text content
// 3. Chunk it (using lib/chunker.ts)
// 4. Send chunks to /api/embed
// 5. Store embedded chunks in parent state
//
// For PDF: We extract text client-side (basic extraction)
// For TXT: Direct reading

"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";
import { chunkDocument } from "@/lib/chunker";
import { KnowledgeChunk } from "@/lib/types";

interface FileUploadProps {
  onKnowledgeBaseLoaded: (chunks: KnowledgeChunk[]) => void;
  isLoaded: boolean;
}

export function FileUpload({ onKnowledgeBaseLoaded, isLoaded }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string>("");

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError("");
    setFileName(file.name);

    try {
      // Read file content as text
      let text = "";
      if (file.type === "text/plain" || file.name.endsWith(".txt")) {
        text = await file.text();
      } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        // For PDFs, we read as text (basic extraction)
        // In production, you'd use a proper PDF parser
        text = await file.text();
        if (!text.trim() || text.includes("%PDF")) {
          // Binary PDF — can't extract client-side easily
          setError(
            "PDF text extraction is limited in the browser. Please paste the content as a .txt file instead."
          );
          setIsProcessing(false);
          return;
        }
      } else {
        // Try reading any file as text
        text = await file.text();
      }

      if (!text.trim()) {
        setError("File appears to be empty.");
        setIsProcessing(false);
        return;
      }

      // Chunk the document
      const chunks = chunkDocument(text, file.name);

      // Send to embedding API
      const response = await fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chunks }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to process document");
      }

      const data = await response.json();
      onKnowledgeBaseLoaded(data.chunks);
    } catch (err: any) {
      setError(err.message || "Failed to process file");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxFiles: 1,
    maxSize: 1024 * 1024, // 1MB max
  });

  // Show success state if already loaded
  if (isLoaded && !isProcessing) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        <span className="text-sm text-green-700 dark:text-green-300">
          Knowledge base loaded: <strong>{fileName || "Sample FAQ"}</strong>
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-300 dark:border-gray-700 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
        } ${isProcessing ? "pointer-events-none opacity-60" : ""}`}
      >
        <input {...getInputProps()} />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Processing & embedding document...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDragActive ? "Drop your FAQ here" : "Drop FAQ file here, or click to browse"}
            </p>
            <p className="text-xs text-gray-500">
              Supports .txt and .md files (max 1MB)
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 px-1">{error}</p>
      )}
    </div>
  );
}
