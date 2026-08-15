import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RequisitionList } from './RequisitionList';
import { useRequisitions } from '@/hooks/useRequisitions';
import { useTranslations } from 'next-intl';

vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => key),
}));

vi.mock('@/hooks/useRequisitions', () => ({
  useRequisitions: vi.fn(),
}));

describe('RequisitionList', () => {
  it('renders requisitions data table', () => {
    (useRequisitions as any).mockReturnValue({
      data: {
        data: [
          { id: '1', title: 'Software Engineer', department: 'IT', location: 'Remote', status: 'OPEN' }
        ]
      },
      isLoading: false
    });

    render(<RequisitionList />);
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('IT')).toBeInTheDocument();
  });
});
