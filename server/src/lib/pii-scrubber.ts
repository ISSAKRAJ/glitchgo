/**
 * AdminZero PII Scrubber
 * Detects and masks Personally Identifiable Information before it reaches any LLM.
 * Supports Indian PII (Aadhaar, PAN, UPI) + international formats.
 */

interface PIIPattern {
  type: string;
  regex: RegExp;
  mask: string;
}

const PII_PATTERNS: PIIPattern[] = [
  // Email addresses
  { type: 'EMAIL', regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, mask: '[EMAIL]' },
  // Indian mobile numbers (10-digit, with/without +91)
  { type: 'PHONE_IN', regex: /(?:\+91[\s\-]?)?[6-9]\d{9}/g, mask: '[PHONE]' },
  // International phone numbers
  { type: 'PHONE_INTL', regex: /\+?[1-9]\d{1,14}(?:[\s\-]\d{1,4}){1,4}/g, mask: '[PHONE]' },
  // Aadhaar number (12 digits, may have spaces)
  { type: 'AADHAAR', regex: /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g, mask: '[AADHAAR]' },
  // PAN card (Indian tax ID)
  { type: 'PAN', regex: /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, mask: '[PAN]' },
  // UPI ID
  { type: 'UPI', regex: /[a-zA-Z0-9._\-]+@[a-zA-Z]{3,}/g, mask: '[UPI_ID]' },
  // Credit/Debit card numbers (13-19 digits, may have spaces/dashes)
  { type: 'CARD', regex: /\b(?:\d{4}[\s\-]?){3}\d{4}\b/g, mask: '[CARD_NUMBER]' },
  // CVV (3-4 digits near "cvv" or "cvc")
  { type: 'CVV', regex: /(?:cvv|cvc|security code)[\s:]*\d{3,4}/gi, mask: '[CVV]' },
  // IFSC code (Indian bank)
  { type: 'IFSC', regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g, mask: '[IFSC]' },
  // Bank account numbers (9-18 digits)
  { type: 'BANK_ACC', regex: /\baccount[\s#:]*(\d{9,18})\b/gi, mask: '[ACCOUNT_NUMBER]' },
  // IP addresses
  { type: 'IP', regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g, mask: '[IP_ADDRESS]' },
  // Passwords (near "password" keyword)
  { type: 'PASSWORD', regex: /(?:password|passwd|pwd)[\s:=]+\S+/gi, mask: '[PASSWORD]' },
  // API keys / tokens (long alphanumeric strings)
  { type: 'API_KEY', regex: /(?:api[_\-]?key|secret|token|bearer)[\s:=]+[A-Za-z0-9\-_\.]{16,}/gi, mask: '[API_KEY]' },
  // Social Security Number (US)
  { type: 'SSN', regex: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g, mask: '[SSN]' },
  // Passport numbers (basic pattern)
  { type: 'PASSPORT', regex: /\b[A-Z]{1,2}\d{6,9}\b/g, mask: '[PASSPORT]' },
  // GPS coordinates
  { type: 'GPS', regex: /[-+]?\d{1,3}\.\d{4,},\s*[-+]?\d{1,3}\.\d{4,}/g, mask: '[GPS_COORDS]' },
];

export interface PIIResult {
  sanitized: string;
  detectedTypes: string[];
  count: number;
}

/**
 * Scrubs PII from a text string.
 * @param text - Raw input text
 */
export function scrubPII(text: string): PIIResult {
  if (!text || typeof text !== 'string') return { sanitized: text, detectedTypes: [], count: 0 };

  let sanitized = text;
  const detectedTypes = new Set<string>();
  let count = 0;

  for (const { type, regex, mask } of PII_PATTERNS) {
    const resetRegex = new RegExp(regex.source, regex.flags);
    const matches = sanitized.match(resetRegex);
    if (matches && matches.length > 0) {
      detectedTypes.add(type);
      count += matches.length;
      sanitized = sanitized.replace(resetRegex, mask);
    }
  }

  return {
    sanitized,
    detectedTypes: [...detectedTypes],
    count
  };
}

/**
 * Checks if text contains PII without modifying it.
 * @param text
 */
export function containsPII(text: string): boolean {
  if (!text) return false;
  return PII_PATTERNS.some(({ regex }) => {
    const r = new RegExp(regex.source, regex.flags);
    return r.test(text);
  });
}
