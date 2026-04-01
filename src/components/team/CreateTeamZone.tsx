import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useTeamsStore } from '@/stores/teams';
import { useAgentsStore } from '@/stores/agents';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, ArrowRight } from 'lucide-react';

interface DroppedAgent {
  id: string;
  name: string;
  avatar?: string | null;
}

interface CreateTeamZoneProps {
  initialLeader?: DroppedAgent | null;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export interface CreateTeamZoneRef {
  handleLeaderDrop: (agentId: string) => void;
  handleMemberDrop: (agentId: string) => void;
}

function AgentChip({ agent, onRemove }: { agent: DroppedAgent; onRemove: () => void }) {
  const initials = agent.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-slate-100 shadow-sm">
      <Avatar className="h-7 w-7 ring-2 ring-slate-100">
        {agent.avatar ? (
          <img src={agent.avatar} alt={agent.name} className="object-cover" />
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 text-xs font-semibold">
            {initials}
          </AvatarFallback>
        )}
      </Avatar>
      <span className="flex-1 text-sm font-medium text-slate-700">{agent.name}</span>
      <button onClick={onRemove} className="p-1 rounded-md hover:bg-slate-100 transition-colors" aria-label="移除">
        <span className="text-slate-400 hover:text-slate-600">✕</span>
      </button>
    </div>
  );
}

export const CreateTeamZone = forwardRef<CreateTeamZoneRef, CreateTeamZoneProps>(
  ({ initialLeader, onCancel, onSuccess }, ref) => {
    const [leader, setLeader] = useState<DroppedAgent | null>(initialLeader || null);
    const [members, setMembers] = useState<DroppedAgent[]>([]);
    const [showConfirmForm, setShowConfirmForm] = useState(!!initialLeader);
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');
    const [creating, setCreating] = useState(false);

    const createTeam = useTeamsStore(state => state.createTeam);
    const agents = useAgentsStore(state => state.agents);

    useEffect(() => {
      if (initialLeader) {
        setLeader(initialLeader);
        setShowConfirmForm(true);
      }
    }, [initialLeader]);

    const { setNodeRef: setLeaderRef, isOver: isOverLeader } = useDroppable({ id: 'leader-zone', data: { type: 'leader' } });
    const { setNodeRef: setMemberRef, isOver: isOverMember } = useDroppable({ id: 'member-zone', data: { type: 'member' } });

    const generateUniqueName = (baseName: string, existingNames: string[]): string => {
      if (!existingNames.includes(baseName)) return baseName;
      let counter = 1;
      let newName = baseName + '-' + counter;
      while (existingNames.includes(newName)) { counter++; newName = baseName + '-' + counter; }
      return newName;
    };

    const handleLeaderDrop = (agentId: string) => {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;
      if (leader?.id === agentId) return;
      const existingNames = [leader?.name, ...members.map(m => m.name)].filter(Boolean) as string[];
      const uniqueName = generateUniqueName(agent.name, existingNames);
      setLeader({ id: agent.id, name: uniqueName, avatar: agent.avatar });
    };

    const handleMemberDrop = (agentId: string) => {
      const agent = agents.find(a => a.id === agentId);
      if (!agent) return;
      const existingNames = [leader?.name, ...members.map(m => m.name)].filter(Boolean) as string[];
      const uniqueName = generateUniqueName(agent.name, existingNames);
      const exists = members.some(m => m.id === agentId && m.name === uniqueName);
      if (!exists) setMembers(prev => [...prev, { id: agent.id, name: uniqueName, avatar: agent.avatar }]);
    };

    useImperativeHandle(ref, () => ({ handleLeaderDrop, handleMemberDrop }), [agents, leader, members]);

    const handleConfirm = async () => {
      if (!leader || !teamName.trim()) return;
      setCreating(true);
      try {
        await createTeam({
          leaderId: leader.id,
          memberIds: members.map(m => m.id),
          name: teamName.trim(),
          description: description.trim() || undefined,
        });
        setLeader(null); setMembers([]); setTeamName(''); setDescription(''); setShowConfirmForm(false);
        onSuccess?.();
      } catch (error) { console.error('Failed to create team:', error); }
      finally { setCreating(false); }
    };

    const handleCancel = () => {
      setShowConfirmForm(false); setTeamName(''); setDescription(''); setLeader(null); setMembers([]);
      onCancel?.();
    };

    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/50 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">创建新团队</h3>
              <p className="text-xs text-slate-500">{leader ? '继续添加成员' : '拖拽 Agent 到下方区域'}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">Leader</span>
              </div>
              <span className="text-[10px] text-slate-400">限 1 人</span>
            </div>
            <div ref={setLeaderRef} className={cn(
              "min-h-[72px] rounded-xl border-2 p-3 transition-all",
              isOverLeader ? "border-blue-400 bg-blue-50/50 border-solid" :
              leader ? "border-slate-200 bg-slate-50/50 border-solid" :
              "border-dashed border-slate-200 bg-white/80"
            )}>
              {leader ? (
                <AgentChip agent={leader} onRemove={() => setLeader(null)} />
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <span className="text-base">👤</span>
                  </div>
                  <span className="text-xs text-slate-400">拖拽 Agent 到这里</span>
                </div>
              )}
            </div>
          </div>

          {leader && (
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
                <ArrowRight className="h-3.5 w-3.5" />
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-slate-600">成员</span>
              </div>
              {members.length > 0 && members.length < 3 && (
                <span className="text-[10px] text-amber-500 font-medium">建议至少 2-3 人</span>
              )}
            </div>
            <div ref={setMemberRef} className={cn(
              "min-h-[88px] rounded-xl border-2 p-3 transition-all",
              isOverMember ? "border-blue-400 bg-blue-50/50 border-solid" :
              members.length > 0 ? "border-slate-200 bg-slate-50/50 border-solid" :
              "border-dashed border-slate-200 bg-white/80"
            )}>
              {members.length > 0 ? (
                <div className="space-y-2">
                  {members.map(member => (
                    <AgentChip key={member.id + '-' + member.name} agent={member} onRemove={() => setMembers(prev => prev.filter(m => !(m.id === member.id && m.name === member.name))} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                    <span className="text-base">👥</span>
                  </div>
                  <span className="text-xs text-slate-400">拖拽多个 Agent 到这里</span>
                </div>
              )}
            </div>
          </div>

          {!showConfirmForm && (
            <button onClick={() => setShowConfirmForm(true)} disabled={!leader} className={cn(
              "w-full py-2.5 rounded-xl text-sm font-semibold transition-all",
              leader ? "bg-blue-500 text-white hover:bg-blue-600 shadow-sm" :
              "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}>
              创建团队
            </button>
          )}

          <AnimatePresence>
            {showConfirmForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-700">确认创建团队</h4>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">团队名称</label>
                    <input type="text" value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="输入团队名称"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-1">职责描述 <span className="text-slate-400">(可选)</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述团队的职责和目标" rows={2}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none resize-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleCancel} disabled={creating}
                      className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-white transition-colors">
                      取消
                    </button>
                    <button onClick={handleConfirm} disabled={creating || !teamName.trim()}
                      className="flex-1 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm">
                      {creating ? '创建中...' : '确认创建'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }
);

export default CreateTeamZone;
