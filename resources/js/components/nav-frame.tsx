import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { frameIcon } from '@/frame/icons';
import { useFrameManifest } from '@/frame/manifest';
import { useCurrentUrl } from '@/hooks/use-current-url';

/**
 * The TENANT frame nav, rendered from `/frame/manifest`'s `nav` block.
 *
 * Entirely data-driven: a seat exists here because a `#[ParticleResource]` declares one and this host
 * placed the resource in `config('frame.realms')['tenant']`. There is no row list in this file, by
 * design — the server-side navigation was already correct and complete before this component existed;
 * what was missing was anything at all that rendered it.
 *
 * Each `href` comes from the SAME derivation as the route it points at
 * (`RouteContextProjector::hrefs()`), so a nav row and its destination cannot drift apart.
 */
export function NavFrame() {
    const { data: manifest } = useFrameManifest();
    const { isCurrentUrl } = useCurrentUrl();
    const sections = manifest?.nav.items ?? [];

    if (sections.length === 0) {
        return null;
    }

    return (
        <>
            {sections.map((section) => (
                <SidebarGroup
                    key={section.routeName ?? section.title}
                    className="px-2 py-0"
                >
                    <SidebarGroupLabel>
                        {section.href ? (
                            <Link href={section.href}>{section.title}</Link>
                        ) : (
                            section.title
                        )}
                    </SidebarGroupLabel>
                    <SidebarMenu>
                        {section.children.map((item) =>
                            item.href ? (
                                <SidebarMenuItem
                                    key={item.routeName ?? item.href}
                                >
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentUrl(item.href)}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link href={item.href}>
                                            {(() => {
                                                const Icon = frameIcon(
                                                    item.icon,
                                                );

                                                return <Icon />;
                                            })()}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ) : null,
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    );
}
