import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ProgressMeter } from '../ProgressMeter';

describe('ProgressMeter Primitive', () => {
    it('calculates percentage correctly and displays target', () => {
        render(
            <ProgressMeter
                target={50000}
                current={25000}
                label="SPV Threshold"
                unit="$"
            />
        );

        expect(screen.getByText('SPV Threshold')).toBeDefined();
        expect(screen.getByText('50%')).toBeDefined();
        expect(screen.getByText('$25k needed')).toBeDefined();
    });

    it('displays MET status when target is achieved', () => {
        render(
            <ProgressMeter
                target={50000}
                current={60000}
                unit="$"
            />
        );

        expect(screen.getByText('120% MET')).toBeDefined();
        expect(screen.getByText('Threshold achieved')).toBeDefined();
    });

    it('renders custom statusText and subtext', () => {
        render(
            <ProgressMeter
                target={100}
                current={75}
                statusText="Custom status label"
                subtext="4 members passed"
            />
        );

        expect(screen.getByText('Custom status label')).toBeDefined();
        expect(screen.getByText('4 members passed')).toBeDefined();
    });
});
