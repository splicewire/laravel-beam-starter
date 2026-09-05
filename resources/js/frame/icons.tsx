import {
    Circle,
    FileJson,
    FileText,
    GitBranch,
    Globe,
    KeyRound,
    Link2,
    Map,
    Server,
    Users,
    Webhook,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * The nav icon map — the third name→component binding beside frame's route and widget registries: the
 * server declares an icon by NAME (`#[ParticleResource]`'s `nav.icon`, and the section's own), the host
 * binds each name to a component here.
 *
 * Deliberately an explicit map and NOT `import * as Lucide` + a kebab→Pascal lookup: the namespace
 * import defeats tree-shaking and drags the whole icon set into the production bundle. An unmapped name
 * falls back to a neutral dot rather than rendering nothing, so a new declaration is visibly unstyled
 * instead of invisibly iconless.
 *
 * Both casings are keyed because the wire carries both: resource seats emit kebab-case
 * (`file-text`), section seats emit PascalCase (`FileText`).
 */
const ICONS: Record<string, LucideIcon> = {
    'file-text': FileText,
    FileText,
    'file-json': FileJson,
    FileJson,
    'git-branch': GitBranch,
    GitBranch,
    globe: Globe,
    Globe,
    map: Map,
    Map,
    server: Server,
    Server,
    users: Users,
    Users,
    webhook: Webhook,
    Webhook,
    'key-round': KeyRound,
    KeyRound,
    link: Link2,
    Link2,
};

export function frameIcon(name: string | null | undefined): LucideIcon {
    return (name ? ICONS[name] : undefined) ?? Circle;
}
