// Shared CSRF/JSON header primitive for the Frame transport. Mirrors `editor/transport.ts`'s own
// csrfToken() reader (same Laravel XSRF-TOKEN cookie contract), kept local so the `frame/` seam has no
// dependency on the `editor/` one and vice versa — the same split rushing/splicewire made.
export function xsrfToken(): string | null {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : null;
}

export function jsonHeaders(): Record<string, string> {
    const token = xsrfToken();

    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...(token ? { 'X-XSRF-TOKEN': token } : {}),
    };
}
