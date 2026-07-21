/**
 * (c) 2026 DriveDE. All rights reserved.
 * This source code is proprietary and protected under international copyright law.
 *
 * Password & Email validation helpers.
 */

export interface PasswordValidationResult {
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  return {
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    isValid,
  };
}

export function getPasswordErrorMessage(result: PasswordValidationResult, language: 'de' | 'en'): string | null {
  if (result.isValid) return null;
  const isDe = language === 'de';

  if (!result.hasMinLength) {
    return isDe
      ? 'Passwort muss mindestens 8 Zeichen lang sein.'
      : 'Password must be at least 8 characters long.';
  }

  return isDe
    ? 'Passwort muss Groß- und Kleinbuchstaben, Zahlen und Sonderzeichen enthalten.'
    : 'Password must contain uppercase and lowercase letters, numbers, and symbols.';
}
