import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreateTeamZone } from '@/components/team/CreateTeamZone';

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

describe('CreateTeamZone', () => {
  it('shows empty state with prompt text', () => {
    render(<CreateTeamZone />);
    expect(screen.getByText('创建新团队')).toBeInTheDocument();
    expect(screen.getByText(/从右侧拖拽 Agent/)).toBeInTheDocument();
  });

  it('expands to show Leader and Member zones when agent added', () => {
    render(<CreateTeamZone />);

    // Initially empty state
    expect(screen.getByText('创建新团队')).toBeInTheDocument();

    // Simulate adding a leader (this would be done via drag-drop in real usage)
    // For now, we'll test the component structure
  });

  it('shows hint when less than 3 members', () => {
    render(<CreateTeamZone />);
    // This test will be implemented when we add state management
  });

  it('allows removing agents from zones', () => {
    render(<CreateTeamZone />);
    // This test will be implemented when we add state management
  });
});
