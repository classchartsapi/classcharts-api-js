/**
 * Parse cookies from string
 * @param input Input string
 * @returns Object of cookies
 * @internal
 */
export function parseCookies(input: string) {
  const output: Record<string, unknown> = {};
  const cookies = input.split(",");
  for (const cookie of cookies) {
    const cookieSplit = cookie.split(";")[0].split("=");
    output[leftTrim(decodeURIComponent(cookieSplit[0]))] = decodeURIComponent(
      cookieSplit[1]
    );
  }
  return output;
}

function leftTrim(str: string) {
  if (!str) return str;
  return str.replace(/^\s+/g, "");
}
