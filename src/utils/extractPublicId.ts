export function extractPublicId(url: string): string | null {
  const regex = /\/v[0-9]+\/(.+?)\./;
  const match = url.match(regex);
  return match ? match[1] : null;
}
