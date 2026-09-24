import { describe, it, expect } from 'vitest';
import { pathFromProfile } from './supabaseSync';

describe('pathFromProfile', () => {
  it('ignores the column defaults of a profile that never made a choice', () => {
    // exactly what the signup trigger creates for a new (anonymous) account
    expect(pathFromProfile({ learning_path: 'standard', transmission_type: 'automatic', path_chosen: false }))
      .toEqual({ licenseType: null, learningPath: null, transmissionType: null });
    // a database without migration 026 behaves the same
    expect(pathFromProfile({ learning_path: 'standard', transmission_type: 'automatic' }))
      .toEqual({ licenseType: null, learningPath: null, transmissionType: null });
    expect(pathFromProfile(null)).toEqual({ licenseType: null, learningPath: null, transmissionType: null });
  });

  it('restores a real choice', () => {
    expect(pathFromProfile({ learning_path: 'standard', transmission_type: 'manual', path_chosen: true }))
      .toEqual({ licenseType: 'manual', learningPath: 'standard', transmissionType: 'manual' });
    expect(pathFromProfile({ learning_path: 'conversion', transmission_type: 'automatic', path_chosen: true }))
      .toEqual({ licenseType: 'umschreibung-automatic', learningPath: 'umschreibung', transmissionType: 'automatic' });
  });
});
