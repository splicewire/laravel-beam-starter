import { Head } from '@inertiajs/react';
import { BrowserRouter } from 'react-router';
import { useFrameManifest } from '@/frame/manifest';
import { TenantFrameProvider } from '@/frame/provider';
import { FrameRoutes } from '@/frame/router';

/**
 * The TENANT frame console — one Inertia page serving every tenant-realm frame path.
 *
 * The server mounts this component at each path `RouteContextProjector::hrefs('tenant')` declares
 * (routes/web.php), so an Inertia visit to `/beam-ux-entry` lands here and the client router matches
 * the leaf. That is the whole reason the page takes no `resource` prop: which surface renders is the
 * MANIFEST's decision, read from the same `routeContext` the nav's hrefs were derived from, rather
 * than a second server-side mapping that could drift from it.
 *
 * `<BrowserRouter>` is here for matching and `:id` params only — navigation is Inertia's (see
 * `frame/router.tsx`).
 */
export default function FrameConsole() {
    return (
        <TenantFrameProvider>
            <BrowserRouter>
                <ConsoleBody />
            </BrowserRouter>
        </TenantFrameProvider>
    );
}

function ConsoleBody() {
    const { data: manifest, isLoading, error } = useFrameManifest();

    if (isLoading) {
        return (
            <div className="px-6 py-8 text-sm text-muted-foreground">
                <Head title="Console" />
                Loading the frame manifest…
            </div>
        );
    }

    if (error || !manifest) {
        return (
            <div className="px-6 py-8">
                <Head title="Console" />
                <h1 className="mb-1 text-2xl font-semibold">
                    The frame manifest did not load
                </h1>
                <p className="max-w-prose text-sm text-muted-foreground">
                    {error instanceof Error
                        ? error.message
                        : 'GET /frame/manifest failed.'}
                </p>
            </div>
        );
    }

    return (
        <>
            <Head title="Console" />
            <FrameRoutes manifest={manifest} />
        </>
    );
}
