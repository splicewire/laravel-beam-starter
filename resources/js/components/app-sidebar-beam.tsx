import { Link, usePage } from '@inertiajs/react';
import { AccountShell } from '@splicewire/beam-ux/account';
import type { AccountNavItem } from '@splicewire/beam-ux/account';
import { LayoutGrid, Settings } from 'lucide-react';
import type { ReactNode } from 'react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';

/**
 * The `account`-realm app shell — a THIN host wrapper over the generic `@splicewire/beam-ux/account`
 * `<AccountShell>`. The package owns the sidebar/inset chrome (the @schemastud/ui Sidebar + brand
 * header + data-driven nav group + opt-in plan/profile sections + user footer slot); this file supplies
 * only host specifics: the brand, Inertia's `<Link>`, active-URL matching, neutral row icons, and the
 * `<NavUser>` footer. This is the "wrote only config" proof for the account realm.
 *
 * The nav is DATA-DRIVEN from the shared `accountNav` prop; the plan/profile blocks are driven by the
 * shared `accountShell` prop (both projected by HandleInertiaRequests). Add an account-realm row to
 * resources/beam-ux/nav.yml and it appears here — no edit to this file.
 */
type AccountNavTree = { items: { title: string; href: string | null }[] };
type ShellData = {
    plan: { tier: string; label: string; credits?: number | null; max?: number | null };
    profile: { handle: string; avatar?: string | null; metrics: { label: string; value: string }[] };
    account: { email: string; paymentMethodLabel?: string | null };
    upsells: { key: string; label: string; href?: string | null }[];
};

const DASHBOARD: AccountNavItem = { title: 'Dashboard', href: '/dashboard' };

export function AppSidebarBeam({ children }: { children: ReactNode }) {
    const page = usePage<{
        accountNav?: AccountNavTree;
        accountShell?: ShellData | null;
        sidebarOpen?: boolean;
    }>();
    const realmItems = page.props.accountNav?.items ?? [];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const navItems: AccountNavItem[] = [
        DASHBOARD,
        ...realmItems.filter((item): item is { title: string; href: string } => !!item.href),
    ];

    return (
        <AccountShell
            nav={{ items: navItems }}
            navLabel="Account"
            linkComponent={Link}
            brand={<AppLogo />}
            brandHref="/dashboard"
            isActive={(href) => currentPath === href || (href !== '/' && currentPath.startsWith(href))}
            navItemIcon={(item) => (item.href === '/dashboard' ? <LayoutGrid /> : <Settings />)}
            shell={page.props.accountShell ?? null}
            sections={{ plan: true, profile: true }}
            sectionLabels={{ plan: 'Plan', profile: 'Profile' }}
            user={<NavUser />}
            defaultOpen={page.props.sidebarOpen ?? true}
        >
            {children}
        </AccountShell>
    );
}
