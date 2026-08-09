<?php

/*
|--------------------------------------------------------------------------
| beam-accounts host overrides (merged over the package defaults)
|--------------------------------------------------------------------------
|
| OOTB-wiring note (frontend-surfaces): this starter is a `laravel new`
| derivative that already ships its OWN bigint-keyed `users` /
| `password_reset_tokens` / `sessions` migrations. `laravel-beam-accounts`
| ALSO registers a full auth-migration estate that includes a *uuid-keyed*
| `create_users_table` (the "C2 auth estate"), which collides with the
| host's own users table on migrate.
|
| Until the host adopts the package's uuid-user identity wholesale, we keep
| the host's own auth tables and OPT OUT of the package's auth-migration
| estate. The front-end realm surfaces (site / account chrome) do not depend
| on the uuid-user estate; they need the beam-ux entry/sitemap substrate and
| a bound AccountShellProvider, both of which stand on their own.
*/

return [
    'register_auth_migrations' => false,
    'register_migrations' => false,
];
