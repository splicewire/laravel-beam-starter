import type {
    ContextManifest,
    FormMode,
    RouteContextEntry,
} from '@schemastud/frame';
import { useQuery } from '@tanstack/react-query';
import { jsonHeaders } from './xsrf';

/**
 * The four keys `GET /frame/manifest` emits. `resources` + `contexts` come from frame itself;
 * `nav` + `routeContext` are the projection `splicewire/laravel-beam-ux` contributes over this host's
 * own `config('frame.realms')` membership list.
 *
 * ⚠️ `routeContext[].routeName` values are CLIENT-router identities (`beam-ux-entry.index`), NOT
 * Laravel named routes. Do not hand one to a URL helper — the join from a name to a URL is
 * `RouteContextProjector::hrefs()` server-side and `nav[].href` on the wire.
 */
export interface ManifestResource {
    key: string;
    creatable: boolean;
    editable: boolean;
    deletable: boolean;
    showable: boolean;
    form?: FormMode;
    nav: {
        label: string;
        group: string | null;
        icon: string | null;
        section?: string | null;
    };
}

export interface FrameNavNode {
    kind: string;
    title: string;
    href: string | null;
    icon: string | null;
    routeName: string | null;
    locked: unknown;
    children: FrameNavNode[];
}

export interface FrameManifest {
    resources: ManifestResource[];
    contexts: Record<string, ContextManifest>;
    nav: { items: FrameNavNode[] };
    routeContext: RouteContextEntry[];
}

async function fetchManifest(): Promise<FrameManifest> {
    const res = await fetch('/frame/manifest', {
        headers: jsonHeaders(),
        credentials: 'same-origin',
    });

    if (!res.ok) {
        throw new Error(`manifest ${res.status}`);
    }

    const body = (await res.json()) as Partial<FrameManifest>;

    return {
        resources: body.resources ?? [],
        contexts: body.contexts ?? {},
        nav: body.nav ?? { items: [] },
        routeContext: body.routeContext ?? [],
    };
}

/** The registered-resource roster, the nav tree and the router table — one fetch, shared by all three. */
export function useFrameManifest() {
    return useQuery({
        queryKey: ['frame', 'manifest'],
        queryFn: fetchManifest,
        staleTime: 60_000,
    });
}

/** A resource's declared `form` mode, for the mount dispatcher's `formFor` lookup. */
export function formFromManifest(
    manifest: FrameManifest | undefined,
    resourceKey: string,
): FormMode | undefined {
    return manifest?.resources.find((r) => r.key === resourceKey)?.form;
}

/** The label a resource's nav seat declares, so a generic page can title itself without hardcoding. */
export function labelFromManifest(
    manifest: FrameManifest | undefined,
    resourceKey: string,
): string {
    return (
        manifest?.resources.find((r) => r.key === resourceKey)?.nav.label ??
        resourceKey
    );
}
