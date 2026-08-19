/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Single source of truth for the legally required operator identity
 * (Impressum / DSGVO controller). When the business is registered as a
 * Gewerbe or company, update this file only: set `operator` to the company
 * name, put the representative in `responsible`, and fill `vatId` /
 * `register` if applicable.
 */
export const LEGAL_IDENTITY = {
  brand: 'DriveDE',
  /** full legal name of the operator (private individual until registration) */
  operator: 'Abhijit Kumar Sahoo',
  street: 'Billstedter Hauptstraße 69',
  city: '22111 Hamburg',
  country: { de: 'Deutschland', en: 'Germany' },
  email: 'hello@drivede.app',
  /** responsible for content pursuant to § 18 Abs. 2 MStV */
  responsible: 'Abhijit Kumar Sahoo',
  /** optional, once registered: e.g. 'USt-IdNr.: DE123456789' */
  vatId: null as string | null,
} as const;
