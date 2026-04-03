import { Plus, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type EmployeeSquareFilterKey =
  | 'all'
  | 'leader'
  | 'worker'
  | 'direct'
  | 'leader_only'
  | 'with_team';

interface EmployeeSquareHeroProps {
  title: string;
  subtitle: string;
  totalCount: number;
  leaderCount: number;
  workerCount: number;
  activeFilter: EmployeeSquareFilterKey;
  onFilterChange: (filter: EmployeeSquareFilterKey) => void;
  onRefresh: () => void;
  onCreate: () => void;
  refreshLabel: string;
  createLabel: string;
  statLabels: {
    all: string;
    leaders: string;
    workers: string;
  };
  filterLabels: Record<EmployeeSquareFilterKey, string>;
}

const FILTER_ORDER: EmployeeSquareFilterKey[] = [
  'all',
  'leader',
  'worker',
  'direct',
  'leader_only',
  'with_team',
];

export function EmployeeSquareHero({
  title,
  subtitle,
  totalCount,
  leaderCount,
  workerCount,
  activeFilter,
  onFilterChange,
  onRefresh,
  onCreate,
  refreshLabel,
  createLabel,
  statLabels,
  filterLabels,
}: EmployeeSquareHeroProps) {
  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_45%,#eef4ff_100%)] p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Users className="h-3.5 w-3.5" />
            Employee Square
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 xl:justify-end">
          <Button
            variant="outline"
            onClick={onRefresh}
            className="h-10 rounded-full border-slate-200 bg-white/80 px-4 text-[13px] font-medium text-slate-700 shadow-none hover:bg-white"
          >
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            {refreshLabel}
          </Button>
          <Button
            onClick={onCreate}
            className="h-10 rounded-full px-4 text-[13px] font-medium shadow-sm"
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            {createLabel}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          { label: statLabels.all, value: totalCount },
          { label: statLabels.leaders, value: leaderCount },
          { label: statLabels.workers, value: workerCount },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur"
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              {stat.label}
            </div>
            <div className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTER_ORDER.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => onFilterChange(filter)}
            className={cn(
              'rounded-full border px-3 py-2 text-[13px] font-medium transition-colors',
              activeFilter === filter
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white/80 text-slate-600 hover:border-slate-300 hover:bg-white',
            )}
          >
            {filterLabels[filter]}
          </button>
        ))}
      </div>
    </section>
  );
}
