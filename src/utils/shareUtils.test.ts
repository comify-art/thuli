import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shareContent } from './shareUtils';

describe('shareUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls navigator.share when available', async () => {
    const mockShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { share: mockShare },
      writable: true,
      configurable: true,
    });

    const onSuccess = vi.fn();
    await shareContent({ title: 'Test Title', url: 'https://example.com' }, onSuccess);

    expect(mockShare).toHaveBeenCalledWith({ title: 'Test Title', url: 'https://example.com' });
    expect(onSuccess).toHaveBeenCalled();
  });

  it('falls back to clipboard.writeText when navigator.share is unavailable', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: mockWriteText } },
      writable: true,
      configurable: true,
    });

    const onSuccess = vi.fn();
    await shareContent({ title: 'Test Title', url: 'https://example.com' }, onSuccess);

    expect(mockWriteText).toHaveBeenCalledWith('Test Title\n\nhttps://example.com');
    expect(onSuccess).toHaveBeenCalled();
  });
});
