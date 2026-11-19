import { describe, it, expect } from 'vitest';
import { THULI_TOKENS, THEME_TOKENS } from '../tokens';

describe('THULI_TOKENS', () => {
  it('defines canonical CSS variable names', () => {
    expect(THULI_TOKENS.cssVariables.surfaceCanvas).toBe('--surface-canvas');
    expect(THULI_TOKENS.cssVariables.surfacePanel).toBe('--surface-panel');
    expect(THULI_TOKENS.cssVariables.surfaceModal).toBe('--surface-modal');
    expect(THULI_TOKENS.cssVariables.borderDefault).toBe('--border-default');
    expect(THULI_TOKENS.cssVariables.accentPrimary).toBe('--accent-primary');
  });

  it('defines dark-first default fallback values and THEME_TOKENS alias', () => {
    expect(THULI_TOKENS.defaults.surfaceCanvas).toBe('#0f172a');
    expect(THULI_TOKENS.defaults.surfacePanel).toBe('#1e293b');
    expect(THULI_TOKENS.defaults.surfaceModal).toBe('#1e293b');
    expect(THEME_TOKENS).toBe(THULI_TOKENS);
  });
});
