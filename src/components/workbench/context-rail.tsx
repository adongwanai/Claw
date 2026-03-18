import { useState } from 'react';
import { Bot, ChevronDown, Database, Settings2, UserRound, Wrench } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings';

export function ContextRail() {
  const contextRailCollapsed = useSettingsStore((state) => state.contextRailCollapsed);
  const setContextRailCollapsed = useSettingsStore((state) => state.setContextRailCollapsed);
  const [openModules, setOpenModules] = useState({
    about: true,
    capabilities: true,
    context: false,
    memory: false,
  });

  const toggleModule = (key: keyof typeof openModules) => {
    setOpenModules((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (contextRailCollapsed) {
    return (
      <aside className="flex h-full items-center border-l border-black/5 bg-[linear-gradient(180deg,#faf8f4_0%,#f4f1ec_100%)] px-2 py-3 dark:border-white/10 dark:bg-background">
        <button
          type="button"
          aria-label="展开上下文栏 Expand context rail"
          onClick={() => setContextRailCollapsed(false)}
          className="rounded-full border border-black/10 bg-white/80 px-3 py-1.5 text-xs text-foreground/80 shadow-sm transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
        >
          {'>'}
        </button>
      </aside>
    );
  }

  return (
    <aside className="h-full w-[340px] space-y-4 overflow-y-auto border-l border-black/5 bg-[linear-gradient(180deg,#faf8f4_0%,#f4f1ec_100%)] px-4 py-5 dark:border-white/10 dark:bg-background">
      <header className="flex items-center justify-between px-1">
        <p className="text-[14px] font-semibold tracking-wide text-foreground/90">Agent 检查器</p>
        <button
          type="button"
          aria-label="收起上下文栏 Collapse context rail"
          onClick={() => setContextRailCollapsed(true)}
          className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          折叠
        </button>
      </header>

      <section className="rounded-[26px] border border-black/5 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/5 text-foreground dark:bg-white/10">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold text-foreground">Frame 2 Agent</p>
            <p className="truncate text-[12px] text-muted-foreground">Inspector Mode · Online</p>
          </div>
        </div>
        <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
          负责执行状态检查、任务约束核验与上下文质量提醒。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] text-foreground/80 dark:bg-white/[0.08]">
            Runtime v2
          </span>
          <span className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] text-foreground/80 dark:bg-white/[0.08]">
            Safety Guard
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <article className="overflow-hidden rounded-[24px] border border-black/5 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <button
            type="button"
            aria-expanded={openModules.about}
            onClick={() => toggleModule('about')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <Settings2 className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-[14px] font-semibold text-foreground">关于与基础设置</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openModules.about ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          {openModules.about && (
            <div className="space-y-2 border-t border-black/5 px-4 py-3 text-[13px] text-muted-foreground dark:border-white/10">
              <p>角色：任务编排与状态核验助手</p>
              <p>响应风格：简洁、可追溯、优先给出可执行结论</p>
              <p>执行模式：自动巡检（每 15 分钟）</p>
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-[24px] border border-black/5 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <button
            type="button"
            aria-expanded={openModules.capabilities}
            onClick={() => toggleModule('capabilities')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <Wrench className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-[14px] font-semibold text-foreground">能力与工具</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openModules.capabilities ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          {openModules.capabilities && (
            <div className="space-y-2 border-t border-black/5 px-4 py-3 text-[13px] text-muted-foreground dark:border-white/10">
              <p>代码检索：`rg` / 语义索引</p>
              <p>变更执行：`apply_patch` 与测试回归</p>
              <p>外部能力：Gateway 代理调用、诊断任务</p>
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-[24px] border border-black/5 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <button
            type="button"
            aria-expanded={openModules.context}
            onClick={() => toggleModule('context')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <UserRound className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-[14px] font-semibold text-foreground">上下文与用户画像</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openModules.context ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          {openModules.context && (
            <div className="space-y-2 border-t border-black/5 px-4 py-3 text-[13px] text-muted-foreground dark:border-white/10">
              <p>关注点：跨代理协作效率与回归风险</p>
              <p>当前上下文：Workbench 右侧检查器改版</p>
              <p>偏好：优先稳定交付，其次视觉一致性</p>
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-[24px] border border-black/5 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
          <button
            type="button"
            aria-expanded={openModules.memory}
            onClick={() => toggleModule('memory')}
            className="flex w-full items-center gap-3 px-4 py-3 text-left"
          >
            <Database className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-[14px] font-semibold text-foreground">工作记忆</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openModules.memory ? 'rotate-180' : 'rotate-0'}`} />
          </button>
          {openModules.memory && (
            <div className="space-y-2 border-t border-black/5 px-4 py-3 text-[13px] text-muted-foreground dark:border-white/10">
              <p>短期记忆窗口：最近 24 条交互</p>
              <p>关键事实：保留任务约束与测试命令</p>
              <p>同步状态：3 分钟前已写入</p>
            </div>
          )}
        </article>
      </section>
    </aside>
  );
}
