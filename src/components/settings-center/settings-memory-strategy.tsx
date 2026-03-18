import { SettingsSectionCard } from './settings-section-card';

export function SettingsMemoryStrategy() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#64748b]">
          记忆与知识
        </p>
        <h1 className="text-[20px] font-semibold text-[#111827]">记忆策略</h1>
        <p className="text-[13px] text-[#475467]">
          将热数据与冷数据分层管理，保持摄取流与检索流的稳定性，方便回溯与审计。
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        <SettingsSectionCard
          title="记忆策略总览"
          description="统一查看热窗口、冷归档与成本状况"
        >
          <div className="space-y-2 text-[13px] text-[#475467]">
            <p className="text-[13px] font-semibold text-[#0f172a]">策略状态 · 正常</p>
            <p className="text-[13px]">保留 30 天历史，自动归档冷数据</p>
            <div className="flex items-center justify-between rounded-[12px] border border-black/[0.06] bg-[#f8fafc] px-3 py-2 text-[12px] text-[#475467]">
              <span>热数据窗口</span>
              <span className="font-semibold text-[#0a7aff]">15 天</span>
            </div>
            <div className="flex items-center justify-between text-[12px] text-[#475467]">
              <span>冷归档周期</span>
              <span>每 24 小时</span>
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="摄取统计" description="观测最近数据流入与处理效果">
          <div className="space-y-4 text-[13px] text-[#475467]">
            <div className="space-y-1 rounded-[12px] border border-black/[0.06] bg-[#fdf9f5] px-3 py-2">
              <p className="text-[13px] font-semibold text-[#111827]">本周新增记忆 150 条</p>
              <p className="text-[12px] text-[#475467]">均匀分布于 23 个场景</p>
            </div>
            <p className="text-[13px]">平均处理延迟 210 ms</p>
            <p className="text-[13px]">缓存命中 92%，回压规则已开启</p>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard title="检索策略" description="结合重写、索引与上下文缓存">
          <div className="space-y-2 text-[13px] text-[#475467]">
            <p className="text-[13px] font-semibold text-[#0f172a]">优先级顺序</p>
            <p className="text-[13px]">优先使用记忆索引 + 上下文缓存</p>
            <p className="text-[13px]">命中失败后回退到最新 2 条会话与媒体</p>
            <p className="text-[13px]">保持 8 条缓存，超过自动清理</p>
          </div>
        </SettingsSectionCard>
      </div>
    </section>
  );
}
