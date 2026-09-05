import { useCallback, useState } from 'react';

/**
 * frame/facets' URL-state seam. Reads page/per_page/sort/filter off `URLSearchParams` and writes them
 * back through `history.replaceState`, so a list's pagination/sort survives a reload without
 * triggering either an Inertia visit or a react-router navigation — list rows come from the Frame JSON
 * socket via react-query, not from a page reload.
 */
export function useFrameUrlState(): readonly [
    URLSearchParams,
    (updater: (prev: URLSearchParams) => URLSearchParams) => void,
] {
    const [params, setParams] = useState<URLSearchParams>(
        () =>
            new URLSearchParams(
                typeof window !== 'undefined' ? window.location.search : '',
            ),
    );

    const update = useCallback(
        (updater: (prev: URLSearchParams) => URLSearchParams) => {
            setParams((prev) => {
                const next = updater(new URLSearchParams(prev));

                if (typeof window !== 'undefined') {
                    const query = next.toString();
                    const url = query
                        ? `${window.location.pathname}?${query}`
                        : window.location.pathname;
                    window.history.replaceState(window.history.state, '', url);
                }

                return next;
            });
        },
        [],
    );

    return [params, update] as const;
}
