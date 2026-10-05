<?php

namespace Tests\Architecture;

use Splicewire\Beam\Testing\AssertsCommercialSeams;
use Tests\TestCase;

/**
 * The commercial seams at this starter (purchase-walkthrough SPEC §5.1, BUY-01). It passes only when this host's
 * violations equal the ratchet below; every entry names the BUY ticket that removes it, and that ticket deletes the
 * entry in the same commit. Never writes a file.
 */
class CommercialSeamTest extends TestCase
{
    use AssertsCommercialSeams;

    public function test_the_commercial_seams_match_the_ratchet(): void
    {
        $this->assertCommercialSeamRatchet();
    }

    protected function commercialSeamRatchet(): array
    {
        return [
            'R4 account-doors-missing' => 'BUY-05: AccountDoors declares the doors (structural until then)',
            'R4 register-mounted-undeclared' => 'BUY-05: the starter takes the package default (registration closed), so POST register 404s',
            'S3 user-create app/Actions/Fortify/CreateNewUser.php User::create(' => 'BUY-05: the starter copy is deleted; CreatesNewUsers binds the door-checked action',
        ];
    }
}
