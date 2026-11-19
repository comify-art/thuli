import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MetricStrip } from '../MetricStrip';

describe('MetricStrip Primitive', () => {
    it('renders list of metric items with labels and values', () => {
        render(
            <MetricStrip
                items={[
                    { label: 'Active Deals', value: 5, color: 'emerald' },
                    { label: 'Total Committed', value: '$250k', color: 'gold' },
                    { label: 'Under Review', value: 12, subtext: '(3 new)' },
                ]}
            />
        );

        expect(screen.getByText('Active Deals:')).toBeDefined();
        expect(screen.getByText('5')).toBeDefined();
        expect(screen.getByText('Total Committed:')).toBeDefined();
        expect(screen.getByText('$250k')).toBeDefined();
        expect(screen.getByText('Under Review:')).toBeDefined();
        expect(screen.getByText('12')).toBeDefined();
        expect(screen.getByText('(3 new)')).toBeDefined();
    });

    it('renders dividers between multiple metric items', () => {
        const { container } = render(
            <MetricStrip
                divider="|"
                items={[
                    { label: 'A', value: 1 },
                    { label: 'B', value: 2 },
                ]}
            />
        );

        expect(container.textContent).toContain('|');
    });
});
