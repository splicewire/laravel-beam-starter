<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        {{-- frame-foundation 92: the host-context browser test's root view; its entry is built into build-host-context. --}}
        @vite(['tests/Browser/host-context/entry.tsx'], 'build-host-context')
        <x-inertia::head />
    </head>
    <body>
        <x-inertia::app />
    </body>
</html>
