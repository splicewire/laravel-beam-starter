import { Link, router } from '@inertiajs/react';
import {
    buildRealmRoutes,
    createGuardRegistry,
    createMountDispatcher,
    createRouteRegistry,
    ListShell,
} from '@schemastud/frame';
import type { RealmRouteObject, RouteContextEntry } from '@schemastud/frame';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useParams, useRoutes } from 'react-router';
import { frameIcon } from './icons';
import type { FrameManifest, FrameNavNode } from './manifest';
import { formFromManifest, labelFromManifest } from './manifest';

/**
 * The tenant realm's CLIENT router — the half `/frame/manifest`'s `routeContext` has always been
 * emitted for and that this host never wired.
 *
 * ## What binds a route to a component
 *
 * Almost nothing hand-written. Every leaf resolves through `createMountDispatcher`, which reads the
 * leaf's DECLARED `mounts` verb (`list` / `edit` / `detail` / `widget`) and mounts the matching
 * resource shell — so a new `#[ParticleResource]` this host places in `config('frame.realms')` gets a
 * routed, rendered surface with ZERO edits here.
 *
 * The one exception is `mounts: 'list'`, registered through `registerRoute()` — the per-route OVERRIDE
 * the registry is documented to be, consulted BEFORE the dispatcher. The generic dispatcher mounts a
 * `ListShell` with no `onOpen`, which is correct for a foundation that owns no router but leaves every
 * row inert; the override supplies the one thing only a host knows — where a record's own route lives —
 * and is otherwise resource-blind (columns and affordances still come from the manifest).
 *
 * ## react-router MATCHES; Inertia NAVIGATES
 *
 * The router is mounted for its matcher and its `:id` params only. Every nav link and row-open goes
 * through Inertia, because the server serves this same page component for all tenant frame paths: a
 * click is one Inertia visit, the page swaps, and `useRoutes` re-matches the new `window.location`.
 * Driving react-router's own history as well would put two routers on one history stack and make
 * back/forward a coin flip.
 *
 * ## `assertRouteContext` is deliberately NOT called with its default
 *
 * Its default `unbound: 'throw'` is the right invariant for a host that hand-binds every route. Here an
 * unbound name is the ORDINARY case, so throwing would take the whole realm down at boot for leaves
 * that render fine. Declines surface through `onDecline` / `onUnbound` in dev, and a declined leaf
 * renders a component that NAMES the reason — a decline must never be a blank screen.
 */

const isDev = (): boolean => Boolean(import.meta.env.DEV);

/** A hand-written section landing: a nav parent (`/authoring`, `/ops`) has no routeContext leaf. */
function SectionIndex({ node }: { node: FrameNavNode }) {
    return (
        <div className="px-6 py-8">
            <h1 className="mb-1 text-2xl font-semibold">{node.title}</h1>
            <p className="mb-6 text-sm text-muted-foreground">
                {node.children.length}{' '}
                {node.children.length === 1 ? 'surface' : 'surfaces'} in this
                section.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {node.children.map((child) => {
                    const Icon = frameIcon(child.icon);

                    return child.href ? (
                        <Link
                            key={child.href}
                            href={child.href}
                            className="flex items-center gap-3 rounded-lg border p-4 text-sm transition-colors hover:bg-accent"
                        >
                            <Icon className="size-4 text-muted-foreground" />
                            <span className="font-medium">{child.title}</span>
                        </Link>
                    ) : null;
                })}
            </div>
        </div>
    );
}

function NotFound() {
    return (
        <div className="px-6 py-8">
            <h1 className="mb-1 text-2xl font-semibold">No surface here</h1>
            <p className="text-sm text-muted-foreground">
                This path is served by the tenant frame console, but the
                manifest declares no route for it.
            </p>
        </div>
    );
}

/** A leaf the dispatcher declined — named, not blank. */
function Undispatchable({
    entry,
    reason,
}: {
    entry: RouteContextEntry;
    reason: string;
}) {
    return (
        <div className="px-6 py-8">
            <h1 className="mb-1 text-2xl font-semibold">{entry.routeName}</h1>
            <p className="max-w-prose text-sm text-muted-foreground">
                The manifest declares this route (
                <code>mounts: {String(entry.mounts)}</code>) and the generic
                mount dispatcher cannot render it: {reason}
            </p>
        </div>
    );
}

