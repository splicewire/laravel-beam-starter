import type { FramePrimitives } from '@schemastud/frame';
import type { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

// This host's binding of frame's FramePrimitives seam to its own shadcn kit — the same seam
// rushing/audiostud and splicewire bind, against the same component set.
//
// The facets primitives (Popover*, SimpleSelect) are passthrough stubs: no tenant-realm resource
// declares facets today, and the console renders `Filters: () => null`, so the facets bar never
// mounts. They stay present so the contract is complete rather than partially satisfied.
const Passthrough = ({ children }: { children?: ReactNode }) => <>{children}</>;

function FrameSidePanel({
    open,
    onOpenChange,
    children,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children?: ReactNode;
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                {children}
            </SheetContent>
        </Sheet>
    );
}

export const framePrimitives: FramePrimitives = {
    Button,
    Input,
    Label,
    Badge,
    Skeleton,
    Popover: Passthrough,
    PopoverTrigger: Passthrough,
    PopoverContent: Passthrough,
    SimpleSelect: Passthrough,
    Table: Passthrough,
    Dialog: ({
        open,
        onOpenChange,
        children,
    }: {
        open?: boolean;
        onOpenChange?: (o: boolean) => void;
        children?: ReactNode;
    }) => (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>{children}</DialogContent>
        </Dialog>
    ),
    SidePanel: FrameSidePanel,
};
