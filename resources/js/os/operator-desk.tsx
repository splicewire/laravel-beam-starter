// beam-starter · os — the OPERATOR META-EDITOR OVERLAY, ported from rushing/audiostud's own
// resources/js/os/operator-desk.tsx (same architecture, same shared `@schemastud/mainframe/os`
// `<OperatorOverlay>` machinery, same `beam-ux:mode`/`beam-ux:edit`/`beam-ux:exit` event contract —
// all package-level, host-agnostic; see `@splicewire/beam-mainframe`'s `host.tsx`).
//
// You browse the LIVE site/app normally (every real page renders underneath, scrolls, and is fully
// interactive), and as an `os.enter` principal you get a floating window layer ON TOP: a start-menu
// launcher whose items are the operator tools. "Edit this page" flips the current page's MainframeHost
// into its in-place editor. Mounted on every authed page by `OsLayout` for an entitled principal.
//
// Deliberately narrower than audiostud's version: this host has no Customers/Reports back-office tools
// (single operator surface — the stats dashboard) and no PageProperties float (no per-page metadata
// surface exists here yet) — "Edit this page" dispatches `beam-ux:edit`/`beam-ux:exit` DIRECTLY instead
// of opening an intermediate properties window. Add PageProperties + more tools here if/when this host
// grows them, matching audiostud's shape then.
import { router, usePage } from '@inertiajs/react';
import { OperatorOverlay } from '@schemastud/mainframe/os';
import type { OverlayWindow, WindowManager } from '@schemastud/mainframe/os';
import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// Lazy, not static - os/shell-config.tsx's own docblock already flags why: a page component ALSO
// statically imported elsewhere gets merged into that importer's chunk by Rollup instead of getting its
// own Vite-manifest entry, 500ing a direct visit to that page's real route ("Unable to locate file in
// Vite manifest"). Confirmed live against this exact file before switching to lazy().
const OperatorDashboard = lazy(() => import('@/pages/operator/dashboard'));

// A launchable operator tool: opens as a nested float rendering the REAL back-office component.
// `OperatorDashboard`'s own props are optional (renders with sensible fallbacks) precisely so it can
// mount standalone in a float, with no Inertia route props threaded in.
type Tool = {
    key: string;
    title: string;
    accent: string;
    render: () => ReactNode;
    size: { width: number; height: number };
};

const TOOLS: Tool[] = [
    {
        key: 'dashboard',
        title: 'Dashboard',
        accent: '#4B5563',
        render: () => (
            <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading…</div>}>
                <OperatorDashboard />
            </Suspense>
        ),
        size: { width: 720, height: 560 },
    },
];

function resolveWindow(key: string): OverlayWindow | null {
    const tool = TOOLS.find((t) => t.key === key);

    return tool ? { title: tool.title, accent: tool.accent, render: tool.render } : null;
}

const OP_DESK_CSS = `
.op-desk-overlay{position:fixed;inset:0;z-index:2000;pointer-events:none;font-family:system-ui,sans-serif}
.op-desk-overlay > *{pointer-events:auto}
.op-win-inner{display:flex;flex-direction:column;height:100%;background:#f8fafc;border:1px solid rgba(15,23,42,.14);border-radius:12px;box-shadow:0 30px 90px -24px rgba(0,0,0,.5);overflow:hidden}
.op-win-bar{display:flex;align-items:center;gap:9px;height:38px;flex:none;padding:0 12px;background:#0f172a;color:#f8fafc;cursor:move;user-select:none}
.op-win-dot{width:10px;height:10px;border-radius:30%;flex:none}
.op-win-title{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.op-win-ctrls{margin-left:auto;display:flex;align-items:center;gap:1px}
.op-win-x{background:none;border:none;color:#94a3b8;font-size:16px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:6px;display:flex;align-items:center;justify-content:center;min-width:28px}
.op-win-x:hover{color:#fff;background:rgba(255,255,255,.1)}
.op-win-x.on{color:#0f172a}
.op-win-body{flex:1;min-height:0;overflow:auto;background:#f8fafc;color:#0f172a}
.op-orb{position:absolute;right:16px;bottom:16px;display:flex;align-items:center;gap:9px;padding:9px 15px;border-radius:13px;border:1px solid rgba(255,255,255,.1);background:rgba(15,23,42,.94);backdrop-filter:blur(14px);color:#fff;cursor:pointer;font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;box-shadow:0 18px 55px -14px rgba(0,0,0,.6)}
.op-orb:hover{border-color:rgba(15,23,42,.5)}
.op-orb.is-open{border-color:rgba(15,23,42,.6);background:#1e293b}
.op-orb .mark{width:16px;height:16px;border-radius:23%;background:#0f172a;flex:none}
.op-scrim{position:absolute;inset:0;background:transparent}
.op-menu{position:absolute;right:16px;bottom:66px;width:240px;padding:7px;border-radius:14px;border:1px solid rgba(255,255,255,.1);background:rgba(15,23,42,.97);backdrop-filter:blur(16px);box-shadow:0 26px 70px -18px rgba(0,0,0,.65);display:flex;flex-direction:column;gap:2px}
.op-menu .head{padding:8px 10px 6px;color:#94a3b8;font-family:ui-monospace,monospace;font-size:9px;letter-spacing:.18em;text-transform:uppercase}
.op-menu button,.op-menu a{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:9px 11px;border-radius:9px;border:none;background:none;color:#e2e8f0;cursor:pointer;font:inherit;font-size:13px;text-decoration:none}
.op-menu button:hover,.op-menu a:hover{background:rgba(255,255,255,.07);color:#fff}
.op-menu button.active{color:#fff;background:rgba(15,23,42,.4)}
.op-menu .glyph{width:10px;height:10px;border-radius:30%;flex:none}
.op-menu .ico{width:16px;text-align:center;flex:none;opacity:.85}
.op-menu .op-div{height:1px;background:rgba(255,255,255,.1);margin:5px 4px}
.op-menu .muted{color:#94a3b8}
`;

