import { useState } from 'react';

import { cn } from '@/lib/utils';

type MemorySection = {
  title: string;
  body: string;
};

type MemoryFile = {
  id: string;
  label: string;
  size: string;
  updated: string;
  tagLine: string;
  breadcrumb: string[];
  previewTitle: string;
  previewMeta: string;
  callout: string;
  previewHighlights: string[];
  sections: MemorySection[];
};

const FILTER_CHIPS = ['全部记忆', '重点跟进', '团队共享'];

const MEMORY_FILES: MemoryFile[] = [
  {
    id: 'meeting-notes',
    label: '会议要点',
    size: '220 KB',
    updated: '今天 • 09:45',
    tagLine: '客户同步会议 · 关键决策',
    breadcrumb: ['记忆', '客户', '会议'],
    previewTitle: '客户同步会议',
    previewMeta: '2026年3月18日 • 周四早会',
    callout: '提醒 · 下周三前提供 demo 录像供客户评审',
    previewHighlights: [
      '关键词 · 需求确认、交付节奏和可交付物',
      '追踪事项 · 立刻安排 demo 录制与产品经理对齐',
    ],
    sections: [
      {
        title: '决策',
        body: '保持目前交付节奏，若遇到风险点及时上报至日常同步会。',
      },
      {
        title: '行动项',
        body: '产品团队负责整理细化任务，运营需准备演示素材。',
      },
    ],
  },
  {
    id: 'project-log',
    label: '项目更新日志',
    size: '315 KB',
    updated: '昨天 • 16:10',
    tagLine: '产品迭代 · 4 次回顾',
    breadcrumb: ['记忆', '项目', '记录'],
    previewTitle: '项目状态',
    previewMeta: '记录于昨天 • 反馈同步',
    callout: '追踪事项 · 与架构与 QA 提前确认测试窗口',
    previewHighlights: [
      '追踪事项 · 复盘、上线时间线与风险缓释计划',
      '风险点 · 核心服务仍在调试，需留意瓶颈',
    ],
    sections: [
      {
        title: '里程碑',
        body: 'v1.3.0 已部署至预发环境，等待 QA 测试完成。',
      },
      {
        title: '待办',
        body: '安全测试完成后同步给通知频道，准备部署文档。',
      },
    ],
  },
  {
    id: 'design-diary',
    label: '设计日记',
    size: '180 KB',
    updated: '03月12日',
    tagLine: '视觉探索 · 组件库',
    breadcrumb: ['记忆', '设计', '灵感'],
    previewTitle: '界面灵感',
    previewMeta: '设计探索 • 迭代 07',
    callout: '提醒 · 下一个里程碑为 3 月 25 日的动效稿',
    previewHighlights: [
      '灵感来源 · 雨天柔光与夜晚霓虹的层次感',
      '任务 · 平衡首页卡片间距与聚焦信息',
    ],
    sections: [
      {
        title: '灵感笔记',
        body: '使用渐变疏导视线，保持留白防止信息过载。',
      },
      {
        title: '计划',
        body: '与 PM、Dev 一起梳理组件优先级与可落地细节。',
      },
    ],
  },
];

export function SettingsMemoryBrowser() {
  const [activeFileId, setActiveFileId] = useState(MEMORY_FILES[0].id);
  const activeFile = MEMORY_FILES.find((file) => file.id === activeFileId) ?? MEMORY_FILES[0];

  return (
    <div className="rounded-[22px] border border-black/[0.05] bg-white p-6 shadow-[0_1px_5px_rgba(15,23,42,0.08)]">
      <header className="mb-4 space-y-1 text-left">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#667085]">记忆数据</p>
        <h3 className="text-[19px] font-semibold text-[#111827]">双栏浏览器</h3>
        <p className="text-[13px] text-[#475467]">
          左侧列表聚焦文件与过滤标签，右侧显示心智模型、操作按钮与蓝色提示。
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div role="region" aria-label="记忆文件列表" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                className="rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[12px] font-semibold text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.08)] transition"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {MEMORY_FILES.map((file) => {
              const active = file.id === activeFileId;

              return (
                <button
                  key={file.id}
                  type="button"
                  aria-label={`${file.label} (${file.size})`}
                  aria-pressed={active}
                  onClick={() => setActiveFileId(file.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition',
                    active
                      ? 'border-[#0a7aff] bg-[#ecf4ff]'
                      : 'border-black/[0.08] bg-white hover:border-[#0a7aff]/60',
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-[#111827]">{file.label}</p>
                    <p className="text-[12px] text-[#475467]">{file.tagLine}</p>
                  </div>
                  <div className="text-right text-[12px] leading-4 text-[#475467]">
                    <div>{file.updated}</div>
                    <div className="text-[12px] font-semibold text-[#111827]">{file.size}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="region"
          aria-label="记忆预览"
          className="space-y-4 rounded-[18px] border border-black/[0.08] bg-white p-5 shadow-[0_1px_6px_rgba(15,23,42,0.08)]"
        >
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#8e8e93]">
            {activeFile.breadcrumb.map((crumb, index) => (
              <span key={`${crumb}-${index}`} className="flex items-center gap-1">
                <span>{crumb}</span>
                {index < activeFile.breadcrumb.length - 1 && (
                  <span className="text-[#cbd5f5]">•</span>
                )}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[20px] font-semibold text-[#0f172a]">{activeFile.previewTitle}</p>
              <p className="text-[13px] text-[#475467]">{activeFile.previewMeta}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full border border-black/[0.08] px-3 py-1 text-[12px] font-semibold text-[#0a7aff]"
              >
                复制
              </button>
              <button
                type="button"
                className="rounded-full border border-black/[0.08] px-3 py-1 text-[12px] font-semibold text-[#0a7aff]"
              >
                编辑
              </button>
            </div>
          </div>

          <div className="rounded-[12px] border border-[#0a7aff]/40 bg-[#ecf4ff] px-4 py-3 text-[13px] font-medium text-[#0a7aff]">
            {activeFile.callout}
          </div>

          <div className="space-y-3 text-[13px] leading-6 text-[#475467]">
            {activeFile.previewHighlights.map((highlight) => (
              <p key={highlight} className="flex items-start gap-2">
                <span className="mt-0.5 text-[#0a7aff]">・</span>
                <span>{highlight}</span>
              </p>
            ))}

            <div className="space-y-3 pt-2">
              {activeFile.sections.map((section) => (
                <div key={section.title}>
                  <p className="text-[14px] font-semibold text-[#0f172a]">{section.title}</p>
                  <p className="text-[13px] text-[#475467]">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
