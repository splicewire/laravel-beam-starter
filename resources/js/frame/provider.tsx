import {
    createWidgetRegistry,
    FrameProvider,
    registerResourceRefWidget,
} from '@schemastud/frame';
import type { FrameAction, FrameInjection } from '@schemastud/frame';
import { shadcnEditSlots, shadcnListSlots } from '@schemastud/frame/shadcn';
import type { SchemaNode } from '@schemastud/seam';
import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { useFrameManifest } from './manifest';
import { framePrimitives } from './primitives';
import { frameTransport } from './transport';
import { useFrameUrlState } from './use-url-state';

/**
 * Binds this host's transport / primitives / URL-state / widget registry to `@schemastud/frame`.
 *
 * ## `can` reads the manifest, and the comment it replaces was false
 *
 * This was `can: () => true`, justified as *"affordance VISIBILITY only, never authorization: the
 * frame socket is server-gated (`config/frame.php` middleware) and every write still 403s without
 * the ability."* The first half is right and stays right. The second half was **not true**:
 * `frame.middleware` here is `['web','auth']`, which authorizes nothing beyond "logged in", and
 * `FrameResourceController` asked no permission question at all — measured 2026-09-05, a member
 * holding only `beam-ux-entry.view` got **422** from `POST /frame/resources/beam-ux-entry`, i.e.
 * validation, not a 403. So the stub was not a benign visibility choice sitting on top of a real
 * gate; it was the only thing between a member and every record, and it said yes.
 *
 * The server gate now exists (`Schemastud\Frame\Authorization\ResourceAuthorizer`) and the same
 * object projects each resource's capabilities onto the manifest, so this reads them instead of
 * asserting them. Both halves now come from one authority: a button appears only where the
 * endpoint would allow the write, and the endpoint — never this — is what refuses it.
 *
 * `viewAny`/`view` stay TRUE. The read axis is deliberately not symmetric with the write axis: a
 * resource whose index is gated by its row-level scope rather than a class policy is meant to
 * stay readable (ADR-0156 §83), and the manifest a signed-out reader receives already carries
 * only what nav would show them.
 *
 * Manifest not yet loaded ⇒ every write capability reads FALSE. A moment of missing buttons is
 * recoverable; a moment of buttons that 403 teaches the reader the console is broken.
 *
 * The design-system slots are named ONCE here rather than spread per surface — `listSlots`/`editSlots`
 * on the injection are merged per slot underneath any page's own, which is what keeps a
 * dispatcher-mounted route (one no page wrote) from rendering frame's plain-HTML fallback table.
 *
 * No QueryClientProvider here: `app.tsx`'s `withApp` provides one at the Inertia root, and frame
 * fetches rows/records/schemas through react-query internally.
 */
export function TenantFrameProvider({ children }: { children: ReactNode }) {
    const { data: manifest } = useFrameManifest();

    const can = useCallback<FrameInjection['can']>(
        (action: FrameAction, resource: string) => {
            if (action === 'viewAny' || action === 'view') return true;

            // Absent block (manifest still loading, or a server predating the capability map) ⇒
            // no write affordance. Deny-while-unknown, matching the socket's own posture.
            return manifest?.contexts?.[resource]?.can?.[action] === true;
        },
        [manifest],
    );

    const injection = useMemo<FrameInjection>(() => {
        const registry = createWidgetRegistry();
        // Explicit rather than relying on FrameProvider's own ensureBuiltinWidgets useMemo —
        // splicewire measured that side-effecting memo failing to run for its registry. Calling
        // registerWidget twice is safe.
        registerResourceRefWidget(registry);

        return {
            transport: frameTransport,
            primitives: framePrimitives,
            useUrlState: useFrameUrlState,
            registry,
            // Tenant-realm request schemas are self-contained (forRequest()); no $refs to resolve.
            schemaFetcher: async (ref: string): Promise<SchemaNode> =>
                ({ $id: ref }) as SchemaNode,
            can,
            listSlots: shadcnListSlots,
            editSlots: shadcnEditSlots,
        };
    }, [can]);

    return <FrameProvider value={injection}>{children}</FrameProvider>;
}
