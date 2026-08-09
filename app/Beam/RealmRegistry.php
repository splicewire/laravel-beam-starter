<?php

namespace App\Beam;

use Splicewire\Beam\Ux\Models\BeamUxEntry;

/**
 * The starter's realm editability-tier registry (mirrors audiostud's beam Model-B ticket 14). A realm
 * is a URL/nav/permission grouping of beam-ux entries (`site`, `account`, `operator`, `auth`, …). This
 * registry owns the HOST policy the package intentionally does NOT: which realms are CONTENT realms
 * (their entry bodies are free composition) vs BEHAVIOR realms (a fixed template around a sealed
 * behavior island — login/register, operator sockets).
 *
 * - `composableByDefault($realm)` — the seed-time default for a new entry's `composable` flag: content
 *   realms TRUE, behavior realms FALSE.
 * - `authorAbility($realm)` — the per-realm authoring ability name (`author-ux-{realm}`) gating who may
 *   edit that realm's entries.
 *
 * Any realm not named in BEHAVIOR_REALMS is a CONTENT realm — adding a content realm needs no edit here.
 */
class RealmRegistry
{
    /** Behavior realms — fixed-template bodies, default composable = OFF. Everything else is content. */
    private const BEHAVIOR_REALMS = ['auth', 'operator'];

    /** The public content realm the package roots URLs under by default. */
    public const REALM_SITE = BeamUxEntry::REALM_SITE;

    /** The authed content realm (Dashboard / Profile). */
    public const REALM_ACCOUNT = 'account';

    /** The auth behavior realm (login / register). */
    public const REALM_AUTH = 'auth';

    /** The staff back-office realm. */
    public const REALM_OPERATOR = 'operator';

    /** Seed-time default for a realm's `composable` flag: FALSE for behavior, TRUE for content. */
    public static function composableByDefault(string $realm): bool
    {
        return ! in_array($realm, self::behaviorRealms(), true);
    }

    /** Is this a behavior realm (fixed-template body, default composable = OFF)? */
    public static function isBehaviorRealm(string $realm): bool
    {
        return in_array($realm, self::behaviorRealms(), true);
    }

    /** The per-realm authoring ability name — `author-ux-{realm}`. */
    public static function authorAbility(string $realm): string
    {
        return "author-ux-{$realm}";
    }

    /**
     * Every realm this host knows about — content + behavior.
     *
     * @return list<string>
     */
    public static function realms(): array
    {
        return array_values(array_unique([
            self::REALM_SITE,
            self::REALM_ACCOUNT,
            ...self::behaviorRealms(),
        ]));
    }

    /**
     * The behavior-realm list, config-overridable via `config('beam-realms.behavior')`.
     *
     * @return list<string>
     */
    private static function behaviorRealms(): array
    {
        $configured = config('beam-realms.behavior');

        return is_array($configured) && $configured !== []
            ? array_values(array_map('strval', $configured))
            : self::BEHAVIOR_REALMS;
    }
}
