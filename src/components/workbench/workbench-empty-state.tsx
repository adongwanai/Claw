type WorkbenchEmptyStateProps = {
  agentName: string;
};

export function WorkbenchEmptyState({ agentName }: WorkbenchEmptyStateProps) {
  const suggestions = [
    {
      icon: '🔧',
      title: '代码重构方案',
      description: '梳理关键模块依赖，产出可落地的重构步骤与风险清单。',
    },
    {
      icon: '📊',
      title: '系统健康检查',
      description: '快速检查服务状态、任务执行与近期异常，给出修复优先级。',
    },
    {
      icon: '📝',
      title: '撰写周报汇总',
      description: '整合本周工作进展、关键成果与下周计划，生成结构化周报。',
    },
    {
      icon: '🧠',
      title: '查看团队记忆',
      description: '回看团队长期知识沉淀，快速补齐背景并统一执行口径。',
    },
  ];

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-8 py-12 text-center">
      <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-3xl text-white shadow-[0_12px_28px_rgba(16,185,129,0.24)]">
        ✦
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/90 shadow-sm" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">{agentName}</p>
      <h1 className="mt-3 text-[34px] font-medium tracking-[-0.02em] text-foreground">有什么我可以帮你的？</h1>
      <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
        从常见工作流开始，几分钟内进入协作状态。
      </p>
      <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-4 text-left md:grid-cols-2">
        {suggestions.map((suggestion) => (
          <article
            key={suggestion.title}
            className="rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-colors dark:border-white/10 dark:bg-white/[0.04]"
          >
            <p className="text-[18px] font-medium text-foreground">
              <span className="mr-2 inline-flex align-middle">{suggestion.icon}</span>
              {suggestion.title}
            </p>
            <p className="mt-3 text-[14px] leading-7 text-muted-foreground">{suggestion.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
