import { createInertiaApp } from '@inertiajs/react';
import { beamInertiaOptions } from '@splicewire/beam-inertia';
import HostContextPage from './HostContextPage';

/**
 * frame-foundation 92, box 3: the browser test's own entry (tests only; the app's resources/js/app.tsx is unchanged).
 *
 * The kit half of tests/Fixtures/HostContext/HostContextProvider: the same `card` context (record grain, falling back to
 * `list-item`, by this host) handed to beam-inertia's `frameKit` bindings, and the two widgets the fixtures name.
 */
const HostCard = ({ value }: { value?: { label?: unknown } }) => <span>host-card drawn {String(value?.label ?? '')}</span>;
const HostListItem = ({ value }: { value?: { label?: unknown } }) => <span>host-list-item drawn {String(value?.label ?? '')}</span>;

createInertiaApp(
    beamInertiaOptions({
        pages: { 'testing/host-context': async () => ({ default: HostContextPage as never }) },
        frameKit: () => ({
            contexts: (contexts) => contexts.register('card', { grain: 'record', fallback: ['list-item'] }, 'laravel-beam-starter/tests'),
            widgets: (registry) => {
                registry.registerWidget('host-card', HostCard as never);
                registry.registerWidget('host-list-item', HostListItem as never);
            },
        }),
    }),
);
