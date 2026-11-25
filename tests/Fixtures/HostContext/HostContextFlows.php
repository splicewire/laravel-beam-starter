<?php

namespace Tests\Fixtures\HostContext;

use Splicewire\Beam\Flows\DeclaresFlows;
use Splicewire\Beam\Flows\FlowDeclaration;
use Splicewire\Beam\Flows\Gates\AlwaysOn;
use Splicewire\Beam\Flows\ListsFlows;

/** The test page's one flow, declared the way a package declares its flows (beam `src/Flows/DeclaresFlows.php`). */
class HostContextFlows implements DeclaresFlows
{
    use ListsFlows;

    public const KEY = 'frame.host-context';

    public static function flows(): array
    {
        return [
            new FlowDeclaration(self::KEY, 'A host render context', [HostContextProvider::ROUTE], AlwaysOn::class, null, ['owner']),
        ];
    }
}
