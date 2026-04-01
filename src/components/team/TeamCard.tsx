import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TeamSummary, TeamStatus } from '@/types/team';
import { Trash2, Users, Clock, CheckSquare } from 'lucide-react';
import { TeamNameEditor } from './TeamNameEditor';

interface TeamCardProps {
  team: TeamSummary;
  onDelete: (teamId: string) => void;
}

function formatLastActive(ts: number | undefined): string {
  if (!ts) return '从未活跃';
  const diff = Date.now() - ts;
  if (diff < 60_000) return '刚刚';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`;
  return `${Math.floor(diff / 86_400_000)} 天前`;
}

function getStatusConfig(status: TeamStatus): { variant: string; text: string; dot: string; bg: string; textColor: string } {
  switch (status) {
    case 'active':
      return {
        variant: 'default',
        text: '活跃',
        dot: 'bg-blue-500',
        bg: 'bg-blue-50',
        textColor: 'text-blue-700',
      };
    case 'idle':
      return {
        variant: 'secondary',
        text: '空闲',
        dot: 'bg-slate-400',
        bg: 'bg-slate-100',
        textColor: 'text-slate-600',
      };
    case 'blocked':
      return {
        variant: 'warning',
        text: '阻塞',
        dot: 'bg-amber-500',
        bg: 'bg-amber-50',
        textColor: 'text-amber-700',
      };
  }
}

export function TeamCard({ team, onDelete }: TeamCardProps) {
  const statusConfig = getStatusConfig(team.status);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(team.id);
  };

  // Calculate overflow count for member avatars
  const displayAvatars = team.memberAvatars.slice(0, 4);
  const overflowCount = team.memberCount > 4 ? team.memberCount - 4 : 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      className="group relative flex h-[220px] flex-col rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md"
    >
      <Link
        to={`/team-map/${team.id}`}
        className="flex flex-1 flex-col"
      >
        {/* Top: Team Name */}
        <div className="mb-3">
          <TeamNameEditor
            teamId={team.id}
            initialName={team.name}
            className="text-lg font-semibold text-slate-900"
          />
        </div>

        {/* Middle: Leader + Members */}
        <div className="mb-4 space-y-2.5">
          {/* Leader Section */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-sm font-semibold ring-2 ring-white shadow-sm">
              {team.leaderName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700">{team.leaderName}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-slate-200 text-slate-500">
              Leader
            </Badge>
          </div>

          {/* Members Section */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-1.5">
              {displayAvatars.map((member) => (
                <div
                  key={member.id}
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 text-[10px] font-medium shadow-sm"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {overflowCount > 0 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-slate-600 text-[10px] font-semibold">
                  +{overflowCount}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{team.memberCount} 成员</span>
            </div>
          </div>
        </div>

        {/* Bottom: Status + Info + Description */}
        <div className="mt-auto space-y-2.5">
          {/* Status badges row */}
          <div className="flex items-center gap-2.5">
            <Badge className={cn('gap-1 px-2 py-0.5 text-[10px] font-medium border', statusConfig.bg, statusConfig.textColor, `border-${statusConfig.dot.replace('bg-', '')}`)}>
              <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
              {statusConfig.text}
            </Badge>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{formatLastActive(team.lastActiveTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <CheckSquare className="w-3 h-3" />
              <span className="text-[10px]">{team.activeTaskCount} 任务</span>
            </div>
          </div>

          {/* Description */}
          <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
            {team.description || '暂无职责描述'}
          </p>
        </div>
      </Link>

      {/* Delete Button (hover visible) */}
      <button
        onClick={handleDelete}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-slate-400 opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100"
        aria-label="删除团队"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
