import {
    createWidgetRegistry,
    FrameProvider,
    registerResourceRefWidget,
} from '@schemastud/frame';
import type { FrameInjection } from '@schemastud/frame';
import { shadcnEditSlots, shadcnListSlots } from '@schemastud/frame/shadcn';
import type { SchemaNode } from '@schemastud/seam';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { framePrimitives } from './primitives';
import { frameTransport } from './transport';
import { useFrameUrlState } from './use-url-state';

/**
 * Binds this host's transport / primitives / URL-state / widget registry to `@schemastud/frame`.
 *
 * `can: () => true` is affordance VISIBILITY only, never authorization: the frame socket is
 * server-gated (`config/frame.php` middleware) and every write still 403s without the ability, so
 * deny-default is preserved regardless of what this returns.
 *
 * The design-system slots are named ONCE here rather than spread per surface — `listSlots`/`editSlots`
 * on the injection are merged per slot underneath any page's own, which is what keeps a
 * dispatcher-mounted route (one no page wrote) from rendering frame's plain-HTML fallback table.
 *
 * No QueryClientProvider here: `app.tsx`'s `withApp` provides one at the Inertia root, and frame
 * fetches rows/records/schemas through react-query internally.
 */
export function TenantFrameProvider({ children }: { children: ReactNode }) {
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
            can: () => true,
            listSlots: shadcnListSlots,
            editSlots: shadcnEditSlots,
        };
    }, []);

    return <FrameProvider value={injection}>{children}</FrameProvider>;
}
