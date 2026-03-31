import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Network, X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface DroppedAgent {
  id: string;
  name: string;
  avatar?: string | null;
}

export function CreateTeamZone() {
  const [leader, setLeader] = useState<DroppedAgent | null>(null);
  const [members, setMembers] = useState<DroppedAgent[]>([]);
  const [isDragging] = useState(false);

  const { setNodeRef: setLeaderRef, isOver: isOverLeader } = useDroppable({
    id: 'leader-zone',
    data: { type: 'leader' },
  });

  const { setNodeRef: setMemberRef, isOver: isOverMember } = useDroppable({
    id: 'member-zone',
    data: { type: 'member' },
  });

  // 空状态：虚线框 + 提示文字 (per D-11)
  if (!leader && members.length === 0 && !isDragging) {
    return (
      <div className="fixed left-8 top-1/2 -translate-y-1/2 w-80">
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center">
          <Network className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            创建新团队
          </h3>
          <p className="text-sm text-slate-500">
            从右侧拖拽 Agent 到这里开始创建团队
          </p>
        </div>
      </div>
    );
  }

  // 展开状态：Leader 区 + 成员区 (per D-12)
  return (
    <div className="fixed left-8 top-1/2 -translate-y-1/2 w-96">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6">
        {/* Leader 区 */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-3">
            Leader（限 1 人）
          </h4>
          <div
            ref={setLeaderRef}
            className={cn(
              "min-h-[80px] rounded-xl border-2 border-dashed p-4",
              isOverLeader ? "border-blue-500 bg-blue-50" : "border-slate-300",
              leader && "border-solid border-blue-200 bg-blue-50"
            )}
          >
            {leader ? (
              <AgentChip
                agent={leader}
                onRemove={() => setLeader(null)}
              />
            ) : (
              <p className="text-sm text-slate-400 text-center">
                拖拽 Agent 到这里设为 Leader
              </p>
            )}
          </div>
        </div>

        {/* 成员区 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700">
              成员
            </h4>
            {members.length < 3 && (
              <span className="text-xs text-amber-600">
                建议至少 2-3 人
              </span>
            )}
          </div>
          <div
            ref={setMemberRef}
            className={cn(
              "min-h-[120px] rounded-xl border-2 border-dashed p-4",
              isOverMember ? "border-blue-500 bg-blue-50" : "border-slate-300",
              members.length > 0 && "border-solid border-slate-200"
            )}
          >
            {members.length > 0 ? (
              <div className="space-y-2">
                {members.map(member => (
                  <AgentChip
                    key={member.id}
                    agent={member}
                    onRemove={() => setMembers(prev => prev.filter(m => m.id !== member.id))}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center">
                拖拽 Agent 到这里添加成员
              </p>
            )}
          </div>
        </div>

        {/* 确认按钮（Plan 04 实现） */}
        <button
          disabled={!leader || members.length === 0}
          className="w-full py-3 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
        >
          创建团队
        </button>
      </div>
    </div>
  );
}

function AgentChip({ agent, onRemove }: { agent: DroppedAgent; onRemove: () => void }) {
  const initials = agent.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200">
      <Avatar className="h-8 w-8">
        {agent.avatar ? (
          <img src={agent.avatar} alt={agent.name} className="object-cover" />
        ) : (
          <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="flex-1 text-sm font-medium">{agent.name}</span>
      <button
        onClick={onRemove}
        className="p-1 rounded hover:bg-slate-100 transition-colors"
        aria-label="Remove agent"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  );
}
