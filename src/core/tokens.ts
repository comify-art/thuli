/**
 * Thuli Design System Token Contracts
 * Container 1: Core & Foundations
 */

export const THULI_TOKENS = {
  cssVariables: {
    surfaceCanvas: '--surface-canvas',
    surfacePanel: '--surface-panel',
    surfaceModal: '--surface-modal',
    borderDefault: '--border-default',
    accentPrimary: '--accent-primary',
    primary: '--primary',
    accent: '--accent',
    background: '--background',
    surface: '--surface',
    foreground: '--foreground',
  },
  defaults: {
    surfaceCanvas: '#0f172a',
    surfacePanel: '#1e293b',
    surfaceModal: '#1e293b',
    borderDefault: 'rgba(255, 255, 255, 0.08)',
    accentPrimary: '#3b82f6',
  },
} as const;

export const THEME_TOKENS = THULI_TOKENS;

export default THULI_TOKENS;
