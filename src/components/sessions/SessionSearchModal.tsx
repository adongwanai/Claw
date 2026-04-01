/**
 * SessionSearchModal Component
 * Modal popup for searching sessions by name, agent, or content.
 */

import { useEffect, useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchSessions } from '@/lib/session-search';
import { SessionItem } from './SessionItem';
import { useChatStore } from '@/stores/chat';
import { useAgentsStore } from '@/stores/agents';
import { usePinnedSessions } from '@/lib/pinned-sessions';

interface SessionSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SessionSearchModal({ isOpen, onClose }: SessionSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const sessions = useChatStore((state) => state.sessions);
  const currentSessionKey = useChatStore((state) => state.currentSessionKey);
  const sessionLabels = useChatStore((state) => state.sessionLabels);
  const sessionLastActivity = useChatStore((state) => state.sessionLastActivity);
  const messages = useChatStore((state) => state.messages);
  const switchSession = useChatStore((state) => state.switchSession);
  const deleteSession = useChatStore((state) => state.deleteSession);

  const agents = useAgentsStore((state) => state.agents);
  const { pinnedSessionKeySet, toggleSessionPinned } = usePinnedSessions();

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build message map for current session only
  const sessionMessagesMap = useMemo(() => {
    const map = new Map();
    if (currentSessionKey && messages.length > 0) {
      map.set(currentSessionKey, messages);
    }
    return map;
  }, [currentSessionKey, messages]);

  // Filter sessions using search function
  const filteredSessions = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return sessions;
    }
    return searchSessions(sessions, debouncedQuery, agents, sessionMessagesMap);
  }, [sessions, debouncedQuery, agents, sessionMessagesMap]);

  // Sort sessions (pinned first, then by activity)
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((left, right) => {
      const leftPinned = pinnedSessionKeySet.has(left.key);
      const rightPinned = pinnedSessionKeySet.has(right.key);
      if (leftPinned !== rightPinned) {
        return leftPinned ? -1 : 1;
      }

      return (
        (sessionLastActivity[right.key] ?? right.updatedAt ?? 0) -
        (sessionLastActivity[left.key] ?? left.updatedAt ?? 0)
      );
    });
  }, [filteredSessions, pinnedSessionKeySet, sessionLastActivity]);

  // Get message preview for each session
  const getMessagePreview = (sessionKey: string): string => {
    const messages = sessionMessagesMap.get(sessionKey) || [];
    if (messages.length === 0) return '';
    const lastMessage = messages[messages.length - 1];
    const content = typeof lastMessage.content === 'string' ? lastMessage.content : '';
    return content.length > 50 ? content.slice(0, 50) + '...' : content;
  };

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Handle session click
  const handleSessionClick = (sessionKey: string) => {
    switchSession(sessionKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-black/10 px-4 py-3">
          <Search className="h-5 w-5 text-[#8e8e93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索会话名称、Agent 或内容..."
            className="flex-1 text-sm text-[#000000] outline-none placeholder:text-[#8e8e93]"
            autoFocus
          />
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8e8e93] transition-colors hover:bg-[#f2f2f7]"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-[500px] overflow-y-auto p-2">
          {sortedSessions.length > 0 ? (
            <div className="space-y-2">
              {sortedSessions.map((session) => {
                const label =
                  sessionLabels[session.key] ??
                  session.label ??
                  session.displayName ??
                  session.key;
                const isPinned = pinnedSessionKeySet.has(session.key);
                const isActive = currentSessionKey === session.key;
                const messagePreview = getMessagePreview(session.key);

                return (
                  <SessionItem
                    key={session.key}
                    session={session}
                    label={label}
                    isPinned={isPinned}
                    isActive={isActive}
                    messagePreview={messagePreview}
                    onClick={() => handleSessionClick(session.key)}
                    onPinToggle={() => toggleSessionPinned(session.key)}
                    onDelete={() => void deleteSession(session.key)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-3 h-12 w-12 text-[#c6c6c8]" />
              <p className="text-sm text-[#8e8e93]">
                {debouncedQuery.trim() ? '未找到匹配的会话' : '输入关键词搜索会话'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
