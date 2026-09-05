<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Resource discovery
    |--------------------------------------------------------------------------
    | Beam's boot-time resource discovery scans these paths for Data classes
    | carrying `#[ParticleResource]` and reflects each into the admin manifest —
    | no per-resource `registerClass()` in a provider. Dropping ONE annotated
    | Data class under a scanned path IS the wiring: it shows up in Frame's
    | `/frame/manifest` and gets its editor route with no further code.
    |
    | `resources` is the explicit class-string list (always honoured, cheap);
    | `discover_paths` is the filesystem scan (dev convenience). The unified
    | `#[ParticleResource]` attribute carries the full manifest field set
    | (label / model / nav placement / route identity), so the Data class is the
    | single source of the declaration.
    */

    // Empty on purpose. BeamUxEntryData used to be listed here because discover_paths' app_path('Data')
    // scan (this host's own app/Data) cannot reach a PACKAGE class — but laravel-beam-ux now registers
    // its own declarations from its provider (ADR-0214 §5), which runs after this list and takes the key
    // under OnDuplicate::Supersede. The line registered first, was displaced by the identical class, and
    // did nothing. registry-kernel 68.
    'resources' => [],

    'discover_paths' => [
        app_path('Data'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Realm membership — which resources this host places in which realm
    |--------------------------------------------------------------------------
    | A HOST-SIDE LIST, spelled out, and deliberately so: `api-surface-coherence`
    | 142 rules membership a host concern and 141 ("SPELL IT OUT") retired
    | auto-mount as vocabulary. No package writes this and no discovery fills it.
    |
    | It is what turns the manifest's `nav` / `routeContext` block from a shape
    | into a router table. `splicewire/laravel-beam-ux` supplies the PROJECTION
    | over this list — the list leaf per resource, the per-record twin the
    | declaration allows, the shell/href join — through frame's own
    | `FrameNavContributor` plug, so this host emits a manifest-generated router
    | with NO controller of its own. Before this list existed the projection was
    | present and had nothing to project: `routeContext` came back empty, which
    | is the honest reading, not a bug in it.
    |
    | Split on who the surface is FOR, which is the only question membership
    | answers here. Platform identity (`users`, `teams`) is the operator's;
    | everything a workspace edits about its own site is the tenant's. A host
    | that disagrees edits this list — that is the point of it being here.
    |
    | `beam-ux-mirror-status` and `beam-ux-sitemap-health` are read-only
    | diagnostics and ride the tenant realm beside the content they report on.
    */

    'realms' => [
        'operator' => [
            'users',
            'teams',
        ],

        'tenant' => [
            'beam-ux-entry',
            'sitemap',
            'schemas',
            'hooks',
            'git-repo',
            'members',
            'invitations',
            'tokens',
            'beam-ux-sitemap-health',
            'beam-ux-mirror-status',
        ],
    ],

];
