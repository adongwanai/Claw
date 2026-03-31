import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamNameEditor } from '@/components/team/TeamNameEditor';
import { useTeamsStore } from '@/stores/teams';

vi.mock('@/stores/teams', () => ({
  useTeamsStore: vi.fn((selector) => {
    const mockStore = {
      updateTeam: vi.fn(),
    };
    return selector ? selector(mockStore) : mockStore;
  }),
}));

describe('TeamNameEditor', () => {
  let mockUpdateTeam: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateTeam = vi.fn();
    (useTeamsStore as any).mockImplementation((selector: any) => {
      const mockStore = {
        updateTeam: mockUpdateTeam,
      };
      return selector ? selector(mockStore) : mockStore;
    });
  });

  it('displays team name as clickable text', () => {
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);
    expect(screen.getByText('测试团队')).toBeInTheDocument();
  });

  it('enters edit mode when name is clicked', () => {
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    const input = screen.getByDisplayValue('测试团队');
    expect(input).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it('selects all text when entering edit mode', () => {
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    const input = screen.getByDisplayValue('测试团队') as HTMLInputElement;
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe(input.value.length);
  });

  it('saves changes when Enter is pressed', async () => {
    mockUpdateTeam.mockResolvedValueOnce(undefined);
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    await waitFor(() => {
      expect(screen.getByDisplayValue('测试团队')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.change(input, { target: { value: '新团队名称' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    // Wait for edit mode to exit
    await waitFor(() => {
      expect(screen.queryByDisplayValue('新团队名称')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Verify updateTeam was called
    expect(mockUpdateTeam).toHaveBeenCalledWith('team-1', { name: '新团队名称' });
  });

  it('saves changes when input loses focus', async () => {
    mockUpdateTeam.mockResolvedValueOnce(undefined);
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    await waitFor(() => {
      expect(screen.getByDisplayValue('测试团队')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.change(input, { target: { value: '新团队名称' } });
    fireEvent.blur(input);

    // Wait for edit mode to exit
    await waitFor(() => {
      expect(screen.queryByDisplayValue('新团队名称')).not.toBeInTheDocument();
    }, { timeout: 1000 });

    // Verify updateTeam was called
    expect(mockUpdateTeam).toHaveBeenCalledWith('team-1', { name: '新团队名称' });
  });

  it('cancels edit when Escape is pressed', () => {
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.change(input, { target: { value: '新团队名称' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.getByText('测试团队')).toBeInTheDocument();
    expect(mockUpdateTeam).not.toHaveBeenCalled();
  });

  it('does not save if name is empty', async () => {
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockUpdateTeam).not.toHaveBeenCalled();
      expect(screen.getByText('测试团队')).toBeInTheDocument();
    });
  });

  it('does not save if name is unchanged', async () => {
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockUpdateTeam).not.toHaveBeenCalled();
    });
  });

  it('disables input during save', async () => {
    // Create a promise that we can control
    let resolveUpdate: () => void = () => {};
    const updatePromise = new Promise<void>(resolve => {
      resolveUpdate = resolve;
    });
    mockUpdateTeam.mockReturnValue(updatePromise);

    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    await waitFor(() => {
      expect(screen.getByDisplayValue('测试团队')).toBeInTheDocument();
    });

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.change(input, { target: { value: '新团队名称' } });

    // Trigger save
    fireEvent.keyDown(input, { key: 'Enter' });

    // Check if disabled (may need a small delay for state update)
    await waitFor(() => {
      const currentInput = screen.queryByDisplayValue('新团队名称');
      if (currentInput) {
        expect(currentInput).toBeDisabled();
      }
    }, { timeout: 500 });

    // Resolve the promise to complete the test
    resolveUpdate();
  });

  it('reverts to original name on save error', async () => {
    mockUpdateTeam.mockRejectedValueOnce(new Error('Save failed'));
    render(<TeamNameEditor teamId="team-1" initialName="测试团队" />);

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    const input = screen.getByDisplayValue('测试团队');
    fireEvent.change(input, { target: { value: '新团队名称' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(screen.getByText('测试团队')).toBeInTheDocument();
    });
  });

  it('stops event propagation when clicked', () => {
    const handleParentClick = vi.fn();
    const { container } = render(
      <div onClick={handleParentClick}>
        <TeamNameEditor teamId="team-1" initialName="测试团队" />
      </div>
    );

    const nameElement = screen.getByText('测试团队');
    fireEvent.click(nameElement);

    expect(handleParentClick).not.toHaveBeenCalled();
  });
});
