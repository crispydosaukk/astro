/**
 * Robust JSON parser specifically designed for LLM outputs.
 * Extracts JSON objects and arrays even if wrapped in markdown blocks,
 * accompanied by commentary, or slightly malformed with trailing commas.
 */
export function safeParseAIJson(raw: any): any {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw !== 'string') return null;

  const clean = raw.trim();

  // 1. Try direct parse first
  try {
    return JSON.parse(clean);
  } catch (e) {}

  // 2. Try to extract ```json ... ``` code blocks
  try {
    const jsonBlock = /```(?:json)?\s*([\s\S]*?)```/i.exec(clean);
    if (jsonBlock && jsonBlock[1]) {
      const candidate = jsonBlock[1].trim();
      try {
        return JSON.parse(candidate);
      } catch (err) {
        const withoutTrailingCommas = candidate.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(withoutTrailingCommas);
      }
    }
  } catch (e) {}

  // 3. Fallback: find first balanced JSON object in text
  const firstBrace = clean.indexOf('{');
  if (firstBrace >= 0) {
    let depth = 0;
    for (let i = firstBrace; i < clean.length; i++) {
      const ch = clean[i];
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      if (depth === 0) {
        const candidate = clean.slice(firstBrace, i + 1);
        try {
          return JSON.parse(candidate);
        } catch (e) {
          try {
            const withoutTrailingCommas = candidate.replace(/,\s*([}\]])/g, '$1');
            return JSON.parse(withoutTrailingCommas);
          } catch (e2) {
            break;
          }
        }
      }
    }
  }

  // 4. Balanced JSON array fallback
  const firstBracket = clean.indexOf('[');
  if (firstBracket >= 0) {
    let depth = 0;
    for (let i = firstBracket; i < clean.length; i++) {
      const ch = clean[i];
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      if (depth === 0) {
        const candidate = clean.slice(firstBracket, i + 1);
        try {
          return JSON.parse(candidate);
        } catch (e) {
          try {
            const withoutTrailingCommas = candidate.replace(/,\s*([}\]])/g, '$1');
            return JSON.parse(withoutTrailingCommas);
          } catch (e2) {
            break;
          }
        }
      }
    }
  }

  // 5. As a last resort, slice between first and last brace
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const slice = clean.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(slice);
    } catch (e) {
      try {
        const withoutTrailingCommas = slice.replace(/,\s*([}\]])/g, '$1');
        return JSON.parse(withoutTrailingCommas);
      } catch (e2) {}
    }
  }

  return null;
}
