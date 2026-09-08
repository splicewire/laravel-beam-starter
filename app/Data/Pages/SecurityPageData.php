<?php

declare(strict_types=1);

namespace App\Data\Pages;

/* @chisel-passkeys */
use Spatie\LaravelData\Attributes\DataCollectionOf;
/* @end-chisel-passkeys */
use Spatie\LaravelData\Data;
/* @chisel-2fa */
use Spatie\LaravelData\Optional;
/* @end-chisel-2fa */
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class SecurityPageData extends Data
{
    /* @chisel-passkeys */
    /** @param list<SecurityPasskeyData> $passkeys */
    /* @end-chisel-passkeys */
    public function __construct(
        /* @chisel-2fa */
        public bool $canManageTwoFactor,
        /* @end-chisel-2fa */
        /* @chisel-passkeys */
        public bool $canManagePasskeys,
        #[DataCollectionOf(SecurityPasskeyData::class)]
        public array $passkeys,
        /* @end-chisel-passkeys */
        public string $passwordRules,
        /* @chisel-2fa */
        public bool|Optional $twoFactorEnabled,
        public bool|Optional $requiresConfirmation,
        /* @end-chisel-2fa */
    ) {}
}
