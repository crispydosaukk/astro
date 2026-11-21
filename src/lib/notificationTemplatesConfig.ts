export type NotificationDeliveryMode = 'push_and_inapp' | 'push_only' | 'inapp_only';
export type NotificationPriority = 'normal' | 'high';

export type NotificationCategoryColorKey =
  | 'purple'
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'rose'
  | 'slate'
  | 'indigo'
  | 'teal'
  | 'orange'
  | 'pink';

export interface CategoryColorPreset {
  key: NotificationCategoryColorKey;
  label: string;
  hex: string;
  badgeClass: string;
  dotClass: string;
}

export const CATEGORY_COLOR_PRESETS: Record<NotificationCategoryColorKey, CategoryColorPreset> = {
  purple: {
    key: 'purple',
    label: 'Cosmic Purple',
    hex: '#9370DB',
    badgeClass: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    dotClass: 'bg-purple-500',
  },
  amber: {
    key: 'amber',
    label: 'Vedic Gold',
    hex: '#E69F00',
    badgeClass: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    dotClass: 'bg-amber-500',
  },
  blue: {
    key: 'blue',
    label: 'Celestial Blue',
    hex: '#4FC3F7',
    badgeClass: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  emerald: {
    key: 'emerald',
    label: 'Prosperity Green',
    hex: '#2D9E6B',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  rose: {
    key: 'rose',
    label: 'Sacred Crimson',
    hex: '#E86A58',
    badgeClass: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
    dotClass: 'bg-rose-500',
  },
  slate: {
    key: 'slate',
    label: 'Classic Neutral',
    hex: '#C9A84C',
    badgeClass: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
    dotClass: 'bg-slate-500',
  },
  indigo: {
    key: 'indigo',
    label: 'Midnight Indigo',
    hex: '#6366F1',
    badgeClass: 'bg-indigo-500/15 text-indigo-600 border-indigo-500/30',
    dotClass: 'bg-indigo-500',
  },
  teal: {
    key: 'teal',
    label: 'Serene Teal',
    hex: '#14B8A6',
    badgeClass: 'bg-teal-500/15 text-teal-600 border-teal-500/30',
    dotClass: 'bg-teal-500',
  },
  orange: {
    key: 'orange',
    label: 'Saffron Flame',
    hex: '#F97316',
    badgeClass: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
    dotClass: 'bg-orange-500',
  },
  pink: {
    key: 'pink',
    label: 'Lotus Pink',
    hex: '#EC4899',
    badgeClass: 'bg-pink-500/15 text-pink-600 border-pink-500/30',
    dotClass: 'bg-pink-500',
  },
};

export const CATEGORY_COLOR_LIST: CategoryColorPreset[] = Object.values(CATEGORY_COLOR_PRESETS);

export const SUGGESTED_CATEGORY_EMOJIS = [
  '✨',
  '🪔',
  '📞',
  '🎁',
  '🕉️',
  '🔔',
  '🌙',
  '🪐',
  '🔮',
  '🛕',
  '💍',
  '🎉',
  '🔱',
  '📣',
  '🌸',
  '⭐',
];

export interface DynamicNotificationCategory {
  id: string;
  label: string;
  emoji: string;
  colorKey: NotificationCategoryColorKey;
  color: string;
  badgeClass: string;
  description?: string;
  active?: boolean;
  defaultEnabled?: boolean;
  isBuiltIn?: boolean;
}

export interface AppNotificationSettingsScreenConfig {
  inboxScreenTitle: string;
  settingsScreenTitle: string;
  statusActiveTitle: string;
  statusActiveSubtitle: string;
  statusGrantedFallbackSubtitle: string;
  statusOffTitle: string;
  statusOffSubtitle: string;
  masterSectionHeading: string;
  masterToggleTitle: string;
  masterToggleSubtitle: string;
  categoriesSectionHeading: string;
  deliverySectionHeading: string;
  soundTitle: string;
  soundSubtitle: string;
  defaultSoundEnabled: boolean;
  vibrationTitle: string;
  vibrationSubtitle: string;
  defaultVibrationEnabled: boolean;
  quietHoursTitle: string;
  quietHoursSubtitle: string;
  defaultQuietHoursEnabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  showTestButtons: boolean;
  instantTestButtonLabel: string;
  lockScreenTestButtonLabel: string;
  enablePushBannerTitle: string;
  enablePushBannerSubtitle: string;
  emptyAllTitle: string;
  emptyAllSubtitle: string;
  emptyUnreadTitle: string;
  emptyUnreadSubtitle: string;
}

export interface DynamicNotificationTemplate {
  id: string;
  name: string;
  category: string;
  title: string;
  subtitle?: string;
  body: string;
  ctaText?: string;
  actionRoute: string;
  deliveryMode: NotificationDeliveryMode;
  priority: NotificationPriority;
  imageUrl?: string;
  isDefault?: boolean;
  isCategoryDefault?: boolean;
  isBuiltIn?: boolean;
  updatedAt?: string;
}

export interface NotificationTemplatesConfig {
  categories: DynamicNotificationCategory[];
  templates: DynamicNotificationTemplate[];
  autoLoadOnOpen: boolean;
  autoLoadOnCategoryChange: boolean;
  settingsScreen: AppNotificationSettingsScreenConfig;
  updatedAt?: string;
}

export const DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN: AppNotificationSettingsScreenConfig = {
  inboxScreenTitle: 'Notifications',
  settingsScreenTitle: 'Notification Settings',
  statusActiveTitle: 'Push Notifications Active',
  statusActiveSubtitle: 'Device registered for live AstroParihar push & in-app alerts.',
  statusGrantedFallbackSubtitle: 'Permission granted. Alerts will appear live on this device.',
  statusOffTitle: 'Push Notifications Off',
  statusOffSubtitle: 'Allow notifications to receive auspicious timings & astrologer alerts.',
  masterSectionHeading: 'Master Control',
  masterToggleTitle: 'All Notifications',
  masterToggleSubtitle: 'Pause or resume all AstroParihar alerts',
  categoriesSectionHeading: 'Astrological Alerts & Categories',
  deliverySectionHeading: 'Delivery Preferences',
  soundTitle: 'Notification Sound',
  soundSubtitle: 'Play alert tone when notifications arrive',
  defaultSoundEnabled: true,
  vibrationTitle: 'Vibration',
  vibrationSubtitle: 'Vibrate device on incoming alerts',
  defaultVibrationEnabled: true,
  quietHoursTitle: 'Quiet Hours (10:00 PM – 7:00 AM)',
  quietHoursSubtitle: 'Silence non-urgent alerts during night rest',
  defaultQuietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  showTestButtons: true,
  instantTestButtonLabel: 'Send Instant Test Banner',
  lockScreenTestButtonLabel: 'Test Lock-Screen Push (Arrives in 5s — Lock Phone)',
  enablePushBannerTitle: 'Enable Live Push Alerts',
  enablePushBannerSubtitle:
    'Receive daily horoscope, auspicious Muhurat & live consultation reminders.',
  emptyAllTitle: 'No Notifications Yet',
  emptyAllSubtitle:
    'Daily horoscopes, Panchang timings, consultation alerts, and special offers from AstroParihar will appear here.',
  emptyUnreadTitle: 'You are all caught up!',
  emptyUnreadSubtitle: 'All your cosmic updates and reminders have been read.',
};

export const DEFAULT_NOTIFICATION_CATEGORIES: DynamicNotificationCategory[] = [
  {
    id: 'horoscope',
    label: 'Daily Horoscope',
    emoji: '✨',
    colorKey: 'purple',
    color: CATEGORY_COLOR_PRESETS.purple.hex,
    badgeClass: CATEGORY_COLOR_PRESETS.purple.badgeClass,
    description: 'Morning Rashi forecasts & planetary transits',
    active: true,
    defaultEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'panchang',
    label: 'Panchang & Muhurat',
    emoji: '🪔',
    colorKey: 'amber',
    color: CATEGORY_COLOR_PRESETS.amber.hex,
    badgeClass: CATEGORY_COLOR_PRESETS.amber.badgeClass,
    description: 'Daily Tithi, Abhijit Muhurat & Rahu Kaal',
    active: true,
    defaultEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'consultation',
    label: 'Consultations & Chat',
    emoji: '📞',
    colorKey: 'blue',
    color: CATEGORY_COLOR_PRESETS.blue.hex,
    badgeClass: CATEGORY_COLOR_PRESETS.blue.badgeClass,
    description: 'Astrologer availability, call & chat reminders',
    active: true,
    defaultEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'offers',
    label: 'Offers & Wallet Updates',
    emoji: '🎁',
    colorKey: 'emerald',
    color: CATEGORY_COLOR_PRESETS.emerald.hex,
    badgeClass: CATEGORY_COLOR_PRESETS.emerald.badgeClass,
    description: 'Recharge bonuses, festive discounts & receipts',
    active: true,
    defaultEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'remedies',
    label: 'Vedic Remedies & Reports',
    emoji: '🕉️',
    colorKey: 'rose',
    color: CATEGORY_COLOR_PRESETS.rose.hex,
    badgeClass: CATEGORY_COLOR_PRESETS.rose.badgeClass,
    description: 'Ashta Parihar reminders & Kundli PDF updates',
    active: true,
    defaultEnabled: true,
    isBuiltIn: true,
  },
  {
    id: 'system',
    label: 'Account & Security Alerts',
    emoji: '🔔',
    colorKey: 'slate',
    color: CATEGORY_COLOR_PRESETS.slate.hex,
    badgeClass: CATEGORY_COLOR_PRESETS.slate.badgeClass,
    description: 'Important platform & account notices',
    active: true,
    defaultEnabled: true,
    isBuiltIn: true,
  },
];

export const DEFAULT_NOTIFICATION_TEMPLATES: DynamicNotificationTemplate[] = [
  {
    id: 'tpl_morning_horoscope',
    name: 'Morning Horoscope',
    category: 'horoscope',
    title: '✨ Your Stars Have Spoken Today!',
    subtitle: 'Daily Vedic Horoscope Ready',
    body: 'Lucky colour, auspicious timing & today’s planetary shift for your Rashi are live now. Tap to read!',
    ctaText: 'Read Horoscope',
    actionRoute: '/horoscope-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    imageUrl: '',
    isDefault: true,
    isCategoryDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'tpl_flash_wallet_bonus',
    name: 'Flash Wallet Bonus',
    category: 'offers',
    title: '🎁 Flat Bonus Credits Unlocked!',
    subtitle: 'Limited-Time Offer • Today Only',
    body: 'Recharge your AstroParihar wallet now and get instant extra minutes for live Acharya consultations.',
    ctaText: 'Claim Offer',
    actionRoute: '/wallet-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    imageUrl: '',
    isCategoryDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'tpl_abhijit_muhurat',
    name: 'Abhijit Muhurat',
    category: 'panchang',
    title: '🪔 Auspicious Muhurat Starting Soon',
    subtitle: 'Today’s Panchang & Rahu Kaal',
    body: 'Check today’s Tithi, Nakshatra & Abhijit Muhurat before starting any important work or journey.',
    ctaText: 'View Panchang',
    actionRoute: '/panchang-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    imageUrl: '',
    isCategoryDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'tpl_acharya_online_now',
    name: 'Acharya Online Now',
    category: 'consultation',
    title: '📞 Top Vedic Acharyas Are Online!',
    subtitle: 'Zero Wait Time • Instant Connect',
    body: 'Confused about Career, Marriage, or Dasha? Start a private 1-on-1 call or chat right now.',
    ctaText: 'Consult Now',
    actionRoute: '/live-astrologers-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    imageUrl: '',
    isCategoryDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'tpl_kundli_match_alert',
    name: 'Kundli Match Alert',
    category: 'remedies',
    title: '💍 36-Guna Kundli Milan Ready',
    subtitle: 'Vedic Compatibility Analysis',
    body: 'Check Ashta Koota points, Manglik Dosha & Bhakoot status instantly with accurate Vedic algorithms.',
    ctaText: 'Match Now',
    actionRoute: '/match-kundli-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'high',
    imageUrl: '',
    isCategoryDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'tpl_system_announcement',
    name: 'Platform Announcement',
    category: 'system',
    title: '🔔 Important Update from AstroParihar',
    subtitle: 'Account & App Notice',
    body: 'We have rolled out new Vedic features and smoother live consultations. Open the app to explore what is new.',
    ctaText: 'Explore Now',
    actionRoute: '/home-dashboard-screen',
    deliveryMode: 'push_and_inapp',
    priority: 'normal',
    imageUrl: '',
    isCategoryDefault: true,
    isBuiltIn: true,
  },
];

export const DEFAULT_NOTIFICATION_TEMPLATES_CONFIG: NotificationTemplatesConfig = {
  categories: DEFAULT_NOTIFICATION_CATEGORIES,
  templates: DEFAULT_NOTIFICATION_TEMPLATES,
  autoLoadOnOpen: true,
  autoLoadOnCategoryChange: true,
  settingsScreen: DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN,
};

export function slugifyCategoryId(raw: string): string {
  return String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40);
}

export function slugifyTemplateId(raw: string): string {
  const slug = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return slug ? `tpl_${slug}` : `tpl_${Date.now()}`;
}

export function sanitizeNotificationConfig(
  input?: Partial<NotificationTemplatesConfig> | null
): NotificationTemplatesConfig {
  const rawCategories = Array.isArray(input?.categories) ? input!.categories : [];
  const seenCatIds = new Set<string>();
  const categories: DynamicNotificationCategory[] = [];

  for (const item of rawCategories) {
    if (!item || typeof item !== 'object') continue;
    const id = slugifyCategoryId(item.id || item.label || '');
    const label = String(item.label || '').trim();
    if (!id || !label || seenCatIds.has(id)) continue;
    seenCatIds.add(id);

    const colorKey: NotificationCategoryColorKey =
      item.colorKey && item.colorKey in CATEGORY_COLOR_PRESETS
        ? (item.colorKey as NotificationCategoryColorKey)
        : 'amber';
    const preset = CATEGORY_COLOR_PRESETS[colorKey];

    categories.push({
      id,
      label: label.slice(0, 48),
      emoji: String(item.emoji || '🔔').trim().slice(0, 8) || '🔔',
      colorKey,
      color: typeof item.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(item.color.trim())
        ? item.color.trim()
        : preset.hex,
      badgeClass: preset.badgeClass,
      description: typeof item.description === 'string' ? item.description.trim().slice(0, 120) : '',
      active: item.active !== false,
      defaultEnabled: item.defaultEnabled !== false,
      isBuiltIn: Boolean(item.isBuiltIn || id === 'system'),
    });
  }

  const finalCategories =
    categories.length > 0 ? categories : [...DEFAULT_NOTIFICATION_CATEGORIES];

  // Ensure 'system' fallback category always exists
  if (!finalCategories.some((c) => c.id === 'system')) {
    const sys = DEFAULT_NOTIFICATION_CATEGORIES.find((c) => c.id === 'system')!;
    finalCategories.push(sys);
  }

  const validCatIdSet = new Set(finalCategories.map((c) => c.id));
  const rawTemplates = Array.isArray(input?.templates) ? input!.templates : [];
  const seenTplIds = new Set<string>();
  const templates: DynamicNotificationTemplate[] = [];

  for (const item of rawTemplates) {
    if (!item || typeof item !== 'object') continue;
    const name = String(item.name || '').trim();
    const title = String(item.title || '').trim();
    const body = String(item.body || '').trim();
    if (!name || !title || !body) continue;

    let id = String(item.id || '').trim().replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
    if (!id || seenTplIds.has(id)) {
      id = `${slugifyTemplateId(name)}_${templates.length + 1}`;
    }
    seenTplIds.add(id);

    const catId = slugifyCategoryId(item.category || 'system') || 'system';
    const category = validCatIdSet.has(catId) ? catId : finalCategories[0].id;
    const deliveryMode: NotificationDeliveryMode =
      item.deliveryMode === 'push_only' || item.deliveryMode === 'inapp_only'
        ? item.deliveryMode
        : 'push_and_inapp';
    const priority: NotificationPriority = item.priority === 'normal' ? 'normal' : 'high';

    templates.push({
      id,
      name: name.slice(0, 64),
      category,
      title: title.slice(0, 160),
      subtitle: typeof item.subtitle === 'string' ? item.subtitle.trim().slice(0, 160) : '',
      body: body.slice(0, 600),
      ctaText: typeof item.ctaText === 'string' ? item.ctaText.trim().slice(0, 48) : '',
      actionRoute: String(item.actionRoute || '/notifications-screen').trim() || '/notifications-screen',
      deliveryMode,
      priority,
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl.trim().slice(0, 500) : '',
      isDefault: Boolean(item.isDefault),
      isCategoryDefault: Boolean(item.isCategoryDefault),
      isBuiltIn: Boolean(item.isBuiltIn),
      updatedAt: item.updatedAt || new Date().toISOString(),
    });
  }

  // Enforce at most one global default template and at most one category default per category
  let hasGlobalDefault = false;
  const seenCatDefaults = new Set<string>();
  const normalizedTemplates = templates.map((t) => {
    let isDefault = Boolean(t.isDefault);
    if (isDefault) {
      if (hasGlobalDefault) isDefault = false;
      else hasGlobalDefault = true;
    }

    let isCategoryDefault = Boolean(t.isCategoryDefault);
    if (isCategoryDefault) {
      if (seenCatDefaults.has(t.category)) isCategoryDefault = false;
      else seenCatDefaults.add(t.category);
    }

    return { ...t, isDefault, isCategoryDefault };
  });

  // Only fall back to DEFAULT_NOTIFICATION_TEMPLATES when input itself had no templates key
  const finalTemplates =
    Array.isArray(input?.templates) ? normalizedTemplates : [...DEFAULT_NOTIFICATION_TEMPLATES];

  const rawScreen =
    input?.settingsScreen && typeof input.settingsScreen === 'object'
      ? input.settingsScreen
      : ({} as Partial<AppNotificationSettingsScreenConfig>);
  const sStr = (val: unknown, fallback: string, maxLen = 180): string =>
    typeof val === 'string' && val.trim().length > 0 ? val.trim().slice(0, maxLen) : fallback;

  const settingsScreen: AppNotificationSettingsScreenConfig = {
    inboxScreenTitle: sStr(rawScreen.inboxScreenTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.inboxScreenTitle, 60),
    settingsScreenTitle: sStr(rawScreen.settingsScreenTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.settingsScreenTitle, 60),
    statusActiveTitle: sStr(rawScreen.statusActiveTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.statusActiveTitle, 80),
    statusActiveSubtitle: sStr(rawScreen.statusActiveSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.statusActiveSubtitle),
    statusGrantedFallbackSubtitle: sStr(rawScreen.statusGrantedFallbackSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.statusGrantedFallbackSubtitle),
    statusOffTitle: sStr(rawScreen.statusOffTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.statusOffTitle, 80),
    statusOffSubtitle: sStr(rawScreen.statusOffSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.statusOffSubtitle),
    masterSectionHeading: sStr(rawScreen.masterSectionHeading, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.masterSectionHeading, 60),
    masterToggleTitle: sStr(rawScreen.masterToggleTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.masterToggleTitle, 80),
    masterToggleSubtitle: sStr(rawScreen.masterToggleSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.masterToggleSubtitle),
    categoriesSectionHeading: sStr(rawScreen.categoriesSectionHeading, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.categoriesSectionHeading, 80),
    deliverySectionHeading: sStr(rawScreen.deliverySectionHeading, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.deliverySectionHeading, 80),
    soundTitle: sStr(rawScreen.soundTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.soundTitle, 80),
    soundSubtitle: sStr(rawScreen.soundSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.soundSubtitle),
    defaultSoundEnabled:
      typeof rawScreen.defaultSoundEnabled === 'boolean'
        ? rawScreen.defaultSoundEnabled
        : DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.defaultSoundEnabled,
    vibrationTitle: sStr(rawScreen.vibrationTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.vibrationTitle, 80),
    vibrationSubtitle: sStr(rawScreen.vibrationSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.vibrationSubtitle),
    defaultVibrationEnabled:
      typeof rawScreen.defaultVibrationEnabled === 'boolean'
        ? rawScreen.defaultVibrationEnabled
        : DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.defaultVibrationEnabled,
    quietHoursTitle: sStr(rawScreen.quietHoursTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.quietHoursTitle, 90),
    quietHoursSubtitle: sStr(rawScreen.quietHoursSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.quietHoursSubtitle),
    defaultQuietHoursEnabled:
      typeof rawScreen.defaultQuietHoursEnabled === 'boolean'
        ? rawScreen.defaultQuietHoursEnabled
        : DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.defaultQuietHoursEnabled,
    quietHoursStart: sStr(rawScreen.quietHoursStart, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.quietHoursStart, 10),
    quietHoursEnd: sStr(rawScreen.quietHoursEnd, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.quietHoursEnd, 10),
    showTestButtons:
      typeof rawScreen.showTestButtons === 'boolean'
        ? rawScreen.showTestButtons
        : DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.showTestButtons,
    instantTestButtonLabel: sStr(rawScreen.instantTestButtonLabel, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.instantTestButtonLabel, 90),
    lockScreenTestButtonLabel: sStr(rawScreen.lockScreenTestButtonLabel, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.lockScreenTestButtonLabel, 110),
    enablePushBannerTitle: sStr(rawScreen.enablePushBannerTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.enablePushBannerTitle, 80),
    enablePushBannerSubtitle: sStr(rawScreen.enablePushBannerSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.enablePushBannerSubtitle),
    emptyAllTitle: sStr(rawScreen.emptyAllTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.emptyAllTitle, 80),
    emptyAllSubtitle: sStr(rawScreen.emptyAllSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.emptyAllSubtitle, 240),
    emptyUnreadTitle: sStr(rawScreen.emptyUnreadTitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.emptyUnreadTitle, 80),
    emptyUnreadSubtitle: sStr(rawScreen.emptyUnreadSubtitle, DEFAULT_APP_NOTIFICATION_SETTINGS_SCREEN.emptyUnreadSubtitle, 240),
  };

  return {
    categories: finalCategories,
    templates: finalTemplates,
    autoLoadOnOpen: typeof input?.autoLoadOnOpen === 'boolean' ? input.autoLoadOnOpen : true,
    autoLoadOnCategoryChange:
      typeof input?.autoLoadOnCategoryChange === 'boolean'
        ? input.autoLoadOnCategoryChange
        : true,
    settingsScreen,
    updatedAt: input?.updatedAt || new Date().toISOString(),
  };
}