/** Names a generic leaf. The shells render a bare table/form; without this nothing on screen says what it is. */
function Titled({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="px-6 py-8">
            <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
            {children}
        </div>
    );
}

export function FrameRoutes({ manifest }: { manifest: FrameManifest }) {
    const routes = useMemo<RealmRouteObject[]>(() => {
        const declined = new Map<string, string>();

        const dispatch = createMountDispatcher({
            // A hook, called during the dispatched component's render — exactly how the dispatcher
            // documents this seam, and the only reason it can stay react-router-free.
            // eslint-disable-next-line react-hooks/rules-of-hooks
            resolveId: () => useParams().id ?? null,
            manifestFor: (resource) => manifest.contexts[resource],
            formFor: (resource) => formFromManifest(manifest, resource),
            onDecline: (entry, reason) => {
                declined.set(entry.routeName, reason);

                if (isDev()) {
                    console.warn(
                        `[frame] declined "${entry.routeName}" (${entry.path}): ${reason}`,
                    );
                }
            },
        });

        // The list OVERRIDE, registered per list leaf: resource-blind, and supplying only the record
        // route the foundation cannot know.
        const routeRegistry = createRouteRegistry();

        for (const entry of manifest.routeContext) {
            if (entry.mounts !== 'list' || !entry.resource) {
                continue;
            }

            const resource = entry.resource;
            const twin = manifest.routeContext.find(
                (candidate) =>
                    candidate.resource === resource &&
                    candidate.path.endsWith('/:id'),
            );
            const recordBase = twin
                ? `/${twin.path.replace(/\/:id$/, '')}`
                : null;

            routeRegistry.registerRoute(entry.routeName, () => (
                <ListShell
                    resource={resource}
                    columns={[]}
                    manifest={manifest.contexts[resource]}
                    onOpen={
                        recordBase
                            ? (record) =>
                                  router.visit(
                                      `${recordBase}/${String(record.id)}`,
                                  )
                            : undefined
                    }
                    slots={{ Filters: () => null }}
                />
            ));
        }

        const generated = buildRealmRoutes(manifest.routeContext, {
            routes: routeRegistry,
            guards: createGuardRegistry(),
            fallback: (entry) => {
                const Component = dispatch(entry);

                if (!Component) {
                    const reason =
                        declined.get(entry.routeName) ?? 'no reason reported';

                    return () => (
                        <Undispatchable entry={entry} reason={reason} />
                    );
                }

                return Component;
            },
            onUnbound: (entry) => {
                if (isDev()) {
                    console.warn(
                        `[frame] no component for "${entry.routeName}" (${entry.path})`,
                    );
                }
            },
        });

        // Wrap every generated leaf in its manifest-declared heading.
        const byPath = new Map(
            manifest.routeContext.map((entry) => [entry.path, entry]),
        );
        const titled = generated.map((leaf) => {
            const entry = byPath.get(leaf.path);
            const title = entry?.resource
                ? labelFromManifest(manifest, entry.resource)
                : (entry?.routeName ?? leaf.path);

            return {
                ...leaf,
                element: <Titled title={title}>{leaf.element}</Titled>,
            };
        });

        // The HAND-WRITTEN half. `routeContext` is flat by hard guardrail and carries resource leaves
        // only; a nav SECTION parent is a nav seat with no route leaf behind it, so its landing lives
        // here — which is where the projector documents such routes belong.
        const sections: RealmRouteObject[] = manifest.nav.items
            .filter(
                (item): item is FrameNavNode & { href: string } =>
                    typeof item.href === 'string',
            )
            .map((item) => ({
                path: item.href.replace(/^\//, ''),
                element: <SectionIndex node={item} />,
            }));

        return [...sections, ...titled, { path: '*', element: <NotFound /> }];
    }, [manifest]);

    return useRoutes(routes);
}
