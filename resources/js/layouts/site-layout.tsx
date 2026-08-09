import { Head, Link } from '@inertiajs/react';
import { SiteLayout as BeamSiteLayout } from '@splicewire/beam-ux/site';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import SiteNav from '@/components/site-nav';

/**
 * The public-site chrome (header + footer) for the starter, in a NEUTRAL theme. The STRUCTURE comes
 * from the generic package `<SiteLayout>` (`@splicewire/beam-ux/site`); this wrapper supplies only the
 * host THEME + the brand + the nav/footer slots. This is the "wrote only config" proof for the site
 * realm — no site-chrome machinery lives in the host.
 *
 * Nav CONTENT is data-driven from the shared `nav` prop via <SiteNav>; the auth affordance + brand are
 * hand-placed here. Every public page wraps its body in <SiteLayout>.
 */
const CSS = `
.st-site a{color:inherit;text-decoration:none}
.st-site .navlink{font-size:14px;color:#475569;text-decoration:none;transition:color .15s}
.st-site .navlink:hover{color:#0f172a}
.st-site .btn-primary{display:inline-flex;align-items:center;gap:8px;background:#0f172a;color:#fff;border:none;border-radius:10px;padding:9px 16px;font:600 14px system-ui;cursor:pointer;transition:background .15s;text-decoration:none}
.st-site .btn-primary:hover{background:#1e293b}
`;

const brand = (
    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <AppLogoIcon style={{ width: 22, height: 22, display: 'block', color: '#0f172a' }} />
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: '#0f172a' }}>Beam Starter</span>
    </Link>
);

const nav = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginLeft: 'auto', flexWrap: 'wrap' }}>
        <SiteNav />
        <a className="navlink" href="/login">
            Sign in
        </a>
        <a className="btn-primary" href="/dashboard">
            Dashboard
        </a>
    </div>
);

export default function SiteLayout({ children }: { children: ReactNode }) {
    return (
        <BeamSiteLayout
            linkComponent={Link}
            brand={brand}
            nav={nav}
            footerLinks={[
                { title: 'Home', href: '/' },
                { title: 'About', href: '/about' },
                { title: 'Sign in', href: '/login' },
            ]}
            head={
                <>
                    <Head title="Beam Starter" />
                    <style dangerouslySetInnerHTML={{ __html: CSS }} />
                </>
            }
            className="st-site"
            style={{
                background: '#f8fafc',
                color: '#0f172a',
                fontFamily: 'system-ui, sans-serif',
                WebkitFontSmoothing: 'antialiased',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
            headerStyle={{
                position: 'sticky',
                top: 0,
                zIndex: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                flexWrap: 'wrap',
                padding: '16px clamp(18px,5vw,56px)',
                background: 'rgba(248,250,252,.86)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid rgba(15,23,42,.08)',
            }}
            mainStyle={{ flex: 1, width: '100%' }}
        >
            {children}
        </BeamSiteLayout>
    );
}
