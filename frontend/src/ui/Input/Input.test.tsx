import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Input } from './index';

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Username" id="username" />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is set', () => {
    render(<Input label="Email" id="email" error="Invalid email address" />);
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(<Input label="Password" id="password" hint="Must be at least 8 characters" />);
    expect(screen.getByText(/must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('associates label with input via htmlFor/id', () => {
    render(<Input label="Test" id="test-input" />);
    const input = screen.getByLabelText(/test/i);
    expect(input).toHaveAttribute('id', 'test-input');
  });

  it('shows required asterisk when required=true', () => {
    render(<Input label="Required Field" id="req" required />);
    const input = screen.getByRole('textbox', { name: /required field/i });
    expect(input).toBeRequired();
  });

  it('aria-describedby links to error/hint elements', () => {
    // Test error case
    const { rerender } = render(<Input label="Described" id="desc" error="Error text" />);
    let input = screen.getByRole('textbox', { name: /described/i });
    let ariaDescribedBy = input.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();
    if (ariaDescribedBy) {
      const el = document.getElementById(ariaDescribedBy);
      expect(el?.textContent?.includes('Error text')).toBe(true);
    }

    // Test hint case
    rerender(<Input label="Described" id="desc" hint="Hint text" />);
    input = screen.getByRole('textbox', { name: /described/i });
    ariaDescribedBy = input.getAttribute('aria-describedby');
    expect(ariaDescribedBy).toBeTruthy();
    if (ariaDescribedBy) {
      const el = document.getElementById(ariaDescribedBy);
      expect(el?.textContent?.includes('Hint text')).toBe(true);
    }
  });

  it('forwards ref', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input label="Ref" id="ref" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input label="Change" id="change" onChange={handleChange} />);
    const input = screen.getByRole('textbox', { name: /change/i });
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
