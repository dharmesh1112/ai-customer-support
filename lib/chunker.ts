// ===========================================
// Document Chunker
// ===========================================
// Breaks a large document into smaller pieces (chunks).
//
// WHY: You can't embed a 50-page document as one piece —
// the meaning gets diluted. Small chunks = precise matching.
//
// HOW: We split by paragraphs/sections, keeping each chunk
// around 500 characters. Each chunk also tracks its SOURCE
// (e.g., "Section 3: Billing") so we can show attribution.

/** Split a document into chunks with source tracking */
export function chunkDocument(
  text: string,
  fileName: string
): { content: string; source: string }[] {
  const chunks: { content: string; source: string }[] = [];

  // Split by double newlines (paragraphs) or markdown headers
  const sections = text.split(/\n\s*\n|\n(?=#{1,3}\s)/);

  let currentSection = "";
  let sectionIndex = 1;
  let currentTitle = fileName;

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    // Detect section headers (## Header or **Header**)
    const headerMatch = trimmed.match(/^#{1,3}\s+(.+)/) ||
                        trimmed.match(/^\*\*(.+?)\*\*/);
    if (headerMatch) {
      // Save previous section if it has content
      if (currentSection.length > 50) {
        chunks.push({
          content: currentSection.trim(),
          source: `${currentTitle} (Section ${sectionIndex})`,
        });
        sectionIndex++;
      }
      currentTitle = headerMatch[1].trim();
      currentSection = trimmed;
      continue;
    }

    // Add to current section
    currentSection += "\n" + trimmed;

    // If section gets too long, split it
    if (currentSection.length > 800) {
      chunks.push({
        content: currentSection.trim(),
        source: `${currentTitle} (Section ${sectionIndex})`,
      });
      sectionIndex++;
      currentSection = "";
    }
  }

  // Don't forget the last section
  if (currentSection.trim().length > 50) {
    chunks.push({
      content: currentSection.trim(),
      source: `${currentTitle} (Section ${sectionIndex})`,
    });
  }

  // If we got no chunks (very short document), use the whole thing
  if (chunks.length === 0 && text.trim().length > 0) {
    chunks.push({
      content: text.trim(),
      source: fileName,
    });
  }

  return chunks;
}
