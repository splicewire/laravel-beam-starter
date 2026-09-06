// beam-starter · os — the OPERATOR META-EDITOR OVERLAY.
//
// You browse the LIVE site/app normally (every real page renders underneath, scrolls, and is fully
// interactive), and as an `os.enter` principal you get a floating window layer ON TOP: a start-menu
// launcher whose items are the operator tools. "Edit this page" flips the current page's MainframeHost
// into its in-place editor. Mounted on every authed page by `OsLayout` for an entitled principal.
//
// The DESK ITSELF is now `@splicewire/beam-ux/desk` — the chrome, the window resolution, the taskbar,
// the start menu and the `beam-ux:mode`/`:edit`/`:exit` contract all live there, having been the same
// ~240 lines in five host copies. What remains here is the genuinely host-specific residue, and it is
// four things:
//
//   1. THE TOOL ROSTER. This host has no Customers/Reports back-office tools — a single operator
//      surface, the stats dashboard.
//   2. THE INERTIA WIRING. beam-ux imports no router by design (its own import-boundary gate enforces
//      it), so `usePage()`, `router.post('/logout')` and the `router.on('before', …)` GET-cancel are
//      supplied from here.
//   3. THE PAGE-PROPERTIES BODY. `./page-properties.tsx` is genuinely divergent across hosts (this
//      one is presentational; audiostud's is a live form against `/beam/ux/meta`), so it stays local
//      behind `renderPageProperties`.
//   4. THE BRAND. A package ships no wordmark — `BeamMark` and the "beam" label are ours.
import { router, usePage } from '@inertiajs/react';
import { OperatorDesk as Desk } from '@splicewire/beam-ux/desk';
import type { OperatorTool } from '@splicewire/beam-ux/desk';
import { Suspense, lazy } from 'react';
import { PageProperties } from '@/os/page-properties';

// Lazy, not static - os/shell-config.tsx's own docblock already flags why: a page component ALSO
// statically imported elsewhere gets merged into that importer's chunk by Rollup instead of getting its
// own Vite-manifest entry, 500ing a direct visit to that page's real route ("Unable to locate file in
// Vite manifest"). Confirmed live against this exact file before switching to lazy(). This is also why
// `OperatorTool.render` is a THUNK the host supplies and never a page the package imports.
const OperatorDashboard = lazy(() => import('@/pages/operator/dashboard'));

// `OperatorDashboard`'s own props are optional (renders with sensible fallbacks) precisely so it can
// mount standalone in a float, with no Inertia route props threaded in.
const TOOLS: OperatorTool[] = [
    {
        key: 'dashboard',
        title: 'Dashboard',
        accent: '#4B5563',
        render: () => (
            <Suspense
                fallback={
                    <div className="p-6 text-sm text-slate-500">Loading…</div>
                }
            >
                <OperatorDashboard />
            </Suspense>
        ),
        size: { width: 720, height: 560 },
    },
];

// The beam mark — same glyph as splicewire's `@/components/app-logo-icon`, inlined so the accent node
// rides `--beam-accent` rather than that component's own hardcoded fill. This host has no
// brand-tokens.css of its own (that's splicewire.test's), so it leans on the package's fallback chain
// (`var(--op-*, var(--beam-*, <literal>))`): the desk looks right out of the box, and gets live-themed
// for free the moment this project defines its own `--beam-*` tokens — or re-skinned wholesale by
// defining `--op-*`.
function BeamMark({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M3 7 C9 7 10 12 14 12 M3 17 C9 17 10 12 14 12 M14 12 H21"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
            />
            <circle cx="3" cy="7" r="1.6" fill="currentColor" />
            <circle cx="3" cy="17" r="1.6" fill="currentColor" />
            <circle
                cx="14"
                cy="12"
                r="2.7"
                fill="var(--beam-accent, #00b3c8)"
            />
        </svg>
    );
}

export default function OperatorDesk() {
    const component = usePage().component;

    return (
        <Desk
            tools={TOOLS}
            inControlPanel={!!component?.startsWith('operator/')}
            orbLabel="Operator"
            orbIcon={<BeamMark className="mark" />}
            brand={{
                mark: <BeamMark className="op-menu-brand-mark" />,
                label: 'beam',
            }}
            links={{
                frontend: { href: '/' },
                control: { href: '/operator' },
                signOut: () => router.post('/logout'),
            }}
            // "Edit this page" opens the PAGE PROPERTIES float for the current slug (keyed
            // `page:{slug}` by the desk) — its own dock item, same as every other tool window.
            // `close()` MINIMIZES it, which is the handoff into the in-place editor: you leave the
            // editor and the page's properties are still docked.
            renderPageProperties={({ slug, editable, editing, close }) => (
                <PageProperties
                    slug={slug}
                    editable={editable}
                    editing={editing}
                    onEditContent={() => {
                        close();
                        window.dispatchEvent(new CustomEvent('beam-ux:edit'));
                    }}
                    onExitContent={() =>
                        window.dispatchEvent(new CustomEvent('beam-ux:exit'))
                    }
                />
            )}
            // Nav suppression: a click inside a float window that would trigger a full-page GET visit
            // is CANCELLED so the live backdrop isn't yanked away. Only GET *navigations* are
            // suppressed; POST/PUT/DELETE ACTIONS still go through. The desk arms the flag on each
            // window-body click; the cancel needs the router, so it lives here.
            navGuard={({ shouldSuppress, disarm }) =>
                router.on('before', (event) => {
                    const method = (
                        (event as CustomEvent<{ visit?: { method?: string } }>)
                            .detail?.visit?.method ?? 'get'
                    ).toLowerCase();

                    if (shouldSuppress() && method === 'get') {
                        disarm();

                        return false; // cancel the visit — keep the backdrop put
                    }
                })
            }
        />
    );
}
