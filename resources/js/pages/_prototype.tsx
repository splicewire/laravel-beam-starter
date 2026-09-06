/**
 * Development-only Inertia host page for the package's prototype gallery and routes.
 * The PHP twin registers the local-only server route; app.tsx excludes this page from production.
 */
import { createPrototypeRoutes } from '@splicewire/beam-ux-prototype';
import { createBrowserRouter, RouterProvider } from 'react-router';

// The package already emits absolute /_prototype paths; no additional basename is needed.
const router = import.meta.env.DEV
    ? createBrowserRouter(
          createPrototypeRoutes(
              import.meta.glob<Record<string, unknown>>(
                  '../_prototype/**/*.tsx',
              ),
          ),
      )
    : null;

export default function PrototypeHost() {
    if (!router) {
        return null;
    }

    return <RouterProvider router={router} />;
}
