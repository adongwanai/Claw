export type SettingsGroupId = 'basic' | 'workflow' | 'capability' | 'governance';

export type SettingsSectionId =
  | 'general'
  | 'model-provider'
  | 'team-role-strategy'
  | 'channel-advanced'
  | 'automation-defaults'
  | 'memory-knowledge'
  | 'skills-mcp'
  | 'tool-permissions'
  | 'agent-avatars'
  | 'migration-backup'
  | 'auto-update'
  | 'feedback-developer';

export type SettingsNavItem = {
  id: SettingsSectionId;
  labelKey: string;
  summaryKey?: string;
};

export type SettingsNavGroup = {
  id: SettingsGroupId;
  labelKey: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    id: 'basic',
    labelKey: 'settings:settingsShell.groups.basic',
    items: [
      { id: 'general', labelKey: 'settings:settingsShell.items.general.label' },
      { id: 'model-provider', labelKey: 'settings:settingsShell.items.model-provider.label' },
    ],
  },
  {
    id: 'workflow',
    labelKey: 'settings:settingsShell.groups.workflow',
    items: [
      { id: 'team-role-strategy', labelKey: 'settings:settingsShell.items.team-role-strategy.label' },
      { id: 'channel-advanced', labelKey: 'settings:settingsShell.items.channel-advanced.label' },
      { id: 'automation-defaults', labelKey: 'settings:settingsShell.items.automation-defaults.label' },
    ],
  },
  {
    id: 'capability',
    labelKey: 'settings:settingsShell.groups.capability',
    items: [
      { id: 'memory-knowledge', labelKey: 'settings:settingsShell.items.memory-knowledge.label' },
      { id: 'skills-mcp', labelKey: 'settings:settingsShell.items.skills-mcp.label' },
      { id: 'tool-permissions', labelKey: 'settings:settingsShell.items.tool-permissions.label' },
      { id: 'agent-avatars', labelKey: 'settings:settingsShell.items.agent-avatars.label' },
    ],
  },
  {
    id: 'governance',
    labelKey: 'settings:settingsShell.groups.governance',
    items: [
      { id: 'migration-backup', labelKey: 'settings:settingsShell.items.migration-backup.label' },
      { id: 'auto-update', labelKey: 'settings:settingsShell.items.auto-update.label' },
      { id: 'feedback-developer', labelKey: 'settings:settingsShell.items.feedback-developer.label' },
    ],
  },
];

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = 'general';

export const SETTINGS_SECTION_META: Record<
  SettingsSectionId,
  { titleKey: string; subtitleKey: string; kickerKey: string }
> = {
  general: {
    titleKey: 'settings:settingsShell.meta.general.title',
    subtitleKey: 'settings:settingsShell.meta.general.subtitle',
    kickerKey: 'settings:settingsShell.meta.general.kicker',
  },
  'model-provider': {
    titleKey: 'settings:settingsShell.meta.model-provider.title',
    subtitleKey: 'settings:settingsShell.meta.model-provider.subtitle',
    kickerKey: 'settings:settingsShell.meta.model-provider.kicker',
  },
  'team-role-strategy': {
    titleKey: 'settings:settingsShell.meta.team-role-strategy.title',
    subtitleKey: 'settings:settingsShell.meta.team-role-strategy.subtitle',
    kickerKey: 'settings:settingsShell.meta.team-role-strategy.kicker',
  },
  'channel-advanced': {
    titleKey: 'settings:settingsShell.meta.channel-advanced.title',
    subtitleKey: 'settings:settingsShell.meta.channel-advanced.subtitle',
    kickerKey: 'settings:settingsShell.meta.channel-advanced.kicker',
  },
  'automation-defaults': {
    titleKey: 'settings:settingsShell.meta.automation-defaults.title',
    subtitleKey: 'settings:settingsShell.meta.automation-defaults.subtitle',
    kickerKey: 'settings:settingsShell.meta.automation-defaults.kicker',
  },
  'memory-knowledge': {
    titleKey: 'settings:settingsShell.meta.memory-knowledge.title',
    subtitleKey: 'settings:settingsShell.meta.memory-knowledge.subtitle',
    kickerKey: 'settings:settingsShell.meta.memory-knowledge.kicker',
  },
  'skills-mcp': {
    titleKey: 'settings:settingsShell.meta.skills-mcp.title',
    subtitleKey: 'settings:settingsShell.meta.skills-mcp.subtitle',
    kickerKey: 'settings:settingsShell.meta.skills-mcp.kicker',
  },
  'tool-permissions': {
    titleKey: 'settings:settingsShell.meta.tool-permissions.title',
    subtitleKey: 'settings:settingsShell.meta.tool-permissions.subtitle',
    kickerKey: 'settings:settingsShell.meta.tool-permissions.kicker',
  },
  'agent-avatars': {
    titleKey: 'settings:settingsShell.meta.agent-avatars.title',
    subtitleKey: 'settings:settingsShell.meta.agent-avatars.subtitle',
    kickerKey: 'settings:settingsShell.meta.agent-avatars.kicker',
  },
  'migration-backup': {
    titleKey: 'settings:settingsShell.meta.migration-backup.title',
    subtitleKey: 'settings:settingsShell.meta.migration-backup.subtitle',
    kickerKey: 'settings:settingsShell.meta.migration-backup.kicker',
  },
  'auto-update': {
    titleKey: 'settings:settingsShell.meta.auto-update.title',
    subtitleKey: 'settings:settingsShell.meta.auto-update.subtitle',
    kickerKey: 'settings:settingsShell.meta.auto-update.kicker',
  },
  'feedback-developer': {
    titleKey: 'settings:settingsShell.meta.feedback-developer.title',
    subtitleKey: 'settings:settingsShell.meta.feedback-developer.subtitle',
    kickerKey: 'settings:settingsShell.meta.feedback-developer.kicker',
  },
};
