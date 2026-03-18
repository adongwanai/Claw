import { SettingsSectionCard } from './settings-section-card';

type SettingsMigrationPanelProps = {
  onLaunchWizard: () => void;
};

export function SettingsMigrationPanel({ onLaunchWizard }: SettingsMigrationPanelProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-1 rounded-[18px] border border-black/[0.06] bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <h1 className="text-[20px] font-semibold text-[#111827]">迁移与备份</h1>
        <p className="text-[13px] text-[#64748b]">配置同步、回滚、系统迁移，防止关键设置丢失或在设备间错位。</p>
      </header>

      <SettingsSectionCard title="从 OpenClaw 迁移配置" description="自动检测旧版本地工作区，尽可能无损迁移 Agent、Skills 与 IM 通道。">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-sm text-[#475467]">
            <p className="text-base font-semibold text-[#111827]">🧭 一键移植旧工作区</p>
            <p className="text-[13px] text-[#64748b]">
              自动扫描 $HOME/.config/OpenClaw 与 workspace/ 目录，并尝试处理兼容性差异。
            </p>
          </div>
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0a7aff] px-4 text-[13px] font-semibold text-white transition hover:bg-[#075ac4]"
            onClick={onLaunchWizard}
          >
            🪄 启动迁移向导
          </button>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard title="快照导出与导入" description="用 .ktclaw 存档抓取或覆盖当前配置。">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-[12px] border border-black/[0.05] bg-[#f8fafc] p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#111827]">备份完整快照包 (Snapshot)</p>
              <p className="text-[12px] text-[#64748b]">
                设置、凭证（AES256）、Cron、知识图谱等全部打包成 .ktclaw 存档。
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-transparent bg-[#111827] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#0f172a]"
            >
              导出存档...
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-[12px] border border-black/[0.05] bg-[#f8fafc] p-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#111827]">从快照迁移 / 覆盖式导入</p>
              <p className="text-[12px] text-[#64748b]">
                选择 .ktclaw 文件导入后需重启，当前未保存数据将丢失，请提前确认。
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg border border-black/[0.1] px-4 py-2 text-[13px] font-semibold text-[#111827]"
            >
              选择 .ktclaw 导入
            </button>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        title="自动增量备份"
        description="按日保留配置快照，类似 Git 历史，最多保存 5 个版本。"
      >
        <p className="text-sm text-[#475467]">
          当你修改 MCP JSON 或误删技能时，可随时回滚到前 5 个自动备份版本。
        </p>
      </SettingsSectionCard>

      <SettingsSectionCard title="恢复出厂 (Hard Reset)">
        <div className="flex flex-col gap-4 text-sm text-[#ef4444] md:flex-row md:items-center md:justify-between">
          <p>
            清空所有设置、运行记录与 Agent 数据，此操作无法撤销。请先保存所需配置。
          </p>
          <button
            type="button"
            className="rounded-lg border border-[#fecaca] px-4 py-2 text-[13px] font-semibold text-[#b91c1c] transition hover:bg-[#fef2f2]"
          >
            清空并重启
          </button>
        </div>
      </SettingsSectionCard>
    </section>
  );
}
