import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import appConfig from '../../../vite.config';

/**
 * frame-foundation 92, box 3: builds only the host-context test entry, into public/build-host-context, so the app's own
 * build is untouched. Run before the browser test: `vite build --config tests/Browser/host-context/vite.config.ts`.
 *
 * It keeps the app's dedupe list (one React, one Beam UX registry) and adds frame and beam-inertia: the page reads the
 * kit that beam-inertia's provider mounts, so both must import the one frame context, the host's copy.
 */
export default defineConfig({
    resolve: {
        dedupe: [...(appConfig.resolve?.dedupe ?? []), '@schemastud/frame', '@splicewire/beam-inertia'],
    },
    plugins: [
        laravel({
            input: ['tests/Browser/host-context/entry.tsx'],
            buildDirectory: 'build-host-context',
            refresh: false,
        }),
        react(),
    ],
});
