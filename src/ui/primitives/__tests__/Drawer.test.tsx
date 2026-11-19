import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Drawer } from '../Drawer';

describe('Drawer Primitive', () => {
    it('does not render when isOpen is false', () => {
        render(
            <Drawer isOpen={false} onClose={vi.fn()} title="Drawer Title">
                Drawer Content
            </Drawer>
        );
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('renders title, subtitle, and children when isOpen is true', () => {
        render(
            <Drawer
                isOpen={true}
                onClose={vi.fn()}
                title="Application Inspection"
                subtitle="Review founder materials"
                footer={<button type="button">Confirm</button>}
            >
                <p>Inspection details body</p>
            </Drawer>
        );

        expect(screen.getByRole('dialog')).toBeDefined();
        expect(screen.getByText('Application Inspection')).toBeDefined();
        expect(screen.getByText('Review founder materials')).toBeDefined();
        expect(screen.getByText('Inspection details body')).toBeDefined();
        expect(screen.getByText('Confirm')).toBeDefined();
    });

    it('calls onClose when close button is clicked', () => {
        const onClose = vi.fn();
        render(
            <Drawer isOpen={true} onClose={onClose} title="Drawer Title">
                Body
            </Drawer>
        );

        const closeBtn = screen.getByLabelText('Close drawer');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('closes on Escape key press when closeOnEsc is true', () => {
        const onClose = vi.fn();
        render(
            <Drawer isOpen={true} onClose={onClose} closeOnEsc={true}>
                Body
            </Drawer>
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('locks body scroll when open and restores it when unmounted', () => {
        const { unmount } = render(
            <Drawer isOpen={true} onClose={vi.fn()}>
                Body
            </Drawer>
        );

        expect(document.body.style.overflow).toBe('hidden');
        unmount();
        expect(document.body.style.overflow).toBe('');
    });
});
