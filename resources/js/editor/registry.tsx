// Component registry for the visual editor's OPAQUE ISLANDS. A tree node whose `name` is a registered key
// (PascalCase) renders the REAL designed component (sealed block: select / reorder / delete, no drill-in)
// instead of an intrinsic element. Host CONFIG only — the "is this an island" test lives in the package
// canvas (`isIsland(config, name)`); this file just supplies the map. A fresh host registers its own
// designed sections here.
import type { ComponentType } from 'react';
import { DemoFeatureRow, DemoHero } from './islands';

export const COMPONENTS: Record<string, ComponentType<Record<string, unknown>>> = {
    DemoHero,
    DemoFeatureRow,
};
