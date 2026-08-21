const whitespace = /\s+/g;

export function sanitizeSingleLineText(value: string): string {
  return stripControlCharacters(value).replace(whitespace, " ").trim();
}

export function sanitizeMultilineText(value: string): string {
  return stripControlCharacters(value, true)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .trim();
}

export function sanitizeEmail(value: string): string {
  return sanitizeSingleLineText(value).toLowerCase();
}

export function sanitizeName(value: string): string {
  return sanitizeSingleLineText(value).replace(/\d/g, "");
}

export function sanitizePhone(value: string): string {
  return sanitizeSingleLineText(value).replace(/[^0-9+() -]/g, "");
}

function stripControlCharacters(value: string, allowLineBreaks = false): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      if (allowLineBreaks && (code === 9 || code === 10 || code === 13)) {
        return true;
      }

      return code > 31 && code !== 127;
    })
    .join("");
}
