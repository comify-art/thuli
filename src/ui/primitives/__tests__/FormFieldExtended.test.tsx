import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { useState } from 'react';
import { Textarea, Checkbox, ToggleSwitch } from '../FormField';

describe('Extended FormField Controls', () => {
    describe('Textarea', () => {
        it('renders and handles input typing', () => {
            const onChange = vi.fn();
            render(<Textarea placeholder="Enter description..." onChange={onChange} />);

            const textarea = screen.getByPlaceholderText('Enter description...');
            fireEvent.change(textarea, { target: { value: 'Updated note' } });
            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it('applies error styling when hasError is true', () => {
            render(<Textarea hasError data-testid="error-textarea" />);
            const el = screen.getByTestId('error-textarea');
            expect(el.className).toContain('border-red-500');
        });
    });

    describe('Checkbox', () => {
        it('renders with label and description and toggles', () => {
            const onChange = vi.fn();
            render(
                <Checkbox
                    label="Send as Test Email"
                    description="Includes [TEST] prefix in subject"
                    onChange={onChange}
                />
            );

            expect(screen.getByText('Send as Test Email')).toBeDefined();
            expect(screen.getByText('Includes [TEST] prefix in subject')).toBeDefined();

            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            expect(onChange).toHaveBeenCalledTimes(1);
        });
    });

    describe('ToggleSwitch', () => {
        it('toggles value on click', () => {
            const ToggleContainer = () => {
                const [checked, setChecked] = useState(false);
                return (
                    <ToggleSwitch
                        checked={checked}
                        onChange={setChecked}
                        label="Enable Notifications"
                    />
                );
            };

            render(<ToggleContainer />);
            expect(screen.getByText('Enable Notifications')).toBeDefined();

            const toggleBtn = screen.getByRole('switch');
            expect(toggleBtn.getAttribute('aria-checked')).toBe('false');

            fireEvent.click(toggleBtn);
            expect(toggleBtn.getAttribute('aria-checked')).toBe('true');
        });
    });
});