function StartMenu({
    openKeys,
    inOperator,
    editing,
    pageEditable,
    onEditToggle,
    onOpenTool,
    onClose,
}: {
    openKeys: string[];
    inOperator: boolean;
    editing: boolean;
    pageEditable: boolean;
    onEditToggle: () => void;
    onOpenTool: (tool: Tool) => void;
    onClose: () => void;
}) {
    return (
        <>
            <div className="op-scrim" onClick={onClose} />
            <div className="op-menu" role="menu">
                <div className="head">Operator</div>
                <button
                    type="button"
                    className={editing ? 'active' : undefined}
                    onClick={() => {
                        onClose();
                        onEditToggle();
                    }}
                >
                    <span className="ico">{editing ? '✕' : '✎'}</span>
                    {editing ? 'Exit editing' : 'Edit this page'}
                    {!editing && !pageEditable ? (
                        <span className="muted" style={{ marginLeft: 'auto', fontSize: 11 }}>n/a</span>
                    ) : null}
                </button>
                <div className="op-div" />
                {TOOLS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        className={openKeys.includes(t.key) ? 'active' : undefined}
                        onClick={() => {
                            onOpenTool(t);
                            onClose();
                        }}
                    >
                        <span className="glyph" style={{ background: t.accent }} />
                        {t.title}
                        {openKeys.includes(t.key) ? <span className="muted" style={{ marginLeft: 'auto', fontSize: 11 }}>open</span> : null}
                    </button>
                ))}
                <div className="op-div" />
                <a href="/os">
                    <span className="ico">▦</span> OS Desktop
                </a>
                {inOperator ? (
                    <a href="/">
                        <span className="ico">◱</span> Front-end
                    </a>
                ) : (
                    <a href="/operator">
                        <span className="ico">▤</span> Control Panel
                    </a>
                )}
                <button type="button" onClick={() => router.post('/logout')}>
                    <span className="ico">⏻</span> Sign out
                </button>
            </div>
        </>
    );
}

export default function OperatorDesk() {
    const component = usePage().component;
    const inOperator = !!component?.startsWith('operator/');

    // The page's MainframeHost broadcasts its mode + editability + current entry slug via `beam-ux:mode`
    // (the shared `@splicewire/beam-mainframe` factory's own contract - identical on every host); we
    // track those so the start menu knows whether the page is editable and whether editing is active.
    const [editing, setEditing] = useState(false);
    const [pageEditable, setPageEditable] = useState(false);
    useEffect(() => {
        const onMode = (e: Event) => {
            const d = (e as CustomEvent<{ mode?: string; editable?: boolean }>).detail ?? {};
            setEditing(d.mode === 'window');
            setPageEditable(!!d.editable);
        };
        window.addEventListener('beam-ux:mode', onMode);

        return () => window.removeEventListener('beam-ux:mode', onMode);
    }, []);

    // Nav suppression: a click inside a float window that would trigger a full-page GET visit is
    // CANCELLED so the live backdrop isn't yanked away. Only GET *navigations* are suppressed; POST/PUT/
    // DELETE ACTIONS still go through. Armed on each window-body click, cleared shortly after.
    const suppressNextNav = useRef(false);
    const armSuppress = () => {
        suppressNextNav.current = true;
        window.setTimeout(() => {
            suppressNextNav.current = false;
        }, 60);
    };
    const subscribeNavSuppression = () =>
        router.on('before', (event) => {
            const method = (
                (event as CustomEvent<{ visit?: { method?: string } }>).detail?.visit?.method ?? 'get'
            ).toLowerCase();

            if (suppressNextNav.current && method === 'get') {
                suppressNextNav.current = false;

                return false; // cancel the visit — keep the backdrop put
            }
        });

    const stableKeys = () => TOOLS.map((t) => t.key);

    const onEditToggle = () => {
        window.dispatchEvent(new CustomEvent(editing ? 'beam-ux:exit' : 'beam-ux:edit'));
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: OP_DESK_CSS }} />
            <OperatorOverlay
                stableKeys={stableKeys}
                resolveWindow={resolveWindow}
                orbLabel="Operator"
                onWindowBodyClickCapture={armSuppress}
                onWindowManager={() => {
                    const off = subscribeNavSuppression();

                    return off;
                }}
                renderLauncher={({ wm, onClose }) => (
                    <StartMenu
                        openKeys={wm.state.zOrder}
                        inOperator={inOperator}
                        editing={editing}
                        pageEditable={pageEditable}
                        onEditToggle={onEditToggle}
                        onOpenTool={(tool) => wm.open(tool.key, { geometry: tool.size, presentation: 'float' })}
                        onClose={onClose}
                    />
                )}
            />
        </>
    );
}
