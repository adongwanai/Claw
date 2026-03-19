import { useState } from 'react';
import { Switch } from '@/components/ui/switch';

type SettingsMigrationPanelProps = {
  onLaunchWizard: () => void;
};

export function SettingsMigrationPanel({ onLaunchWizard }: SettingsMigrationPanelProps) {
  const [autoBackup, setAutoBackup] = useState(true);

  return (
    <div className="space-y-4">
      {/* 从 OpenClaw 迁移配置 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-[#000000]">
              从 OpenClaw 迁移配置 (Migrate from OpenClaw)
            </h3>
            <p className="mt-1 text-[12px] text-[#8e8e93]">
              自动检测本地磁盘上的 OpenClaw 旧版工作区，一键无损迁移 Agent、Skills 及 IM 通道等历史配置。
            </p>
          </div>
          <button
            type="button"
            onClick={onLaunchWizard}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#0a7aff] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#075ac4]"
          >
            🪄 启动迁移向导
          </button>
        </div>
      </section>

      {/* 冷备与导出 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">冷备与导出</h3>
        <div className="divide-y divide-black/[0.04]">
          <div className="pb-4">
            <p className="text-[13px] font-medium text-[#000000]">备份完整快照包 (Snapshot)</p>
            <p className="mt-0.5 text-[12px] text-[#8e8e93]">
              将一切 Settings, Credentials (AES256加密), Cron 配置, 知识图谱打进单个 .ktclaw 存档。
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[#000000]">从快照迁移 / 覆盖式导入</p>
              <p className="mt-0.5 text-[12px] text-[#8e8e93]">
                适用于换新电脑，选择文件后需重启应用。（当前未保存数据将丢失）。
              </p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-lg border border-black/10 px-4 py-2 text-[13px] font-medium text-[#000000] transition hover:bg-[#f2f2f7]"
            >
              选择 .ktclaw 导入
            </button>
          </div>
        </div>
      </section>

      {/* 自动增量备份 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">自动增量备份</h3>
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-[#000000]">每日本地保留配置历史 (Git-like)</p>
            <p className="mt-0.5 text-[12px] text-[#8e8e93]">
              这允许当你改错某个复杂 MCP JSON 后无痛一键回滚。（上限 5 档历史）
            </p>
          </div>
          <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
        </div>
      </section>

      {/* 恢复出厂 */}
      <section className="rounded-xl border border-[#c6c6c8] bg-white px-5 py-4">
        <h3 className="mb-4 text-[15px] font-semibold text-[#000000]">恢复出厂 (Hard Reset)</h3>
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-[#ef4444]">
            清除所有设置与关联 Agent 数据... (此操作无法撤销)
          </p>
          <button
            type="button"
            className="shrink-0 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-4 py-2 text-[13px] font-semibold text-[#b91c1c] transition hover:bg-[#fee2e2]"
          >
            清空并重启
          </button>
        </div>
      </section>
    </div>
  );
}
