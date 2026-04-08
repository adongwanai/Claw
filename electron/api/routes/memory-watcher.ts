/**
 * Memory Watcher
 * Manages fs.watch instances for watched memory directories.
 * Exported separately to allow clean testing without the full memory route.
 */
import { watch, type FSWatcher } from 'fs';

const dirWatchers = new Map<string, FSWatcher>();

function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  }) as T;
}

function triggerReindex(_dir: string): void {
  // Trigger reindex for all agent scopes whose workspaceDir is under dir.
  // The actual reindex logic lives in memory.ts; here we emit a signal
  // that can be consumed by the memory route or handled inline.
  // For now, log the intent — the memory route's reindex endpoint handles the work.
}

/**
 * Sync watched directories: set up watchers for new dirs, tear down for removed dirs.
 */
export function syncWatchedDirs(dirs: string[]): void {
  const newSet = new Set(dirs);

  // Tear down watchers for directories no longer in the list
  for (const [dir, watcher] of dirWatchers) {
    if (!newSet.has(dir)) {
      watcher.close();
      dirWatchers.delete(dir);
    }
  }

  // Set up watchers for new directories
  for (const dir of dirs) {
    if (dirWatchers.has(dir)) continue;
    try {
      const debouncedReindex = debounce(() => triggerReindex(dir), 500);
      const watcher = watch(dir, { recursive: true }, debouncedReindex);
      dirWatchers.set(dir, watcher);
    } catch {
      // Directory may not exist yet; skip silently
    }
  }
}

/**
 * Tear down all watchers (called on app quit).
 */
export function clearAllWatchers(): void {
  for (const watcher of dirWatchers.values()) {
    watcher.close();
  }
  dirWatchers.clear();
}
