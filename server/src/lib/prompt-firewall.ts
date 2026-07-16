/**
 * AdminZero Prompt Injection Firewall
 * Detects and blocks prompt injection / jailbreak attempts before they reach any LLM.
 * Protects against OWASP LLM01: Prompt Injection.
 */

interface InjectionPattern {
  type: string;
  pattern: RegExp;
}

// Patterns that indicate a prompt injection attempt
const INJECTION_PATTERNS: InjectionPattern[] = [
  // Instruction override attempts
  { type: 'INSTRUCTION_OVERRIDE', pattern: /ignore\s+(all\s+)?(previous|prior|above|earlier|former)\s+instructions?/i },
  { type: 'INSTRUCTION_OVERRIDE', pattern: /disregard\s+(all\s+)?(previous|prior|above)\s+instructions?/i },
  { type: 'INSTRUCTION_OVERRIDE', pattern: /forget\s+(everything|all|your|the)\s+(you.ve\s+been|previous|prior|above)/i },
  { type: 'INSTRUCTION_OVERRIDE', pattern: /override\s+(your\s+)?(system|previous|all)\s+(prompt|instructions?|rules?|constraints?)/i },

  // Role/identity attacks
  { type: 'ROLE_HIJACK', pattern: /you\s+are\s+now\s+(a|an|the)\s+(different|new|unrestricted|evil|jailbroken)/i },
  { type: 'ROLE_HIJACK', pattern: /act\s+as\s+(if\s+you\s+are\s+)?(a|an)\s+(different|unrestricted|unfiltered|evil)/i },
  { type: 'ROLE_HIJACK', pattern: /pretend\s+(you\s+are|to\s+be)\s+(a|an)\s*(different|unrestricted|evil|hacker)/i },
  { type: 'ROLE_HIJACK', pattern: /your\s+(true|real|actual)\s+(self|identity|purpose|goal)\s+is/i },
  { type: 'ROLE_HIJACK', pattern: /jailbreak|DAN\s+mode|developer\s+mode|god\s+mode|unfiltered\s+mode/i },

  // System prompt extraction
  { type: 'SYSTEM_LEAK', pattern: /reveal\s+(your|the)\s+(system\s+prompt|instructions?|rules?|constraints?)/i },
  { type: 'SYSTEM_LEAK', pattern: /show\s+me\s+(your|the)\s+(system\s+prompt|hidden\s+instructions?|context)/i },
  { type: 'SYSTEM_LEAK', pattern: /what\s+(are|were)\s+your\s+(original\s+)?(instructions?|system\s+prompt|rules?)/i },
  { type: 'SYSTEM_LEAK', pattern: /print\s+(your\s+)?(system\s+)?prompt|output\s+your\s+instructions?/i },

  // SQL injection via natural language
  { type: 'SQL_INJECTION_NL', pattern: /drop\s+(?:all\s+)?(?:the\s+)?(?:tables?|database|schema)/i },
  { type: 'SQL_INJECTION_NL', pattern: /delete\s+(?:all\s+)?(?:the\s+)?(?:data|records?|rows?|entries|everything)/i },
  { type: 'SQL_INJECTION_NL', pattern: /truncate\s+(?:all\s+)?(?:the\s+)?tables?/i },
  { type: 'SQL_INJECTION_NL', pattern: /give\s+me\s+access\s+to\s+(all|admin|root|superuser)/i },

  // Data exfiltration
  { type: 'DATA_EXFIL', pattern: /send\s+(all|this)\s+(data|results?|output)\s+to\s+(http|https|ftp|email)/i },
  { type: 'DATA_EXFIL', pattern: /upload\s+(the\s+)?(data|results?|database)\s+to/i },
  { type: 'DATA_EXFIL', pattern: /exfiltrate|extract\s+all\s+(user|customer|password|credentials?)/i },

  // Credential/secret access
  { type: 'CREDENTIAL_ACCESS', pattern: /show\s+(me\s+)?(all\s+)?(passwords?|credentials?|api\s+keys?|secrets?|tokens?)/i },
  { type: 'CREDENTIAL_ACCESS', pattern: /list\s+(all\s+)?(admin|root|superuser)\s+(users?|accounts?|passwords?)/i },
  { type: 'CREDENTIAL_ACCESS', pattern: /access\s+(the\s+)?(admin|root|master|superuser)\s+(account|credentials?)/i },

  // Encoded/obfuscated injections
  { type: 'ENCODED_ATTACK', pattern: /base64|hex\s+encoded|url\s+encoded|unicode\s+escape/i },
  { type: 'ENCODED_ATTACK', pattern: /\beval\b|\bexec\b|\bsystem\b|\bshell\b/i },

  // Multi-language attacks
  { type: 'MULTILANG', pattern: /ignorez\s+les|ignorar\s+las|инструкции|指令|忽略/i },
];

// Severity mapping
const SEVERITY: Record<string, string> = {
  INSTRUCTION_OVERRIDE: 'HIGH',
  ROLE_HIJACK: 'HIGH',
  SYSTEM_LEAK: 'MEDIUM',
  SQL_INJECTION_NL: 'CRITICAL',
  DATA_EXFIL: 'CRITICAL',
  CREDENTIAL_ACCESS: 'HIGH',
  ENCODED_ATTACK: 'HIGH',
  MULTILANG: 'MEDIUM',
};

export interface Threat {
  type: string;
  severity: string;
  match: string;
}

export interface PromptScanResult {
  safe: boolean;
  threats: Threat[];
  riskScore: number;
}

/**
 * Scans a prompt for injection attempts.
 * @param prompt - Raw user prompt
 */
export function scanPrompt(prompt: string): PromptScanResult {
  if (!prompt || typeof prompt !== 'string') {
    return { safe: true, threats: [], riskScore: 0 };
  }

  const threats: Threat[] = [];

  for (const { type, pattern } of INJECTION_PATTERNS) {
    const match = prompt.match(pattern);
    if (match) {
      threats.push({
        type,
        severity: SEVERITY[type] || 'MEDIUM',
        match: match[0].substring(0, 60) // truncate for logging
      });
    }
  }

  // Risk score: CRITICAL=10, HIGH=5, MEDIUM=2 per threat
  const scoreMap: Record<string, number> = { CRITICAL: 10, HIGH: 5, MEDIUM: 2 };
  const riskScore = threats.reduce((acc, t) => acc + (scoreMap[t.severity] || 2), 0);

  return {
    safe: threats.length === 0,
    threats,
    riskScore
  };
}

/**
 * Quick check — returns true if prompt is safe, false if injection detected.
 * @param prompt
 */
export function isPromptSafe(prompt: string): boolean {
  return scanPrompt(prompt).safe;
}
