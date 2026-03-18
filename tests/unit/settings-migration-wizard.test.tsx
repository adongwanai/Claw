import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsMigrationWizard } from '@/components/settings-center/settings-migration-wizard';

describe('SettingsMigrationWizard', () => {
  it('renders nothing when closed', () => {
    const { container } = render(<SettingsMigrationWizard open={false} onOpenChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('navigates through the steps and enables the start button', () => {
    const onOpenChange = vi.fn();
    render(<SettingsMigrationWizard open onOpenChange={onOpenChange} />);

    expect(screen.getByRole('heading', { level: 2, name: /Choose scope/ })).toBeInTheDocument();
    const toggleScope = screen.getByRole('button', { name: /Agents & defaults/ });
    fireEvent.click(toggleScope);
    const nextButton = screen.getByRole('button', { name: /Go to Compatibility report/ });
    expect(nextButton).not.toBeDisabled();
    fireEvent.click(nextButton);

    expect(screen.getByRole('heading', { level: 2, name: /Compatibility report/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Go to Confirm & execute/ }));

    expect(screen.getByRole('heading', { level: 2, name: /Confirm & execute/ })).toBeInTheDocument();
    const startButton = screen.getByRole('button', { name: /Start migration/ });
    expect(startButton).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/I understand the migration plan/));
    expect(startButton).not.toBeDisabled();
    fireEvent.click(startButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
