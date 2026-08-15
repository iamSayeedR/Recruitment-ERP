import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { Modal } from './index';

describe('Modal', () => {
  it('does not render when open=false', () => {
    render(<Modal open={false} onClose={() => {}} title="Test">Content</Modal>);
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('renders title and content when open=true', () => {
    render(<Modal open={true} onClose={() => {}} title="Test Modal">Test Content</Modal>);
    expect(screen.getByRole('dialog', { hidden: true })).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(<Modal open={true} onClose={handleClose} title="Test">Content</Modal>);
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn();
    render(<Modal open={true} onClose={handleClose} title="Test">Content</Modal>);
    const dialog = screen.getByRole('dialog', { hidden: true });
    if (dialog.parentElement) {
      fireEvent.click(dialog.parentElement);
    }
    expect(handleClose).toHaveBeenCalled();
  });

  it('has correct aria attributes (aria-modal, role="dialog", aria-labelledby)', () => {
    render(<Modal open={true} onClose={() => {}} title="Accessible Modal">Content</Modal>);
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
