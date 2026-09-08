// Component registry for the visual editor's OPAQUE ISLANDS. A tree node whose `name` is a registered key
// (PascalCase) renders the REAL designed component (sealed block: select / reorder / delete, no drill-in)
// instead of an intrinsic element. Host CONFIG only — the "is this an island" test lives in the package
// canvas (`isIsland(config, name)`); this file just supplies the map. A fresh host registers its own
// designed sections here.
import type { ComponentType } from 'react';
/* @chisel-password-confirmation */
import ConfirmPassword from '@/pages/auth/confirm-password';
/* @end-chisel-password-confirmation */
import ForgotPassword from '@/pages/auth/forgot-password';
import Login from '@/pages/auth/login';
/* @chisel-registration */
import Register from '@/pages/auth/register';
/* @end-chisel-registration */
import ResetPassword from '@/pages/auth/reset-password';
/* @chisel-2fa */
import TwoFactorChallenge from '@/pages/auth/two-factor-challenge';
/* @end-chisel-2fa */
/* @chisel-email-verification */
import VerifyEmail from '@/pages/auth/verify-email';
/* @end-chisel-email-verification */
import { DemoFeatureRow, DemoHero } from './islands';

export const COMPONENTS: Record<
    string,
    ComponentType<Record<string, unknown>>
> = {
    DemoHero,
    DemoFeatureRow,
    // theme-entries-and-authoring STR-03: the 7 promoted auth pages' real Fortify-bound forms, sealed
    // (position/delete-only in the visual editor, never decomposed) — the files themselves are
    // UNCHANGED in location/content (chisel's scaffold-time feature-toggle operates on these exact
    // paths; moving them would require updating the starter's own chisel-paths.php).
    AuthLogin: Login,
    /* @chisel-registration */
    AuthRegister: Register,
    /* @end-chisel-registration */
    AuthForgotPassword: ForgotPassword,
    AuthResetPassword: ResetPassword,
    /* @chisel-password-confirmation */
    AuthConfirmPassword: ConfirmPassword,
    /* @end-chisel-password-confirmation */
    /* @chisel-2fa */
    AuthTwoFactorChallenge: TwoFactorChallenge,
    /* @end-chisel-2fa */
    /* @chisel-email-verification */
    AuthVerifyEmail: VerifyEmail,
    /* @end-chisel-email-verification */
};
