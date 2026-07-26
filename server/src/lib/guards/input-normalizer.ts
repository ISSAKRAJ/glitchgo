/**
 * L0 / L2 / L12: Input Normalization Guard
 * 
 * Cleans user input before passing it to the AST Firewall or AI generation.
 * Strips zero-width characters, visual homoglyphs, and rejects heavy encoding attempts.
 */

// L12: Strip zero-width and invisible formatting characters
function stripInvisibleChars(text: string): string {
  // Matches Zero Width Space, Non-Joiner, Joiner, Word Joiner, Byte Order Mark, etc.
  return text.replace(/[\u200B-\u200D\uFEFF\u2060\u200E\u200F]/g, '');
}

// L12: Convert common Cyrillic/Greek homoglyphs back to Latin equivalents
function normalizeHomoglyphs(text: string): string {
  const homoglyphMap: Record<string, string> = {
    'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'х': 'x', 'у': 'y', 'і': 'i',
    'А': 'A', 'С': 'C', 'Е': 'E', 'О': 'O', 'Р': 'P', 'Х': 'X', 'У': 'Y', 'І': 'I'
  };
  return text.replace(/[асеорхуіАСЕОРХУІ]/g, (char) => homoglyphMap[char] || char);
}

// L2: Detect heavy encoding (hex/unicode) indicating evasion
function detectEncodingEvasion(text: string): { safe: boolean; reason?: string } {
  // Check for excessive hex (e.g. 0x27 0x4F 0x52)
  const hexPatternCount = (text.match(/0x[0-9a-fA-F]{2}/g) || []).length;
  if (hexPatternCount > 3) {
    return { safe: false, reason: 'Excessive hex encoding detected' };
  }

  // Check for excessive unicode escapes (e.g. \u0027\u004F\u0052)
  const unicodePatternCount = (text.match(/\\u[0-9a-fA-F]{4}/g) || []).length;
  if (unicodePatternCount > 3) {
    return { safe: false, reason: 'Excessive unicode escape sequences detected' };
  }

  // Check for excessive URL encoding of non-alphanumeric chars (e.g. %27%4F%52)
  const urlPatternCount = (text.match(/%[0-9a-fA-F]{2}/g) || []).length;
  if (urlPatternCount > 6) {
    return { safe: false, reason: 'Excessive URL encoding detected' };
  }

  return { safe: true };
}

// L0: Basic limits
function enforceBasicLimits(text: string): { safe: boolean; reason?: string } {
  if (text.length > 5000) {
    return { safe: false, reason: 'Input length exceeds 5000 characters' };
  }
  return { safe: true };
}

export function normalizeAndValidateInput(prompt: string): { safe: boolean; reason?: string; normalized: string } {
  let text = prompt || '';

  const limitCheck = enforceBasicLimits(text);
  if (!limitCheck.safe) return { safe: false, reason: limitCheck.reason, normalized: '' };

  text = stripInvisibleChars(text);
  text = normalizeHomoglyphs(text);

  const encodeCheck = detectEncodingEvasion(text);
  if (!encodeCheck.safe) {
    return { safe: false, reason: encodeCheck.reason, normalized: '' };
  }

  return { safe: true, normalized: text };
}
