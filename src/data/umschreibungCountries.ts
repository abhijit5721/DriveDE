/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Re-export of the Umschreibung country data. The canonical file lives in
 * api/_lib/ so the /api/lead serverless function can import it — Vercel only
 * compiles TypeScript imports located inside the api/ directory into
 * serverless bundles, while Vite happily imports from anywhere in the repo.
 */

export * from '../../api/_lib/umschreibungCountries';
