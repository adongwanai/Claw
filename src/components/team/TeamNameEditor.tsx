import { useState, useRef, useEffect } from 'react';
import { useTeamsStore } from '@/stores/teams';
import { cn } from '@/lib/utils';

interface TeamNameEditorProps {
  teamId: string;
  initialName: string;
  className?: string;
}

export function TeamNameEditor({ teamId, initialName, className }: TeamNameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const updateTeam = useTeamsStore(state => state.updateTeam);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (!name.trim() || name === initialName) {
      setIsEditing(false);
      setName(initialName);
      return;
    }

    setSaving(true);
    try {
      await updateTeam(teamId, { name: name.trim() });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update team name:', error);
      setName(initialName);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      void handleSave();
    } else if (e.key === 'Escape') {
      setName(initialName);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={saving}
        className={cn(
          "w-full px-2 py-1 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          className
        )}
      />
    );
  }

  return (
    <h3
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={cn(
        "cursor-pointer hover:text-blue-600 transition-colors",
        className
      )}
    >
      {initialName}
    </h3>
  );
}
