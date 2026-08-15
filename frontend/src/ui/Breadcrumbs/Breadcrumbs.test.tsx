import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import { Breadcrumbs } from './index';

const mockItems = [
  { label: 'Home', href: '/' },
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Settings', href: '/settings' },
];

describe('Breadcrumbs', () => {
  it('renders breadcrumb items', () => {
    render(<Breadcrumbs items={mockItems} />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('last item is not a link', () => {
    render(<Breadcrumbs items={mockItems} />);
    const lastItem = screen.getByText('Settings');
    expect(lastItem.tagName).not.toBe('A');
    expect(lastItem).not.toHaveAttribute('href');
    
    const firstItem = screen.getByText('Home');
    expect(firstItem.closest('a')).toHaveAttribute('href', '/');
  });

  it('has nav landmark with aria-label', () => {
    render(<Breadcrumbs items={mockItems} />);
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', expect.any(String));
  });

  it('links have correct href', () => {
    render(<Breadcrumbs items={mockItems} />);
    const links = screen.getAllByRole('link');
    expect(links[0]).toHaveAttribute('href', '/');
    expect(links[1]).toHaveAttribute('href', '/dashboard');
  });
});
