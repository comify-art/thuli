import { describe, it, expect } from 'vitest';
import { parsePackText } from './packFormat';

describe('parsePackText', () => {
  it('parses valid pack text correctly', () => {
    const rawText = `version: 1.0.0
book: TestBook
chapter: 1
index: 42

---TAMIL_MANDHIRAM_PACK_v1
Tamil verse line 1
Tamil verse line 2
---TAMIL_MANDHIRAM_PACK_v1
English meaning text
---TAMIL_MANDHIRAM_PACK_v1
Tamil meaning text`;

    const result = parsePackText(rawText, 'test.txt');

    expect(result.book).toBe('TestBook');
    expect(result.chapter).toBe(1);
    expect(result.verseIndex).toBe(42);
    expect(result.verse).not.toBeNull();
    expect(result.verse?.original).toBe('Tamil verse line 1\nTamil verse line 2');
    expect(result.verse?.translations).toHaveLength(2);
    expect(result.verse?.translations[0]).toEqual({
      language: 'en',
      variant: 'meaning',
      body: 'English meaning text',
    });
    expect(result.verse?.translations[1]).toEqual({
      language: 'ta',
      variant: 'meaning',
      body: 'Tamil meaning text',
    });
    expect(result.error).toBeUndefined();
  });

  it('fails with invalid chapter or index in header', () => {
    const malformedText = `version: 1.0.0
book: TestBook
chapter: not-a-number
index: 1

---TAMIL_MANDHIRAM_PACK_v1
Some text`;

    const result = parsePackText(malformedText, 'bad.txt');
    expect(result.verse).toBeNull();
    expect(result.error).toContain('Header missing or invalid chapter/index');
  });

  it('fails when no content sections are found after header', () => {
    const noContentText = `version: 1.0.0
book: TestBook
chapter: 1
index: 1

`;

    const result = parsePackText(noContentText, 'empty.txt');
    expect(result.verse).toBeNull();
    expect(result.error).toBe('No content sections found after header.');
  });
});
