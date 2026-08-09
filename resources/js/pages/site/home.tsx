import { Head } from '@inertiajs/react';
import SiteLayout from '@/layouts/site-layout';

/**
 * A public SITE-realm page rendering through the OOTB `<SiteLayout>` (`@splicewire/beam-ux/site`).
 * Proves the site chrome (header + data-driven nav + footer) renders from config only.
 */
export default function SiteHome() {
    return (
        <SiteLayout>
            <Head title="Home" />
            <section
                style={{
                    maxWidth: 760,
                    margin: '0 auto',
                    padding: 'clamp(48px,8vw,96px) clamp(18px,5vw,56px)',
                }}
            >
                <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 16px' }}>
                    The beam OOTB site realm.
                </h1>
                <p style={{ fontSize: 18, lineHeight: 1.6, color: '#475569', margin: '0 0 24px' }}>
                    This page renders through the promoted <code>@splicewire/beam-ux/site</code> chrome. The
                    header nav and footer links are data-driven from the <code>site</code> sitemap
                    (<code>resources/beam-ux/nav.yml</code>) — the host wrote only a theme + slots.
                </p>
                <a
                    className="btn-primary"
                    href="/dashboard"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0f172a', color: '#fff', borderRadius: 10, padding: '11px 18px', fontWeight: 600, textDecoration: 'none' }}
                >
                    Enter the account realm →
                </a>
            </section>
        </SiteLayout>
    );
}
