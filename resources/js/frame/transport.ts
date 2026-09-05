// `FilterSchema` is re-exported by frame's own index precisely so a host wires against ONE import;
// `@schemastud/facets` is not a direct dependency here and importing from it would be reaching
// through frame into its internals.
import type {
    FilterSchema,
    FrameTransport,
    Paginated,
    Row,
} from '@schemastud/frame';
import type { SchemaNode } from '@schemastud/seam';
import { jsonHeaders } from './xsrf';

// ⚠️ These URLs are LITERALS and the mount they point at is CONFIG-DRIVEN (`config/frame.php` →
// route_prefix, `/frame` here — `php artisan route:list | grep frame`). Wayfinder is retired
// fleet-wide (beam-runbook ADR-0004), so nothing links these strings to that config: move the prefix
// and every call here 404s silently. If the frame console shows empty tables, diff these paths
// against `route:list` BEFORE looking anywhere else.
const FRAME = '/frame';

async function fetchJson<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, {
        method: 'GET',
        headers: jsonHeaders(),
        credentials: 'same-origin',
    });

    if (!res.ok) {
        throw new Error(`GET ${url} failed (${res.status})`);
    }

    return (await res.json()) as T;
}

async function writeJson<T = unknown>(
    method: string,
    url: string,
    body?: unknown,
): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: jsonHeaders(),
        credentials: 'same-origin',
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

    if (!res.ok) {
        throw new Error(`${method} ${url} failed (${res.status})`);
    }

    return (await res.json().catch(() => null)) as T;
}

/**
 * The {@link FrameTransport} over this host's Frame socket — the read/write envelopes
 * `Schemastud\Frame\Http\Controllers\FrameResourceController` emits: list → `{data,total,page,perPage}`,
 * show → `{data}`, schema → raw JSON Schema, delete → 204.
 */
export const frameTransport: FrameTransport = {
    async list(resource, params): Promise<Paginated<Row>> {
        const query = new URLSearchParams(params).toString();
        const listUrl = `${FRAME}/resources/${resource}`;
        const body = await fetchJson<Partial<Paginated<Row>>>(
            query ? `${listUrl}?${query}` : listUrl,
        );
        const rows = (body.data ?? []) as Row[];

        return {
            data: rows,
            total: body.total ?? rows.length,
            page: body.page ?? 1,
            perPage: body.perPage ?? (rows.length || 1),
        };
    },
    async get(resource, id): Promise<Row> {
        const body = await fetchJson<{ data: Row }>(
            `${FRAME}/resources/${resource}/records/${id}`,
        );

        return body.data;
    },
    async getFormSchema(resource): Promise<SchemaNode> {
        return fetchJson<SchemaNode>(`${FRAME}/resources/${resource}/schema`);
    },
    async save(resource, id, data): Promise<Row> {
        const body =
            id === null
                ? await writeJson<{ data: Row }>(
                      'POST',
                      `${FRAME}/resources/${resource}`,
                      data,
                  )
                : await writeJson<{ data: Row }>(
                      'PUT',
                      `${FRAME}/resources/${resource}/records/${id}`,
                      data,
                  );

        return body.data;
    },
    async remove(resource, id): Promise<void> {
        await writeJson(
            'DELETE',
            `${FRAME}/resources/${resource}/records/${id}`,
        );
    },

    getFilterSchema: (resource) =>
        fetchJson<{ data: FilterSchema }>(
            `${FRAME}/filter-schema/${resource}`,
        ).then((r) => r.data),
    getFilterOptions: (ref, search) =>
        fetchJson<{
            data: Awaited<ReturnType<FrameTransport['getFilterOptions']>>;
        }>(
            `${FRAME}/filter-options/${ref}${search ? `?search=${encodeURIComponent(search)}` : ''}`,
        ).then((r) => r.data ?? []),
    getSavedFilters: (resource) =>
        fetchJson<{
            data: Awaited<ReturnType<FrameTransport['getSavedFilters']>>;
        }>(`${FRAME}/saved-filters?resource=${resource}`).then(
            (r) => r.data ?? [],
        ),
    saveFilter: (resource, payload) =>
        writeJson<{ data: Awaited<ReturnType<FrameTransport['saveFilter']>> }>(
            'POST',
            `${FRAME}/saved-filters`,
            {
                resource,
                ...payload,
            },
        ).then((r) => r.data),
    deleteSavedFilter: (_resource, id) =>
        writeJson('DELETE', `${FRAME}/saved-filters/${id}`).then(
            () => undefined,
        ),
};
