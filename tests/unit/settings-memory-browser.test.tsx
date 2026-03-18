import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsMemoryBrowser } from '@/components/settings-center/settings-memory-browser';

describe('SettingsMemoryBrowser', () => {
  it('renders the dual-pane layout and updates the preview when selecting another file', () => {
    render(<SettingsMemoryBrowser />);

    const listPanel = screen.getByRole('region', { name: '记忆文件列表' });
    const previewPanel = screen.getByRole('region', { name: '记忆预览' });

    expect(listPanel).toBeInTheDocument();
    expect(previewPanel).toBeInTheDocument();
    expect(screen.getByText('全部记忆')).toBeInTheDocument();
    expect(screen.getByText('会议要点')).toBeInTheDocument();

    const secondFile = screen.getByRole('button', { name: '项目更新日志 (315 KB)' });
    fireEvent.click(secondFile);

    const preview = within(previewPanel);
    expect(
      preview.getByText('追踪事项 · 与架构与 QA 提前确认测试窗口'),
    ).toBeInTheDocument();
    expect(preview.queryByText('会议要点')).not.toBeInTheDocument();
    expect(preview.getByText('项目状态')).toBeInTheDocument();
  });
});
