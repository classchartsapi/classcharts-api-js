export function parseCookies(input: string) {
  const output: Record<string, unknown> = {};
  const cookies = input.split(",");
  for (const cookie of cookies) {
    const cookieSplit = cookie.split(";")[0].split("=");
    output[decodeURIComponent(cookieSplit[0])] = decodeURIComponent(
      cookieSplit[1]
    );
  }
  return output;
}
