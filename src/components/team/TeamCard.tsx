import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TeamSummary, TeamStatus } from '@/types/team';
import { Clock, CheckSquare, MoreVertical, Crown, Trash2, Edit } from 'lucide-react';
import { TeamNameEditor } from './TeamNameEditor';
import { useState } from 'react';

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

function getStatusConfig(status: TeamStatus): {
  text: string;
  dotColor: string;
  textColor: string;
} {
  switch (status) {
    case 'active':
      return {
        text: '活跃',
        dotColor: 'bg-green-500',
        textColor: 'text-green-700',
      };
    case 'idle':
      return {
        text: '空闲',
        dotColor: 'bg-slate-400',
        textColor: 'text-slate-600',
      };
    case 'blocked':
      return {
        text: '阻塞',
        dotColor: 'bg-amber-500',
        textColor: 'text-amber-700',
      };
  }
}

export function TeamCard({ team, onDelete }: TeamCardProps) {
  const statusConfig = getStatusConfig(team.status);
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('删除团队不会删除 Agent，仅解除团队关系。确认删除？')) {
      onDelete(team.id);
    }
  };

  // Calculate overflow count for member avatars
  const displayAvatars = team.memberAvatars.slice(0, 3);
  const overflowCount = team.memberCount > 3 ? team.memberCount - 3 : 0;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
      className="group relative flex h-[240px] flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
    >
      <Link to={`/team-map/${team.id}`} className="flex flex-1 flex-col">
        {/* Header: Team Name + Menu */}
        <div className="mb-4 flex items-start justify-between">
          <TeamNameEditor
            teamId={team.id}
            initialName={team.name}
            className="text-lg font-semibold text-slate-800"
          />
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="rounded-lg p-1.5 text-slate-400 opacity-0 transition-all hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                    // TODO: Implement edit
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="h-3.5 w-3.5" />
                  编辑
                </button>
                <button
                  onClick={handleDelete}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Body: Leader + Members */}
        <div className="mb-4 space-y-3">
          {/* Leader */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-sm font-semibold text-blue-600 ring-2 ring-white shadow-sm">
                {team.leaderName.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 ring-2 ring-white">
                <Crown className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-slate-700">{team.leaderName}</span>
          </div>

          {/* Members */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {displayAvatars.map((member) => (
                <div
                  key={member.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium text-slate-600 shadow-sm"
                  title={member.name}
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {overflowCount > 0 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold text-slate-600">
                  +{overflowCount}
                </div>
              )}
            </div>
            <span className="text-xs font-medium text-slate-500">{team.memberCount} 成员</span>
          </div>
        </div>

        {/* Footer: Status + Info */}
        <div className="mt-auto space-y-3">
          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Status Row */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className={cn('h-2 w-2 rounded-full', statusConfig.dotColor)} />
              <span className={cn('text-xs font-medium', statusConfig.textColor)}>
                {statusConfig.text}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatLastActive(team.lastActiveTime)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <CheckSquare className="h-3 w-3" />
              <span className="text-xs">{team.activeTaskCount} 任务</span>
            </div>
          </div>

          {/* Description */}
          {team.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-slate-400">
              {team.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
