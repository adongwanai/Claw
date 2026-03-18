import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SettingsMemoryStrategy } from '@/components/settings-center/settings-memory-strategy';

describe('SettingsMemoryStrategy', () => {
  it('renders the static sections for policy, ingest stats, and retrieval', () => {
    render(<SettingsMemoryStrategy />);

    expect(screen.getByRole('heading', { name: '记忆策略总览' })).toBeInTheDocument();
    expect(screen.getByText('保留 30 天历史，自动归档冷数据')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: '摄取统计' })).toBeInTheDocument();
    expect(screen.getByText('本周新增记忆 150 条')).toBeInTheDocument();
    expect(screen.getByText('平均处理延迟 210 ms')).toBeInTheDocument();

    expect(screen.getByRole('heading', { name: '检索策略' })).toBeInTheDocument();
    expect(screen.getByText('优先使用记忆索引 + 上下文缓存')).toBeInTheDocument();
  });
});
