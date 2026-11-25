import { BeamFrameProvider } from '@splicewire/beam-inertia';
import { SchemaView, useFrameInjection, useResourceList } from '@schemastud/frame';

/**
 * frame-foundation 92, box 3: the test page that draws each resource's records in the host's own `card` context.
 *
 * It mounts the realm's kit the way a host page does (`BeamFrameProvider`, carrying the entry's `frameKit` contexts and
 * widgets), reads each resource's manifest from the kit, and draws every row with frame's public `SchemaView`. A
 * record-grain context resolves the root node once, so a resource that binds nothing in `card` borrows `list-item`.
 */
type Props = { context: string; resources: string[] };

function ResourceCards({ resource, context }: { resource: string; context: string }) {
    const manifest = useFrameInjection().manifestFor?.(resource);
    const { data } = useResourceList(resource as never, {});
    if (!manifest || !data) return null;

    return (
        <section data-host-context-resource={resource}>
            {data.data.map((row, i) => (
                <SchemaView key={i} schema={{ type: 'object' }} record={row as Record<string, unknown>} manifest={manifest} context={context} />
            ))}
        </section>
    );
}

export default function HostContextPage({ context, resources }: Props) {
    return (
        <BeamFrameProvider>
            <main>
                {resources.map((resource) => (
                    <ResourceCards key={resource} resource={resource} context={context} />
                ))}
            </main>
        </BeamFrameProvider>
    );
}
