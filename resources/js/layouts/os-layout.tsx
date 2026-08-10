// beam·os — the OS layout. The full floating-window OS DESKTOP is the opt-in `/os` route (pages/os.tsx).
// This layout is the seam a host wraps its OTHER authed surfaces in when it wants the OS to be the
// persistent authed chrome (a WordPress-admin-bar-style strip, or the desktop staged on the current
// route's realm — see audiostud's os-layout for the full pattern). The starter keeps it a pass-through:
// the OS is reachable ONLY via `/os`, and every other page renders standalone. A host that wants the
// persistent OS chrome thickens this file (read `can['os.enter']`, wrap `children` in an OS strip/stage).
import type { ReactNode } from 'react';

export default function OsLayout({ children }: { children: ReactNode }) {
    return <>{children}</>;
}
