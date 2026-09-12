// GitHub blob shas are SHA-1 of "blob <byte length>\0<content>", not a plain hash of the content.
export async function computeGitBlobSha(content: string): Promise<string> {
    const contentBytes = new TextEncoder().encode(content);
    const header = new TextEncoder().encode(`blob ${contentBytes.length}\0`);
    const blob = new Uint8Array(header.length + contentBytes.length);
    blob.set(header);
    blob.set(contentBytes, header.length);
    const hash = await crypto.subtle.digest('SHA-1', blob);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}