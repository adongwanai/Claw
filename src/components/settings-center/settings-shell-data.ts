export type SettingsGroupId = 'canonical';

export type SettingsSectionId =
  | 'costs-usage'
  | 'models-providers'
  | 'general'
  | 'skills-mcp'
  | 'tool-permissions'
  | 'memory-knowledge'
  | 'migration-backup'
  | 'app-updates'
  | 'about';

export type SettingsNavItem = {
  id: SettingsSectionId;
  labelKey: string;
  summaryKey?: string;
};

export type SettingsNavGroup = {
  id: SettingsGroupId;
  labelKey?: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    id: 'canonical',
    items: [
      { id: 'costs-usage', labelKey: 'settings:settingsShell.items.costs-usage.label' },
      { id: 'models-providers', labelKey: 'settings:settingsShell.items.models-providers.label' },
      { id: 'general', labelKey: 'settings:settingsShell.items.general.label' },
      { id: 'skills-mcp', labelKey: 'settings:settingsShell.items.skills-mcp.label' },
      { id: 'tool-permissions', labelKey: 'settings:settingsShell.items.tool-permissions.label' },
      { id: 'memory-knowledge', labelKey: 'settings:settingsShell.items.memory-knowledge.label' },
      { id: 'migration-backup', labelKey: 'settings:settingsShell.items.migration-backup.label' },
      { id: 'app-updates', labelKey: 'settings:settingsShell.items.app-updates.label' },
      { id: 'about', labelKey: 'settings:settingsShell.items.about.label' },
    ],
  },
];

export const DEFAULT_SETTINGS_SECTION: SettingsSectionId = 'costs-usage';

export const SETTINGS_SECTION_META: Record<
  SettingsSectionId,
  { titleKey: string; subtitleKey: string; kickerKey: string }
> = {
  'costs-usage': {
    titleKey: 'settings:settingsShell.meta.costs-usage.title',
    subtitleKey: 'settings:settingsShell.meta.costs-usage.subtitle',
    kickerKey: 'settings:settingsShell.meta.costs-usage.kicker',
  },
  'models-providers': {
    titleKey: 'settings:settingsShell.meta.models-providers.title',
    subtitleKey: 'settings:settingsShell.meta.models-providers.subtitle',
    kickerKey: 'settings:settingsShell.meta.models-providers.kicker',
  },
  general: {
    titleKey: 'settings:settingsShell.meta.general.title',
    subtitleKey: 'settings:settingsShell.meta.general.subtitle',
    kickerKey: 'settings:settingsShell.meta.general.kicker',
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
  'memory-knowledge': {
    titleKey: 'settings:settingsShell.meta.memory-knowledge.title',
    subtitleKey: 'settings:settingsShell.meta.memory-knowledge.subtitle',
    kickerKey: 'settings:settingsShell.meta.memory-knowledge.kicker',
  },
  'migration-backup': {
    titleKey: 'settings:settingsShell.meta.migration-backup.title',
    subtitleKey: 'settings:settingsShell.meta.migration-backup.subtitle',
    kickerKey: 'settings:settingsShell.meta.migration-backup.kicker',
  },
  'app-updates': {
    titleKey: 'settings:settingsShell.meta.app-updates.title',
    subtitleKey: 'settings:settingsShell.meta.app-updates.subtitle',
    kickerKey: 'settings:settingsShell.meta.app-updates.kicker',
  },
  about: {
    titleKey: 'settings:settingsShell.meta.about.title',
    subtitleKey: 'settings:settingsShell.meta.about.subtitle',
    kickerKey: 'settings:settingsShell.meta.about.kicker',
  },
};
