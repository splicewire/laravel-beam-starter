<?php

namespace App\Actions\Fortify;

use Illuminate\Contracts\Auth\Authenticatable;
use Splicewire\Beam\Accounts\Fortify\CreateNewUser as BaseCreateNewUser;

/** Keep the package's registration door and validation; provision this host's personal team after creation. */
class CreateNewUser extends BaseCreateNewUser
{
    /**
     * @param  array<string, mixed>  $input
     */
    protected function afterCreating(Authenticatable $user, array $input): void
    {
        $this->teams->personalTeamFor($user);
    }
}
