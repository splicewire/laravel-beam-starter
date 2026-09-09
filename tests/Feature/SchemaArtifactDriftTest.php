<?php

declare(strict_types=1);

use Rushing\Doctor\DoctorStatus;
use Splicewire\Beam\Surgeon\SchemaProjectionDriftAudit;

uses(Tests\TestCase::class);

/**
 * `resources/schemas/App/**` is a COMMITTED generated artifact — beam's particle doctrine says so
 * ("schemas:generate → resources/schemas (JSON Schema, committed)"), and `.prettierignore` already
 * carries it as "PHP Data generator output". Until now the tracking was simply never done, so a fresh
 * clone had no projections at all and nothing said a word.
 *
 * This is the verification half of docs/conventions/regenerating-committed-artifacts.md — *regeneration
 * is a command, verification is a test, the test never writes*. It writes nothing; `schemas:generate`
 * is the command, and the audit already names it in its own failure text.
 *
 * ⚠️ It drives {@see SchemaProjectionDriftAudit} rather than re-deriving the expected schema. That is
 * deliberate and the audit's own docblock says why: a second hand-rolled copy of the generation logic
 * DISAGREED with the real command and cost a host a permanent phantom "stale" finding no regeneration
 * could clear. One implementation, driven from a test — never a second one to compare against.
 */
it('has a committed schema projection for every declared Data class', function () {
    $findings = SchemaProjectionDriftAudit::forApp()->run();

    // Drift is reported one finding per offending class, so the clean shape is exactly one summary.
    // Print the details on failure — "expected 1, got 3" alone would not say WHICH class drifted.
    expect($findings)->toHaveCount(
        1,
        'schema projections are missing or stale: '
            .implode(' | ', array_map(fn ($f): string => $f->detail, $findings))
    );

    $finding = $findings[0];

    expect($finding->status)->toBe(DoctorStatus::Pass, $finding->detail);

    // ⚠️ Both of the audit's vacuous outcomes report Pass, and one of them reports it CONCLUSIVELY:
    //   - an empty population  → Finding::inconclusive(), Pass + conclusive:false
    //   - an unavailable check → Finding::pass('... — schema-projection drift check skipped.')
    // So asserting Pass proves nothing on its own. The conclusive flag rejects the first, and pinning
    // the success detail's exact shape rejects the second — a "skipped" pass cannot match this.
    expect($finding->conclusive)->toBeTrue($finding->detail);
    expect($finding->detail)->toMatch('/^\d+ declared Data class\(es\) have fresh disk schema projections\.$/');

    // ...and the population must be non-empty, so a scope regression that silently stops seeing
    // app/Data cannot pass as "clean".
    preg_match('/^(\d+) /', $finding->detail, $m);
    expect((int) $m[1])->toBeGreaterThanOrEqual(1, $finding->detail);
});

/**
 * The audit above only sees DECLARED particle classes — at this starter that is one
 * (`SitemapData`), while `schemas:generate` emits one file per class under the discovery paths.
 * So the other committed projections are covered by nothing above, and deleting one would be
 * silent. This is the cheap structural half: every committed artifact is real, parseable, and
 * still has a class behind it. It writes nothing.
 */
it('has no committed schema artifact that is corrupt or orphaned', function () {
    $root = resource_path('schemas/App');
    $files = glob($root.'/**/*.schema.json', GLOB_BRACE) ?: [];
    $files = array_merge($files, glob($root.'/*.schema.json') ?: []);
    $files = array_values(array_unique(array_merge($files, iterator_to_array(
        new RegexIterator(
            new RecursiveIteratorIterator(new RecursiveDirectoryIterator($root)),
            '/\.schema\.json$/'
        ),
        false
    ))));
    $files = array_map(fn ($f): string => (string) $f, $files);
    sort($files);

    expect($files)->not->toBeEmpty('no committed schema artifacts were found under '.$root);

    foreach ($files as $file) {
        $relative = str_replace(resource_path('schemas').'/', '', $file);

        $raw = file_get_contents($file);
        expect(trim((string) $raw))->not->toBe('', $relative.' is empty — run `php artisan schemas:generate`.');

        $decoded = json_decode((string) $raw, true);
        expect($decoded)->toBeArray($relative.' is not valid JSON — run `php artisan schemas:generate`.');
        // NB: toHaveKey()'s second argument is an expected VALUE, not a message — hence the explicit check.
        expect(array_key_exists('$schema', $decoded))->toBeTrue($relative.' has no $schema key.');

        // Orphan check: the path IS the class name, so a Data class deleted without its projection
        // leaves a file here that no regeneration would ever rewrite or remove.
        $class = str_replace('/', '\\', substr($relative, 0, -strlen('.schema.json')));
        expect(class_exists($class))->toBeTrue(
            $relative.' has no class '.$class.' behind it — delete the artifact, or restore the class.'
        );
    }
});
