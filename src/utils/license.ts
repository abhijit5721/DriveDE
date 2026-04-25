/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 */

import type { LicenseType, LearningPathType, TransmissionType } from '../types';

export const isLegacyUmschreibungSelection = (licenseType: LicenseType) => {
  return licenseType === 'umschreibung';
};

export const isUmschreibungSelection = (licenseType: LicenseType) => {
  return (
    licenseType === 'umschreibung' ||
    licenseType === 'umschreibung-manual' ||
    licenseType === 'umschreibung-automatic'
  );
};

export const getTransmissionFromLicenseType = (
  licenseType: LicenseType
): TransmissionType => {
  if (licenseType === 'manual' || licenseType === 'umschreibung-manual') {
    return 'manual';
  }

  if (licenseType === 'automatic' || licenseType === 'umschreibung-automatic') {
    return 'automatic';
  }

  return null;
};

export const getLearningPathFromLicenseType = (
  licenseType: LicenseType
): LearningPathType => {
  if (isUmschreibungSelection(licenseType)) {
    return 'umschreibung';
  }

  if (licenseType === 'manual' || licenseType === 'automatic') {
    return 'standard';
  }

  return null;
};
