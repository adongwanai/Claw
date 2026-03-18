import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsMigrationPanel } from '@/components/settings-center/settings-migration-panel';

describe('SettingsMigrationPanel', () => {
  it('renders every migration section and the hero text', () => {
    render(<SettingsMigrationPanel onLaunchWizard={vi.fn()} />);

    expect(screen.getByRole('heading', { name: '迁移与备份' })).toBeInTheDocument();
    expect(
      screen.getByText('配置同步、回滚、系统迁移，防止关键设置丢失或在设备间错位。'),
    ).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: '从 OpenClaw 迁移配置' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '快照导出与导入' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '自动增量备份' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '恢复出厂 (Hard Reset)' })).toBeInTheDocument();
  });

  it('triggers the migration wizard when the CTA is clicked', () => {
    const onLaunchWizard = vi.fn();
    render(<SettingsMigrationPanel onLaunchWizard={onLaunchWizard} />);

    fireEvent.click(screen.getByRole('button', { name: '🪄 启动迁移向导' }));
    expect(onLaunchWizard).toHaveBeenCalledOnce();
  });
});
