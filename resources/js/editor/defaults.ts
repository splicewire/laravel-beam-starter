// Default body per entry slug — the starting content the editor + read view use when an entry has no
// saved body yet. The demo islands load as opaque islands (real components), so the editor opens WITH
// content (reorder / add / delete around them) and the read view renders the same tree. A save persists a
// real body that overrides this default. Host config only — the machinery lives in the packages.
//
// The body is a `JsonDoc` (a `JsonNode[]` — the promoted BlockDoc JSON projection). A single-root page
// body is `[root]`.
import type { JsonBlock, JsonDoc } from '@splicewire/beam-ux/blockdoc/json';

const island = (name: string): JsonBlock => ({
    kind: 'block',
    name,
    isComponent: true,
    props: [],
    children: [],
    dynamic: false,
});

const str = (name: string, value: string) => ({ name, kind: 'string' as const, value });

export const DEFAULT_TREES: Record<string, JsonDoc> = {
    // The public site home — a demo hero island + a copy paragraph + a feature-row island.
    home: [
        {
            kind: 'block',
            name: 'div',
            isComponent: false,
            dynamic: false,
            props: [str('className', 'st-editable-home'), str('style', 'max-width:900px;margin:0 auto;padding:24px')],
            children: [
                island('DemoHero'),
                {
                    kind: 'block',
                    name: 'p',
                    isComponent: false,
                    dynamic: false,
                    props: [str('style', 'font-size:16px;line-height:1.6;color:#475569;margin:28px 0')],
                    children: [
                        {
                            kind: 'text',
                            value:
                                'This page is editable in place through the promoted @splicewire/beam-ux/canvas. Everything you see is one JsonDoc body — the same tree the read view renders and the editor edits.',
                        },
                    ],
                },
                island('DemoFeatureRow'),
            ],
        },
    ],
};

export function defaultTreeFor(slug: string): JsonDoc | null {
    return DEFAULT_TREES[slug] ?? null;
}
