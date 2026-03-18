import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ContextRail } from '@/components/workbench/context-rail';
import { useSettingsStore } from '@/stores/settings';

describe('ContextRail', () => {
  beforeEach(() => {
    useSettingsStore.setState({ contextRailCollapsed: false });
  });

  it('renders agent inspector drawer in expanded mode', () => {
    render(<ContextRail />);

    expect(screen.getByText('Agent 检查器')).toBeInTheDocument();
    expect(screen.getByText('关于与基础设置')).toBeInTheDocument();
    expect(screen.getByText('能力与工具')).toBeInTheDocument();
    expect(screen.getByText('上下文与用户画像')).toBeInTheDocument();
    expect(screen.getByText('工作记忆')).toBeInTheDocument();
  });

  it('renders collapsed handle and expands when clicked', () => {
    useSettingsStore.getState().setContextRailCollapsed(true);
    render(<ContextRail />);

    expect(screen.queryByText('Agent 检查器')).not.toBeInTheDocument();

    const expandButton = screen.getByRole('button', { name: '展开上下文栏 Expand context rail' });
    expect(expandButton).toBeInTheDocument();
    fireEvent.click(expandButton);

    expect(useSettingsStore.getState().contextRailCollapsed).toBe(false);
    expect(screen.getByText('Agent 检查器')).toBeInTheDocument();
  });
});
