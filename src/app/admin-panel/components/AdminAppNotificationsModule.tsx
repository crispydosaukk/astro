'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Send,
  Users,
  Smartphone,
  Sparkles,
  RefreshCw,
  Trash2,
  RotateCcw,
  Search,
  Image as ImageIcon,
  Compass,
  Clock,
  Check,
  Megaphone,
  Zap,
  Save,
  Copy,
  Calendar,
  Plus,
  Edit3,
  Star,
  Layers,
  Tag,
  X,
  Wand2,
  BookmarkPlus,
  FolderPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  AppNotificationItem,
  NotificationAudience,
  NotificationCategory,
  NotificationDeliveryMode,
  NotificationPriority,
} from '@/lib/notificationService';
import type { AutomatedScheduleItem } from '@/lib/notificationAutomations';
import {
  CATEGORY_COLOR_LIST,
  CATEGORY_COLOR_PRESETS,
  DEFAULT_NOTIFICATION_CATEGORIES,
  DEFAULT_NOTIFICATION_TEMPLATES,
  SUGGESTED_CATEGORY_EMOJIS,
  slugifyCategoryId,
  slugifyTemplateId,
  type DynamicNotificationCategory,
  type DynamicNotificationTemplate,
  type NotificationCategoryColorKey,
} from '@/lib/notificationTemplatesConfig';

interface AdminCustomerTarget {
  uid: string;
  name: string;
  phone: string;
  email: string;
  hasPushToken: boolean;
  platform: string;
}

interface OverviewStats {
  totalSent: number;
  totalDevices: number;
  iosDevices: number;
  androidDevices: number;
  totalUsers: number;
}

const DEEP_LINK_ROUTES = [
  { label: 'Notifications Inbox (Default)', value: '/notifications-screen' },
  { label: 'Home Dashboard', value: '/home-dashboard-screen' },
  { label: 'Daily Horoscope', value: '/horoscope-screen' },
  { label: 'Panchang & Muhurat', value: '/panchang-screen' },
  { label: 'My Kundli Chart', value: '/my-kundli-screen' },
  { label: 'Match Kundli (36 Guna)', value: '/match-kundli-screen' },
  { label: 'Live Astrologers', value: '/live-astrologers-screen' },
  { label: 'AI Astrologer Chat', value: '/ai-chat-screen' },
  { label: 'Vedic Remedies (Ashta Parihar)', value: '/remedies-screen' },
  { label: 'Auspicious Muhurat', value: '/muhurat-screen' },
  { label: 'Services & Reports', value: '/services-screen' },
  { label: 'Wallet & Recharge Offers', value: '/wallet-screen' },
];

function formatTimeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminAppNotificationsModule() {
  const [moduleTab, setModuleTab] = useState<'broadcast' | 'templates' | 'automations'>('broadcast');

  const [loading, setLoading] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [users, setUsers] = useState<AdminCustomerTarget[]>([]);
  const [stats, setStats] = useState<OverviewStats>({
    totalSent: 0,
    totalDevices: 0,
    iosDevices: 0,
    androidDevices: 0,
    totalUsers: 0,
  });

  // Dynamic Categories & Templates from Firestore
  const [categories, setCategories] = useState<DynamicNotificationCategory[]>(
    DEFAULT_NOTIFICATION_CATEGORIES
  );
  const [templates, setTemplates] = useState<DynamicNotificationTemplate[]>(
    DEFAULT_NOTIFICATION_TEMPLATES
  );
  const [autoLoadOnOpen, setAutoLoadOnOpen] = useState(true);
  const [autoLoadOnCategoryChange, setAutoLoadOnCategoryChange] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const initialAutoLoadedRef = useRef(false);

  // Composer fields
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<NotificationDeliveryMode>('push_and_inapp');
  const [previewPlatform, setPreviewPlatform] = useState<'ios' | 'android'>('ios');
  const [category, setCategory] = useState<NotificationCategory>('horoscope');
  const [audience, setAudience] = useState<NotificationAudience>('all');
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [actionRoute, setActionRoute] = useState('/notifications-screen');
  const [imageUrl, setImageUrl] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('high');

  // Inline Quick Add Category inside Composer
  const [showQuickAddCategory, setShowQuickAddCategory] = useState(false);
  const [quickCatLabel, setQuickCatLabel] = useState('');
  const [quickCatEmoji, setQuickCatEmoji] = useState('🎉');
  const [quickCatColor, setQuickCatColor] = useState<NotificationCategoryColorKey>('orange');
  const [quickCatDesc, setQuickCatDesc] = useState('');

  // Inline Save Current Composer as Template drawer
  const [showSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
  const [saveTplName, setSaveTplName] = useState('');
  const [saveTplAsCatDefault, setSaveTplAsCatDefault] = useState(true);
  const [saveTplAsGlobalDefault, setSaveTplAsGlobalDefault] = useState(false);

  // Manager Tab — Category Editor state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catFormLabel, setCatFormLabel] = useState('');
  const [catFormEmoji, setCatFormEmoji] = useState('✨');
  const [catFormColor, setCatFormColor] = useState<NotificationCategoryColorKey>('amber');
  const [catFormDesc, setCatFormDesc] = useState('');

  // Manager Tab — Template Editor state
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [tplFormName, setTplFormName] = useState('');
  const [tplFormCategory, setTplFormCategory] = useState<string>('horoscope');
  const [tplFormTitle, setTplFormTitle] = useState('');
  const [tplFormSubtitle, setTplFormSubtitle] = useState('');
  const [tplFormBody, setTplFormBody] = useState('');
  const [tplFormCtaText, setTplFormCtaText] = useState('');
  const [tplFormActionRoute, setTplFormActionRoute] = useState('/notifications-screen');
  const [tplFormDeliveryMode, setTplFormDeliveryMode] =
    useState<NotificationDeliveryMode>('push_and_inapp');
  const [tplFormPriority, setTplFormPriority] = useState<NotificationPriority>('high');
  const [tplFormImageUrl, setTplFormImageUrl] = useState('');
  const [tplFormIsDefault, setTplFormIsDefault] = useState(false);
  const [tplFormIsCategoryDefault, setTplFormIsCategoryDefault] = useState(true);

  // Manager Tab filters
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateFilterCategory, setTemplateFilterCategory] = useState('all');

  // History & user search filters
  const [userSearch, setUserSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategory, setHistoryCategory] = useState<string>('all');

  // Automations state
  const [automations, setAutomations] = useState<AutomatedScheduleItem[]>([]);
  const [loadingAutomations, setLoadingAutomations] = useState(false);
  const [savingAutomations, setSavingAutomations] = useState(false);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [runningCron, setRunningCron] = useState(false);
  const [currentTimeIST, setCurrentTimeIST] = useState('');

  const getCategoryMeta = (catId: string): DynamicNotificationCategory => {
    const found = categories.find((c) => c.id === catId);
    if (found) return found;
    return {
      id: catId || 'system',
      label: catId
        ? catId
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, (m) => m.toUpperCase())
        : 'System Alert',
      emoji: '🔔',
      colorKey: 'slate',
      color: CATEGORY_COLOR_PRESETS.slate.hex,
      badgeClass: CATEGORY_COLOR_PRESETS.slate.badgeClass,
    };
  };

  const applyTemplateToComposer = (
    tpl: DynamicNotificationTemplate,
    options?: { silent?: boolean; switchToComposer?: boolean }
  ) => {
    setSelectedTemplateId(tpl.id);
    setTitle(tpl.title);
    setSubtitle(tpl.subtitle || '');
    setBody(tpl.body);
    setCtaText(tpl.ctaText || '');
    setCategory(tpl.category);
    setActionRoute(tpl.actionRoute || '/notifications-screen');
    setDeliveryMode(tpl.deliveryMode || 'push_and_inapp');
    setPriority(tpl.priority || 'high');
    setImageUrl(tpl.imageUrl || '');
    if (options?.switchToComposer) {
      setModuleTab('broadcast');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (!options?.silent) {
      toast.info(`Auto-loaded "${tpl.name}" template`);
    }
  };

  const clearComposer = () => {
    setSelectedTemplateId('');
    setTitle('');
    setSubtitle('');
    setBody('');
    setCtaText('');
    setImageUrl('');
    setActionRoute('/notifications-screen');
    setDeliveryMode('push_and_inapp');
    setPriority('high');
  };

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications?mode=admin');
      const data = await res.json();
      if (data.success) {
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setUsers(Array.isArray(data.users) ? data.users : []);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load notifications dashboard');
      }
    } catch {
      toast.error('Network error loading notifications overview');
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplatesConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications/config');
      const data = await res.json();
      if (data.success) {
        const loadedCats: DynamicNotificationCategory[] =
          Array.isArray(data.categories) && data.categories.length > 0
            ? data.categories
            : DEFAULT_NOTIFICATION_CATEGORIES;
        const loadedTpls: DynamicNotificationTemplate[] = Array.isArray(data.templates)
          ? data.templates
          : DEFAULT_NOTIFICATION_TEMPLATES;
        const openFlag =
          typeof data.autoLoadOnOpen === 'boolean' ? data.autoLoadOnOpen : true;
        const catFlag =
          typeof data.autoLoadOnCategoryChange === 'boolean'
            ? data.autoLoadOnCategoryChange
            : true;

        setCategories(loadedCats);
        setTemplates(loadedTpls);
        setAutoLoadOnOpen(openFlag);
        setAutoLoadOnCategoryChange(catFlag);

        // Auto-load global default template once when opening composer with empty draft
        if (!initialAutoLoadedRef.current && openFlag && loadedTpls.length > 0) {
          initialAutoLoadedRef.current = true;
          const defaultTpl =
            loadedTpls.find((t) => t.isDefault) ||
            loadedTpls.find((t) => t.category === 'horoscope' && t.isCategoryDefault) ||
            loadedTpls[0];
          if (defaultTpl) {
            applyTemplateToComposer(defaultTpl, { silent: true });
          }
        }
      }
    } catch {
      toast.error('Could not load saved notification templates; using defaults');
    } finally {
      setLoadingConfig(false);
    }
  };

  const persistConfig = async (
    next: {
      categories?: DynamicNotificationCategory[];
      templates?: DynamicNotificationTemplate[];
      autoLoadOnOpen?: boolean;
      autoLoadOnCategoryChange?: boolean;
    },
    successMessage?: string
  ): Promise<boolean> => {
    const payload = {
      categories: next.categories ?? categories,
      templates: next.templates ?? templates,
      autoLoadOnOpen: next.autoLoadOnOpen ?? autoLoadOnOpen,
      autoLoadOnCategoryChange: next.autoLoadOnCategoryChange ?? autoLoadOnCategoryChange,
    };

    setSavingConfig(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.templates)) setTemplates(data.templates);
        if (typeof data.autoLoadOnOpen === 'boolean') setAutoLoadOnOpen(data.autoLoadOnOpen);
        if (typeof data.autoLoadOnCategoryChange === 'boolean') {
          setAutoLoadOnCategoryChange(data.autoLoadOnCategoryChange);
        }
        if (successMessage) toast.success(successMessage);
        return true;
      }
      toast.error(data.error || 'Failed to save configuration');
      return false;
    } catch {
      toast.error('Network error saving notification configuration');
      return false;
    } finally {
      setSavingConfig(false);
    }
  };

  const fetchAutomations = async () => {
    setLoadingAutomations(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications/automations');
      const data = await res.json();
      if (data.success) {
        setAutomations(Array.isArray(data.schedules) ? data.schedules : []);
        if (data.currentTimeIST) setCurrentTimeIST(data.currentTimeIST);
      } else {
        toast.error(data.error || 'Failed to load automated schedules');
      }
    } catch {
      toast.error('Network error loading automations');
    } finally {
      setLoadingAutomations(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchTemplatesConfig();
    fetchAutomations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return notifications.filter((n) => {
      if (historyCategory !== 'all' && n.category !== historyCategory) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    });
  }, [notifications, historySearch, historyCategory]);

  const filteredTemplatesList = useMemo(() => {
    const q = templateSearch.trim().toLowerCase();
    return templates.filter((t) => {
      if (templateFilterCategory !== 'all' && t.category !== templateFilterCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [templates, templateSearch, templateFilterCategory]);

  const categoryTemplatesForComposer = useMemo(() => {
    const matching = templates.filter((t) => t.category === category);
    const others = templates.filter((t) => t.category !== category);
    return [...matching, ...others];
  }, [templates, category]);

  const totalPushesDelivered = useMemo(
    () => notifications.reduce((acc, n) => acc + (n.stats?.pushDelivered || 0), 0),
    [notifications]
  );

  const toggleUserSelection = (uid: string) => {
    setSelectedUids((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  // Selecting a category in the composer — auto-loads category default template when enabled
  const handleSelectComposerCategory = (catId: string) => {
    setCategory(catId);
    if (!autoLoadOnCategoryChange) return;

    const catDefault =
      templates.find((t) => t.category === catId && t.isCategoryDefault) ||
      templates.find((t) => t.category === catId);

    if (catDefault) {
      applyTemplateToComposer(catDefault, { silent: true });
      const meta = getCategoryMeta(catId);
      toast.info(`Auto-loaded "${catDefault.name}" for ${meta.emoji} ${meta.label}`);
    } else {
      setSelectedTemplateId('');
    }
  };

  const handleSelectTemplateDropdown = (tplId: string) => {
    if (!tplId) {
      clearComposer();
      return;
    }
    const found = templates.find((t) => t.id === tplId);
    if (found) {
      applyTemplateToComposer(found);
    }
  };

  // Quick Add Category directly inside Composer
  const handleQuickCreateCategory = async () => {
    const label = quickCatLabel.trim();
    if (!label) {
      toast.error('Please enter a category name');
      return;
    }
    const id = slugifyCategoryId(label);
    if (!id) {
      toast.error('Please use letters or numbers for the category name');
      return;
    }
    if (categories.some((c) => c.id === id)) {
      toast.error(`Category "${label}" (${id}) already exists`);
      return;
    }

    const preset = CATEGORY_COLOR_PRESETS[quickCatColor] || CATEGORY_COLOR_PRESETS.amber;
    const newCat: DynamicNotificationCategory = {
      id,
      label,
      emoji: quickCatEmoji.trim() || '🔔',
      colorKey: preset.key,
      color: preset.hex,
      badgeClass: preset.badgeClass,
      description: quickCatDesc.trim(),
      isBuiltIn: false,
    };

    const nextCategories = [...categories, newCat];
    const ok = await persistConfig(
      { categories: nextCategories },
      `Category "${newCat.emoji} ${newCat.label}" created!`
    );
    if (ok) {
      setCategory(newCat.id);
      setQuickCatLabel('');
      setQuickCatDesc('');
      setShowQuickAddCategory(false);
    }
  };

  // Save current composer fields directly as a reusable template
  const handleSaveComposerAsTemplate = async () => {
    const name = saveTplName.trim();
    if (!name) {
      toast.error('Enter a template name first');
      return;
    }
    if (!title.trim() || !body.trim()) {
      toast.error('Enter a notification title and message body before saving as a template');
      return;
    }

    const newId = `${slugifyTemplateId(name)}_${Date.now().toString(36).slice(-4)}`;
    const newTpl: DynamicNotificationTemplate = {
      id: newId,
      name,
      category,
      title: title.trim(),
      subtitle: subtitle.trim(),
      body: body.trim(),
      ctaText: ctaText.trim(),
      actionRoute: actionRoute || '/notifications-screen',
      deliveryMode,
      priority,
      imageUrl: imageUrl.trim(),
      isDefault: saveTplAsGlobalDefault,
      isCategoryDefault: saveTplAsCatDefault,
      isBuiltIn: false,
      updatedAt: new Date().toISOString(),
    };

    const nextTemplates: DynamicNotificationTemplate[] = [
      ...templates.map((t) => ({
        ...t,
        isDefault: saveTplAsGlobalDefault ? false : Boolean(t.isDefault),
        isCategoryDefault:
          saveTplAsCatDefault && t.category === category
            ? false
            : Boolean(t.isCategoryDefault),
      })),
      newTpl,
    ];

    const ok = await persistConfig(
      { templates: nextTemplates },
      `Saved template "${name}"!`
    );
    if (ok) {
      setSelectedTemplateId(newId);
      setSaveTplName('');
      setShowSaveAsTemplate(false);
    }
  };

  // Manager Tab — Add or Update Category
  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCatFormLabel('');
    setCatFormEmoji('✨');
    setCatFormColor('amber');
    setCatFormDesc('');
  };

  const startEditCategory = (cat: DynamicNotificationCategory) => {
    setEditingCategoryId(cat.id);
    setCatFormLabel(cat.label);
    setCatFormEmoji(cat.emoji);
    setCatFormColor(cat.colorKey || 'amber');
    setCatFormDesc(cat.description || '');
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const label = catFormLabel.trim();
    if (!label) {
      toast.error('Category name is required');
      return;
    }

    const preset = CATEGORY_COLOR_PRESETS[catFormColor] || CATEGORY_COLOR_PRESETS.amber;

    if (editingCategoryId) {
      const nextCategories = categories.map((c) =>
        c.id === editingCategoryId
          ? {
              ...c,
              label,
              emoji: catFormEmoji.trim() || '🔔',
              colorKey: preset.key,
              color: preset.hex,
              badgeClass: preset.badgeClass,
              description: catFormDesc.trim(),
            }
          : c
      );
      const ok = await persistConfig(
        { categories: nextCategories },
        `Updated category "${label}"`
      );
      if (ok) resetCategoryForm();
      return;
    }

    const id = slugifyCategoryId(label);
    if (!id) {
      toast.error('Please enter a valid category label');
      return;
    }
    if (categories.some((c) => c.id === id)) {
      toast.error(`A category with slug "${id}" already exists`);
      return;
    }

    const created: DynamicNotificationCategory = {
      id,
      label,
      emoji: catFormEmoji.trim() || '🔔',
      colorKey: preset.key,
      color: preset.hex,
      badgeClass: preset.badgeClass,
      description: catFormDesc.trim(),
      isBuiltIn: false,
    };

    const ok = await persistConfig(
      { categories: [...categories, created] },
      `Added category "${created.emoji} ${created.label}"`
    );
    if (ok) {
      resetCategoryForm();
      setTplFormCategory(created.id);
    }
  };

  const handleDeleteCategory = async (cat: DynamicNotificationCategory) => {
    if (cat.id === 'system') {
      toast.error('System Alert is the protected fallback category and cannot be deleted.');
      return;
    }
    const linkedCount = templates.filter((t) => t.category === cat.id).length;
    const msg =
      linkedCount > 0
        ? `Delete category "${cat.label}"? ${linkedCount} template(s) using it will be reassigned to System Alert.`
        : `Delete category "${cat.label}"?`;
    if (!confirm(msg)) return;

    const nextCategories = categories.filter((c) => c.id !== cat.id);
    const nextTemplates = templates.map((t) =>
      t.category === cat.id ? { ...t, category: 'system', isCategoryDefault: false } : t
    );

    const ok = await persistConfig(
      { categories: nextCategories, templates: nextTemplates },
      `Deleted category "${cat.label}"`
    );
    if (ok) {
      if (category === cat.id) setCategory('system');
      if (editingCategoryId === cat.id) resetCategoryForm();
    }
  };

  // Manager Tab — Add or Update Template
  const resetTemplateForm = () => {
    setEditingTemplateId(null);
    setTplFormName('');
    setTplFormCategory(categories[0]?.id || 'horoscope');
    setTplFormTitle('');
    setTplFormSubtitle('');
    setTplFormBody('');
    setTplFormCtaText('');
    setTplFormActionRoute('/notifications-screen');
    setTplFormDeliveryMode('push_and_inapp');
    setTplFormPriority('high');
    setTplFormImageUrl('');
    setTplFormIsDefault(false);
    setTplFormIsCategoryDefault(true);
  };

  const startEditTemplate = (tpl: DynamicNotificationTemplate) => {
    setEditingTemplateId(tpl.id);
    setTplFormName(tpl.name);
    setTplFormCategory(tpl.category);
    setTplFormTitle(tpl.title);
    setTplFormSubtitle(tpl.subtitle || '');
    setTplFormBody(tpl.body);
    setTplFormCtaText(tpl.ctaText || '');
    setTplFormActionRoute(tpl.actionRoute || '/notifications-screen');
    setTplFormDeliveryMode(tpl.deliveryMode || 'push_and_inapp');
    setTplFormPriority(tpl.priority || 'high');
    setTplFormImageUrl(tpl.imageUrl || '');
    setTplFormIsDefault(Boolean(tpl.isDefault));
    setTplFormIsCategoryDefault(Boolean(tpl.isCategoryDefault));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveTemplateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tplFormName.trim() || !tplFormTitle.trim() || !tplFormBody.trim()) {
      toast.error('Template Name, Title, and Message Body are required');
      return;
    }

    const targetId =
      editingTemplateId ||
      `${slugifyTemplateId(tplFormName)}_${Date.now().toString(36).slice(-4)}`;

    const record: DynamicNotificationTemplate = {
      id: targetId,
      name: tplFormName.trim(),
      category: tplFormCategory || 'system',
      title: tplFormTitle.trim(),
      subtitle: tplFormSubtitle.trim(),
      body: tplFormBody.trim(),
      ctaText: tplFormCtaText.trim(),
      actionRoute: tplFormActionRoute || '/notifications-screen',
      deliveryMode: tplFormDeliveryMode,
      priority: tplFormPriority,
      imageUrl: tplFormImageUrl.trim(),
      isDefault: tplFormIsDefault,
      isCategoryDefault: tplFormIsCategoryDefault,
      isBuiltIn: editingTemplateId
        ? templates.find((t) => t.id === editingTemplateId)?.isBuiltIn || false
        : false,
      updatedAt: new Date().toISOString(),
    };

    const clearedDefaults = templates.map((t) => {
      if (t.id === targetId) return t;
      return {
        ...t,
        isDefault: record.isDefault ? false : t.isDefault,
        isCategoryDefault:
          record.isCategoryDefault && t.category === record.category
            ? false
            : t.isCategoryDefault,
      };
    });

    const nextTemplates = editingTemplateId
      ? clearedDefaults.map((t) => (t.id === targetId ? record : t))
      : [...clearedDefaults, record];

    const ok = await persistConfig(
      { templates: nextTemplates },
      editingTemplateId
        ? `Updated template "${record.name}"`
        : `Created template "${record.name}"`
    );
    if (ok) {
      resetTemplateForm();
    }
  };

  const handleDuplicateTemplate = async (tpl: DynamicNotificationTemplate) => {
    const copyName = `${tpl.name} (Copy)`;
    const copyId = `${slugifyTemplateId(copyName)}_${Date.now().toString(36).slice(-4)}`;
    const clone: DynamicNotificationTemplate = {
      ...tpl,
      id: copyId,
      name: copyName,
      isDefault: false,
      isCategoryDefault: false,
      isBuiltIn: false,
      updatedAt: new Date().toISOString(),
    };
    await persistConfig(
      { templates: [...templates, clone] },
      `Duplicated "${tpl.name}"`
    );
  };

  const handleSetTemplateDefault = async (
    tpl: DynamicNotificationTemplate,
    scope: 'global' | 'category'
  ) => {
    const nextTemplates = templates.map((t) => {
      if (scope === 'global') {
        return { ...t, isDefault: t.id === tpl.id ? !t.isDefault : false };
      }
      if (t.category === tpl.category) {
        return {
          ...t,
          isCategoryDefault: t.id === tpl.id ? !t.isCategoryDefault : false,
        };
      }
      return t;
    });

    const meta = getCategoryMeta(tpl.category);
    await persistConfig(
      { templates: nextTemplates },
      scope === 'global'
        ? tpl.isDefault
          ? `Cleared global default template`
          : `"${tpl.name}" set as Global Default template`
        : tpl.isCategoryDefault
        ? `Cleared default template for ${meta.label}`
        : `"${tpl.name}" set as auto-load default for ${meta.emoji} ${meta.label}`
    );
  };

  const handleDeleteTemplate = async (tpl: DynamicNotificationTemplate) => {
    if (!confirm(`Delete template "${tpl.name}"?`)) return;
    const nextTemplates = templates.filter((t) => t.id !== tpl.id);
    const ok = await persistConfig(
      { templates: nextTemplates },
      `Deleted template "${tpl.name}"`
    );
    if (ok) {
      if (selectedTemplateId === tpl.id) setSelectedTemplateId('');
      if (editingTemplateId === tpl.id) resetTemplateForm();
    }
  };

  const handleToggleAutoLoadSetting = async (
    field: 'autoLoadOnOpen' | 'autoLoadOnCategoryChange'
  ) => {
    const nextVal = field === 'autoLoadOnOpen' ? !autoLoadOnOpen : !autoLoadOnCategoryChange;
    if (field === 'autoLoadOnOpen') setAutoLoadOnOpen(nextVal);
    else setAutoLoadOnCategoryChange(nextVal);

    await persistConfig(
      { [field]: nextVal },
      field === 'autoLoadOnOpen'
        ? `Auto-load on composer open ${nextVal ? 'enabled' : 'disabled'}`
        : `Auto-load on category switch ${nextVal ? 'enabled' : 'disabled'}`
    );
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both a notification title and message.');
      return;
    }
    if (audience === 'specific' && selectedUids.length === 0) {
      toast.error('Please select at least one target customer.');
      return;
    }

    setSending(true);
    try {
      const recipientNames =
        audience === 'specific'
          ? users.filter((u) => selectedUids.includes(u.uid)).map((u) => u.name || u.phone || u.uid)
          : [];

      const res = await fetch('/api/app-dynamic/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          subtitle: subtitle.trim() || undefined,
          body: body.trim(),
          ctaText: ctaText.trim() || undefined,
          deliveryMode,
          category,
          audience,
          recipientUids: audience === 'specific' ? selectedUids : [],
          recipientNames,
          imageUrl: imageUrl.trim() || undefined,
          actionRoute,
          priority,
          sentBy: 'Admin',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.notification?.stats;
        toast.success(
          `Notification sent! Bell inbox targets: ${s?.totalTargets || 0} • Lock-screen push delivered: ${s?.pushDelivered || 0}/${s?.pushAttempted || 0} device(s).`
        );
        setTitle('');
        setSubtitle('');
        setBody('');
        setCtaText('');
        setImageUrl('');
        setSelectedUids([]);
        setSelectedTemplateId('');
        await fetchOverview();
      } else {
        toast.error(data.error || 'Failed to send notification');
      }
    } catch {
      toast.error('Network error dispatching notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification from customer inboxes and history?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/app-dynamic/notifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        toast.success('Notification deleted');
      } else {
        toast.error(data.error || 'Failed to delete');
      }
    } catch {
      toast.error('Network error deleting notification');
    } finally {
      setDeletingId(null);
    }
  };

  const handleReuse = (n: AppNotificationItem) => {
    setSelectedTemplateId('');
    setTitle(n.title);
    setSubtitle(n.subtitle || '');
    setBody(n.body);
    setCtaText(n.ctaText || '');
    setDeliveryMode(n.deliveryMode || 'push_and_inapp');
    setCategory(n.category);
    setAudience(n.audience);
    setSelectedUids(n.recipientUids || []);
    setActionRoute(n.actionRoute || '/notifications-screen');
    setImageUrl(n.imageUrl || '');
    setPriority(n.priority || 'high');
    setModuleTab('broadcast');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Loaded notification into composer for resending');
  };

  // Automations helpers
  const handleToggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleUpdateAutomationField = (
    id: string,
    field: keyof AutomatedScheduleItem,
    val: any
  ) => {
    setAutomations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleSaveAutomations = async () => {
    setSavingAutomations(true);
    try {
      const res = await fetch('/api/app-dynamic/notifications/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules: automations }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAutomations(data.schedules);
        toast.success('Automated daily schedules saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save schedules');
      }
    } catch {
      toast.error('Network error saving automations');
    } finally {
      setSavingAutomations(false);
    }
  };

  const handleTriggerAutomation = async (id: string, name: string) => {
    setTriggeringId(id);
    try {
      const res = await fetch('/api/app-dynamic/notifications/automations/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const s = data.notification?.stats;
        toast.success(
          `⚡ "${name}" broadcasted! Bell inboxes: ${s?.totalTargets || 0} • Lock-screen push: ${s?.pushDelivered || 0}/${s?.pushAttempted || 0} devices.`
        );
        await fetchAutomations();
        await fetchOverview();
      } else {
        toast.error(data.error || `Failed to trigger ${name}`);
      }
    } catch {
      toast.error('Network error executing automation');
    } finally {
      setTriggeringId(null);
    }
  };

  const handleRunCronNow = async () => {
    setRunningCron(true);
    try {
      const res = await fetch('/api/cron/daily-notifications');
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          `Hourly Cron evaluation completed! Ran ${data.report?.ranCount || 0} due automation(s) for IST ${data.report?.istTime}.`
        );
        await fetchAutomations();
        await fetchOverview();
      } else {
        toast.error(data.error || 'Cron check failed');
      }
    } catch {
      toast.error('Network error executing cron check');
    } finally {
      setRunningCron(false);
    }
  };

  const activeCategoryMeta = getCategoryMeta(category);
  const selectedTemplateObj = templates.find((t) => t.id === selectedTemplateId) || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Megaphone size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
              Customer Notifications & Push Engine
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/25">
                Lock-Screen Push + In-App Live
              </span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Broadcast instant push alerts with auto-loading custom templates & dynamic categories, or run automated daily Panchang, Horoscope & Acharya schedules.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => {
              fetchOverview();
              fetchTemplatesConfig();
              fetchAutomations();
            }}
            disabled={loading || loadingAutomations || loadingConfig}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-bold text-foreground transition-all"
          >
            <RefreshCw
              size={14}
              className={loading || loadingAutomations || loadingConfig ? 'animate-spin' : ''}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Sent</span>
            <Bell size={16} className="text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stats.totalSent}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Campaigns & automated alerts</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active App Devices</span>
            <Smartphone size={16} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stats.totalDevices}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            iOS: {stats.iosDevices} • Android: {stats.androidDevices}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Devotees</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{stats.totalUsers}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Registered customer profiles</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Lock-Screen Pushes</span>
            <Sparkles size={16} className="text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-foreground mt-2">{totalPushesDelivered}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Via Expo / Firebase FCM V1</p>
        </div>
      </div>

      {/* Main Mode Navigation Tabs (3 Tabs) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-1.5 bg-muted/60 border border-border rounded-2xl">
        <button
          type="button"
          onClick={() => setModuleTab('broadcast')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            moduleTab === 'broadcast'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Send size={15} className={moduleTab === 'broadcast' ? 'text-amber-600' : ''} />
          Manual Broadcast Composer
        </button>

        <button
          type="button"
          onClick={() => setModuleTab('templates')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            moduleTab === 'templates'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Layers size={15} className={moduleTab === 'templates' ? 'text-amber-600' : ''} />
          Templates & Categories
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700">
            {templates.length} • {categories.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setModuleTab('automations')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            moduleTab === 'automations'
              ? 'bg-card text-foreground shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar size={15} className={moduleTab === 'automations' ? 'text-amber-600' : ''} />
          Automated Daily Engine
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600">
            {automations.filter((a) => a.enabled).length} Active
          </span>
        </button>
      </div>

      {/* TAB 1: MANUAL BROADCAST COMPOSER */}
      {moduleTab === 'broadcast' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left: Composer Form */}
            <form
              onSubmit={handleSend}
              className="xl:col-span-8 bg-card border border-border rounded-2xl p-6 space-y-5 shadow-xs"
            >
              {/* Composer Header + Template Selector */}
              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Send size={16} className="text-amber-600" />
                    Compose Push Notification
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleToggleAutoLoadSetting('autoLoadOnCategoryChange')}
                      disabled={savingConfig}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                        autoLoadOnCategoryChange
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700'
                          : 'bg-muted/60 border-border text-muted-foreground'
                      }`}
                      title="Automatically load a category's default message template when selecting a category"
                    >
                      <Wand2 size={12} />
                      Auto-Load on Category: {autoLoadOnCategoryChange ? 'ON' : 'OFF'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModuleTab('templates')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-muted/60 hover:bg-muted text-[11px] font-semibold text-foreground transition-all"
                    >
                      <Layers size={12} className="text-amber-600" />
                      Manage All
                    </button>
                  </div>
                </div>

                {/* Auto-Load Template Dropdown + Quick Save */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center bg-muted/30 border border-border rounded-xl p-3">
                  <div className="md:col-span-7">
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1">
                      Select Template (Auto-Loads Title, Message, CTA & Route)
                    </label>
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleSelectTemplateDropdown(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="">-- Custom / Blank Message --</option>
                      {templates.map((tpl) => {
                        const catMeta = getCategoryMeta(tpl.category);
                        const tags = [
                          tpl.isDefault ? '★ Global Default' : '',
                          tpl.isCategoryDefault ? '⚡ Cat Default' : '',
                        ]
                          .filter(Boolean)
                          .join(' · ');
                        return (
                          <option key={tpl.id} value={tpl.id}>
                            {catMeta.emoji} {tpl.name} ({catMeta.label})
                            {tags ? ` — ${tags}` : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="md:col-span-5 flex items-center gap-2 md:pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setSaveTplName(selectedTemplateObj ? `${selectedTemplateObj.name} Custom` : '');
                        setShowSaveAsTemplate((prev) => !prev);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-800 transition-all"
                    >
                      <BookmarkPlus size={13} />
                      Save as Template
                    </button>
                    <button
                      type="button"
                      onClick={clearComposer}
                      className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
                      title="Clear composer fields"
                    >
                      <X size={13} />
                      Clear
                    </button>
                  </div>
                </div>

                {/* Inline Save Current Composer as Template Box */}
                {showSaveAsTemplate && (
                  <div className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <BookmarkPlus size={14} className="text-amber-600" />
                        Save Current Composer Content as Reusable Template
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSaveAsTemplate(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                      <input
                        type="text"
                        value={saveTplName}
                        onChange={(e) => setSaveTplName(e.target.value)}
                        placeholder="Template name (e.g. Ekadashi Special Alert)"
                        className="sm:col-span-6 px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                      />
                      <label className="sm:col-span-3 flex items-center gap-1.5 text-[11px] font-semibold text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveTplAsCatDefault}
                          onChange={(e) => setSaveTplAsCatDefault(e.target.checked)}
                          className="rounded border-border text-amber-600"
                        />
                        Category Default
                      </label>
                      <label className="sm:col-span-3 flex items-center gap-1.5 text-[11px] font-semibold text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={saveTplAsGlobalDefault}
                          onChange={(e) => setSaveTplAsGlobalDefault(e.target.checked)}
                          className="rounded border-border text-amber-600"
                        />
                        Global Default
                      </label>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSaveAsTemplate(false)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingConfig}
                        onClick={handleSaveComposerAsTemplate}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50"
                      >
                        <Save size={12} />
                        {savingConfig ? 'Saving...' : 'Save Template'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick-Load Template Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-muted-foreground mr-1">
                    Quick Load:
                  </span>
                  {categoryTemplatesForComposer.slice(0, 8).map((tpl) => {
                    const active = selectedTemplateId === tpl.id;
                    const catMeta = getCategoryMeta(tpl.category);
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => applyTemplateToComposer(tpl)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                          active
                            ? 'bg-amber-500/20 text-amber-800 border-amber-500 shadow-xs'
                            : 'bg-muted/80 hover:bg-amber-500/15 hover:text-amber-700 border-border text-foreground'
                        }`}
                      >
                        <span>{catMeta.emoji}</span>
                        <span>{tpl.name}</span>
                        {tpl.isDefault && <Star size={10} className="text-amber-600 fill-amber-500" />}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      resetTemplateForm();
                      setTplFormCategory(category);
                      setModuleTab('templates');
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-dashed border-amber-500/50 text-amber-700 hover:bg-amber-500/10 transition-all"
                  >
                    <Plus size={11} />
                    New Template
                  </button>
                </div>
              </div>

              {/* Dynamic Category Picker + Quick Add Category */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-foreground">
                    Category{' '}
                    <span className="font-normal text-muted-foreground">
                      ({categories.length} dynamic categories)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowQuickAddCategory((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:text-amber-800"
                  >
                    <FolderPlus size={13} />
                    {showQuickAddCategory ? 'Close Category Creator' : '+ Add New Category'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((c) => {
                    const active = category === c.id;
                    const hasDefaultTpl = templates.some(
                      (t) => t.category === c.id && t.isCategoryDefault
                    );
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectComposerCategory(c.id)}
                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                          active
                            ? 'bg-amber-500/15 border-amber-500 text-foreground shadow-xs'
                            : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/70'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-base shrink-0">{c.emoji}</span>
                          <span className="truncate">{c.label}</span>
                        </div>
                        {hasDefaultTpl && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                            title="Has auto-load default template"
                          />
                        )}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowQuickAddCategory((prev) => !prev)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-amber-500/50 text-xs font-bold text-amber-700 hover:bg-amber-500/10 transition-all"
                  >
                    <Plus size={14} />
                    Add Category
                  </button>
                </div>

                {/* Inline Quick Add Category Panel */}
                {showQuickAddCategory && (
                  <div className="rounded-xl border border-amber-500/35 bg-amber-500/5 p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <FolderPlus size={14} className="text-amber-600" />
                        Quick Add Notification Category
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddCategory(false)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                          Category Label *
                        </label>
                        <input
                          type="text"
                          value={quickCatLabel}
                          onChange={(e) => setQuickCatLabel(e.target.value)}
                          placeholder="e.g. Festivals & Vrat"
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                          Emoji
                        </label>
                        <input
                          type="text"
                          value={quickCatEmoji}
                          onChange={(e) => setQuickCatEmoji(e.target.value)}
                          maxLength={6}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs text-center text-foreground focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                          Short Description (App Settings)
                        </label>
                        <input
                          type="text"
                          value={quickCatDesc}
                          onChange={(e) => setQuickCatDesc(e.target.value)}
                          placeholder="e.g. Ekadashi, Purnima & festival alerts"
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          Color:
                        </span>
                        {CATEGORY_COLOR_LIST.map((preset) => (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => setQuickCatColor(preset.key)}
                            className={`w-5 h-5 rounded-full transition-transform ${
                              quickCatColor === preset.key
                                ? 'ring-2 ring-offset-2 ring-amber-500 scale-110'
                                : 'opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: preset.hex }}
                            title={preset.label}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1 flex-wrap">
                        {SUGGESTED_CATEGORY_EMOJIS.slice(0, 8).map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => setQuickCatEmoji(em)}
                            className={`w-6 h-6 rounded-md text-xs flex items-center justify-center border ${
                              quickCatEmoji === em
                                ? 'border-amber-500 bg-amber-500/15'
                                : 'border-transparent hover:bg-muted'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickAddCategory(false)}
                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-muted-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={savingConfig}
                        onClick={handleQuickCreateCategory}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold disabled:opacity-50"
                      >
                        <Plus size={12} />
                        {savingConfig ? 'Creating...' : 'Create & Select Category'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Notification Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ✨ Your Stars Have Spoken Today!"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Subtitle (Optional)
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. Daily Horoscope Ready"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Notification Message Body <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="e.g. Lucky colour, auspicious timing & today's planetary shift for your Rashi are live now. Tap to read!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              {/* Action Route & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Compass size={13} className="text-amber-600" />
                    Deep Link (Target Screen)
                  </label>
                  <select
                    value={actionRoute}
                    onChange={(e) => setActionRoute(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    {DEEP_LINK_ROUTES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} ({r.value})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Action Button Label (CTA)
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Read Now, Consult Now, Claim Offer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Delivery Mode, Priority & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Delivery Channels
                  </label>
                  <select
                    value={deliveryMode}
                    onChange={(e) => setDeliveryMode(e.target.value as NotificationDeliveryMode)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="push_and_inapp">🔔 Push & In-App Bell</option>
                    <option value="push_only">📲 Lock-Screen Push Only</option>
                    <option value="inapp_only">📬 In-App Bell Only</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">
                    Push Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  >
                    <option value="high">⚡ High (Heads-Up Alert)</option>
                    <option value="normal">🔔 Normal (Standard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
                    <ImageIcon size={13} className="text-amber-600" />
                    Banner Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Audience Selector */}
              <div>
                <label className="block text-xs font-bold text-foreground mb-2">Target Audience</label>
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === 'all'}
                      onChange={() => setAudience('all')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>
                      All Devotees ({stats.totalUsers} registered • {stats.totalDevices} active push
                      devices)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="radio"
                      name="audience"
                      checked={audience === 'specific'}
                      onChange={() => setAudience('specific')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>Specific Customers ({selectedUids.length} selected)</span>
                  </label>
                </div>

                {/* Specific User Search Table */}
                {audience === 'specific' && (
                  <div className="mt-3 border border-border rounded-xl p-3 bg-muted/20 space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name, phone or email..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-border/50">
                      {filteredUsers.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2 text-center">
                          No customers found.
                        </p>
                      ) : (
                        filteredUsers.map((u) => {
                          const selected = selectedUids.includes(u.uid);
                          return (
                            <button
                              key={u.uid}
                              type="button"
                              onClick={() => toggleUserSelection(u.uid)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                                selected ? 'bg-amber-500/15' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${
                                    selected
                                      ? 'bg-amber-600 border-amber-600 text-white'
                                      : 'border-border bg-background'
                                  }`}
                                >
                                  {selected && <Check size={12} />}
                                </div>
                                <span className="font-semibold text-foreground">{u.name}</span>
                                {u.phone && (
                                  <span className="text-muted-foreground font-mono">
                                    ({u.phone})
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                {u.hasPushToken ? (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold">
                                    {u.platform || 'push'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                    inbox only
                                  </span>
                                )}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Footer */}
              <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Delivers to iOS & Android lock-screens via Firebase FCM V1 + Expo Push API
                </span>
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      Sending Broadcast...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Broadcast Now
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Right: Real-Time Interactive Lock-Screen Preview */}
            <div className="xl:col-span-4 space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Smartphone size={14} className="text-amber-600" />
                    Lock-Screen Live Preview
                  </h4>
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setPreviewPlatform('ios')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        previewPlatform === 'ios'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Apple iOS
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPlatform('android')}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        previewPlatform === 'android'
                          ? 'bg-card text-foreground shadow-xs'
                          : 'text-muted-foreground'
                      }`}
                    >
                      Android
                    </button>
                  </div>
                </div>

                {/* Simulated Phone Lock-Screen */}
                <div className="rounded-3xl bg-gradient-to-b from-[#1A1512] via-[#261D17] to-[#17120F] p-4 border border-amber-500/25 shadow-lg space-y-3">
                  <div className="flex items-center justify-between text-[10px] text-amber-100/70 px-1">
                    <span>{previewPlatform === 'ios' ? '9:41' : '10:30 AM'}</span>
                    <span>5G · 100%</span>
                  </div>

                  <div className="text-center py-2">
                    <p className="text-2xl font-extrabold tracking-tight text-amber-50">
                      {previewPlatform === 'ios' ? '9:41' : '10:30'}
                    </p>
                    <p className="text-[10px] text-amber-200/70">AstroParihar Live Push Preview</p>
                  </div>

                  <div className="rounded-2xl bg-white/95 text-[#1F1A17] p-3.5 shadow-md space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/assets/images/notification_logo.png"
                          alt="AstroParihar"
                          className="w-6 h-6 rounded-full object-cover border border-amber-500/40 bg-[#080D1A]"
                        />
                        <span className="text-[11px] font-bold tracking-wide uppercase text-amber-800">
                          AstroParihar
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-500">now</span>
                    </div>
                    <p className="text-xs font-extrabold leading-snug">
                      {title.trim() || '✨ Your Stars Have Spoken Today!'}
                    </p>
                    {subtitle.trim() && (
                      <p className="text-[11px] font-semibold text-amber-700 leading-tight">
                        {subtitle}
                      </p>
                    )}
                    <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-3">
                      {body.trim() ||
                        'Select a template or category above to auto-load your message, or write a custom broadcast alert.'}
                    </p>
                    {imageUrl.trim() && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt="Notification preview"
                        className="w-full h-24 object-cover rounded-xl border border-neutral-200 mt-1"
                      />
                    )}
                    {ctaText.trim() && (
                      <div className="pt-1">
                        <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-600/15 text-amber-800">
                          {ctaText} →
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Metadata chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200">
                      {activeCategoryMeta.emoji} {activeCategoryMeta.label}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-amber-100/80">
                      {deliveryMode === 'push_and_inapp'
                        ? 'Lock-Screen + Bell'
                        : deliveryMode === 'push_only'
                        ? 'Lock-Screen Only'
                        : 'Bell Inbox Only'}
                    </span>
                    {selectedTemplateObj && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200">
                        Template: {selectedTemplateObj.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sent Notifications History */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Clock size={16} className="text-amber-600" />
                  Sent Notifications & Campaign Logs
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View past broadcasts, delivery rates, and reuse or delete notifications.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search history..."
                    className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  />
                </div>
                <select
                  value={historyCategory}
                  onChange={(e) => setHistoryCategory(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell size={28} className="mx-auto text-muted-foreground opacity-50" />
                <p className="text-sm font-semibold text-foreground">No notifications found</p>
                <p className="text-xs text-muted-foreground">
                  Send your first notification above to see it recorded here with delivery stats.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((n) => {
                  const cat = getCategoryMeta(n.category);
                  return (
                    <div
                      key={n.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}
                          >
                            {cat.emoji} {cat.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatTimeAgo(n.createdAt)}
                          </span>
                          {n.sentBy && (
                            <span className="text-[10px] text-muted-foreground">
                              by <strong className="text-foreground">{n.sentBy}</strong>
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                          <span>
                            In-app targets:{' '}
                            <strong className="text-foreground">
                              {n.stats?.totalTargets ?? 0}
                            </strong>
                          </span>
                          <span>
                            Push delivered:{' '}
                            <strong
                              className={
                                n.stats?.pushDelivered ? 'text-emerald-600' : 'text-amber-600'
                              }
                            >
                              {n.stats?.pushDelivered ?? 0}/{n.stats?.pushAttempted ?? 0}
                            </strong>
                          </span>
                          {Boolean(n.stats?.errorDetail) && (
                            <span
                              className="text-red-500 max-w-xs truncate"
                              title={n.stats?.errorDetail}
                            >
                              ⚠️ {n.stats?.errorDetail}
                            </span>
                          )}
                          {n.actionRoute && (
                            <span>
                              Route:{' '}
                              <code className="text-[10px] bg-muted px-1.5 py-0.5 rounded">
                                {n.actionRoute}
                              </code>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReuse(n)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/50 hover:border-amber-500 text-xs font-semibold text-foreground transition-all"
                          title="Load into composer to resend"
                        >
                          <RotateCcw size={13} />
                          Reuse
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === n.id}
                          onClick={() => handleDelete(n.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/25 bg-red-500/10 hover:bg-red-600 hover:text-white text-xs font-semibold text-red-600 transition-all disabled:opacity-50"
                          title="Delete notification"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* TAB 2: TEMPLATES & CATEGORIES MANAGER */}
      {moduleTab === 'templates' && (
        <div className="space-y-6">
          {/* Auto-Load Behavior Settings */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Wand2 size={16} className="text-amber-600" />
                  Default Auto-Load Message Preferences
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Control how default templates automatically populate the broadcast composer when opening or selecting categories.
                </p>
              </div>
              {savingConfig && (
                <span className="text-xs font-semibold text-amber-600 inline-flex items-center gap-1.5">
                  <RefreshCw size={12} className="animate-spin" />
                  Saving to Firestore...
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Auto-Load Global Default Template on Open
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Automatically pre-fill the composer with your ⭐ Global Default template when you open the module.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingConfig}
                  onClick={() => handleToggleAutoLoadSetting('autoLoadOnOpen')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    autoLoadOnOpen ? 'bg-emerald-600' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      autoLoadOnOpen ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-border bg-muted/20">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Auto-Load Default Message on Category Switch
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Whenever you click a category in the composer, automatically load its ⚡ Category Default template.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={savingConfig}
                  onClick={() => handleToggleAutoLoadSetting('autoLoadOnCategoryChange')}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                    autoLoadOnCategoryChange ? 'bg-emerald-600' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                      autoLoadOnCategoryChange ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* LEFT COLUMN: CATEGORIES MANAGER */}
            <div className="xl:col-span-5 space-y-5">
              <form
                onSubmit={handleSaveCategoryForm}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Tag size={15} className="text-amber-600" />
                    {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  {editingCategoryId && (
                    <button
                      type="button"
                      onClick={resetCategoryForm}
                      className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-9">
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={catFormLabel}
                      onChange={(e) => setCatFormLabel(e.target.value)}
                      placeholder="e.g. Festivals & Vrat, Rudraksha Offers"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                    {!editingCategoryId && catFormLabel.trim() && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Category ID:{' '}
                        <code className="bg-muted px-1 rounded font-mono">
                          {slugifyCategoryId(catFormLabel)}
                        </code>
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-bold text-foreground mb-1">Emoji</label>
                    <input
                      type="text"
                      value={catFormEmoji}
                      onChange={(e) => setCatFormEmoji(e.target.value)}
                      maxLength={6}
                      className="w-full px-2 py-2 rounded-xl border border-border bg-background text-sm text-center text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Suggested Emojis */}
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Quick Emoji Picker
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_CATEGORY_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCatFormEmoji(em)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all ${
                          catFormEmoji === em
                            ? 'border-amber-500 bg-amber-500/15 scale-105'
                            : 'border-border bg-muted/30 hover:bg-muted'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <span className="block text-[11px] font-semibold text-muted-foreground mb-1.5">
                    Badge & App Theme Color
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORY_COLOR_LIST.map((preset) => (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => setCatFormColor(preset.key)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                          catFormColor === preset.key
                            ? 'border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500/40'
                            : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: preset.hex }}
                        />
                        {preset.label.split(' ')[1] || preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Description (Shown in App Notification Settings)
                  </label>
                  <input
                    type="text"
                    value={catFormDesc}
                    onChange={(e) => setCatFormDesc(e.target.value)}
                    placeholder="e.g. Ekadashi, Purnima & auspicious festival alerts"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingConfig}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                >
                  {editingCategoryId ? <Save size={14} /> : <Plus size={14} />}
                  {savingConfig
                    ? 'Saving...'
                    : editingCategoryId
                    ? 'Update Category'
                    : 'Add Category'}
                </button>
              </form>

              {/* Existing Categories List */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h4 className="text-xs font-bold text-foreground">
                    Saved Notification Categories ({categories.length})
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Synced live to app</span>
                </div>

                <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const tplCount = templates.filter((t) => t.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 border"
                            style={{
                              backgroundColor: `${cat.color}20`,
                              borderColor: `${cat.color}50`,
                            }}
                          >
                            {cat.emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-foreground truncate">
                                {cat.label}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${cat.badgeClass}`}
                              >
                                {tplCount} {tplCount === 1 ? 'template' : 'templates'}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                              {cat.description || `ID: ${cat.id}`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditCategory(cat)}
                            className="p-1.5 rounded-lg border border-border bg-background hover:border-amber-500 text-muted-foreground hover:text-foreground transition-all"
                            title="Edit category"
                          >
                            <Edit3 size={13} />
                          </button>
                          {cat.id !== 'system' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat)}
                              className="p-1.5 rounded-lg border border-red-500/25 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600 transition-all"
                              title="Delete category"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: TEMPLATES EDITOR + SAVED TEMPLATES LIBRARY */}
            <div className="xl:col-span-7 space-y-5">
              {/* Create / Edit Template Form */}
              <form
                onSubmit={handleSaveTemplateForm}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Layers size={15} className="text-amber-600" />
                    {editingTemplateId ? 'Edit Notification Template' : 'Create New Template'}
                  </h3>
                  {editingTemplateId && (
                    <button
                      type="button"
                      onClick={resetTemplateForm}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Template Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={tplFormName}
                      onChange={(e) => setTplFormName(e.target.value)}
                      placeholder="e.g. Ekadashi Vrat Reminder"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tplFormCategory}
                      onChange={(e) => setTplFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Default Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={tplFormTitle}
                      onChange={(e) => setTplFormTitle(e.target.value)}
                      placeholder="e.g. 🪔 Happy Ekadashi! Auspicious Puja Muhurat"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Default Subtitle (Optional)
                    </label>
                    <input
                      type="text"
                      value={tplFormSubtitle}
                      onChange={(e) => setTplFormSubtitle(e.target.value)}
                      placeholder="e.g. Sacred Vrat & Timing Guide"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Default Message Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={tplFormBody}
                    onChange={(e) => setTplFormBody(e.target.value)}
                    placeholder="Write the message that auto-loads whenever this template or category is selected..."
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Deep Link Screen
                    </label>
                    <select
                      value={tplFormActionRoute}
                      onChange={(e) => setTplFormActionRoute(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      {DEEP_LINK_ROUTES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={tplFormCtaText}
                      onChange={(e) => setTplFormCtaText(e.target.value)}
                      placeholder="e.g. View Muhurat, Claim Offer"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Delivery Channel
                    </label>
                    <select
                      value={tplFormDeliveryMode}
                      onChange={(e) =>
                        setTplFormDeliveryMode(e.target.value as NotificationDeliveryMode)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                    >
                      <option value="push_and_inapp">Push + In-App</option>
                      <option value="push_only">Push Only</option>
                      <option value="inapp_only">In-App Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Priority
                    </label>
                    <select
                      value={tplFormPriority}
                      onChange={(e) => setTplFormPriority(e.target.value as NotificationPriority)}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                    >
                      <option value="high">High Priority</option>
                      <option value="normal">Normal Priority</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Banner Image URL
                    </label>
                    <input
                      type="url"
                      value={tplFormImageUrl}
                      onChange={(e) => setTplFormImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                    />
                  </div>
                </div>

                {/* Default Flags */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tplFormIsCategoryDefault}
                      onChange={(e) => setTplFormIsCategoryDefault(e.target.checked)}
                      className="rounded border-border text-amber-600"
                    />
                    <span>⚡ Auto-load as Default for this Category</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tplFormIsDefault}
                      onChange={(e) => setTplFormIsDefault(e.target.checked)}
                      className="rounded border-border text-amber-600"
                    />
                    <span>⭐ Set as Global Default Template (auto-load on open)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  {editingTemplateId && (
                    <button
                      type="button"
                      onClick={resetTemplateForm}
                      className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingConfig}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                  >
                    {editingTemplateId ? <Save size={14} /> : <Plus size={14} />}
                    {savingConfig
                      ? 'Saving...'
                      : editingTemplateId
                      ? 'Update Template'
                      : 'Add Template'}
                  </button>
                </div>
              </form>

              {/* Saved Templates Library */}
              <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
                  <h4 className="text-xs font-bold text-foreground">
                    Saved Notification Templates ({filteredTemplatesList.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search
                        size={13}
                        className="absolute left-2.5 top-2 text-muted-foreground"
                      />
                      <input
                        type="text"
                        value={templateSearch}
                        onChange={(e) => setTemplateSearch(e.target.value)}
                        placeholder="Search templates..."
                        className="pl-7 pr-2.5 py-1 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none w-36 sm:w-44"
                      />
                    </div>
                    <select
                      value={templateFilterCategory}
                      onChange={(e) => setTemplateFilterCategory(e.target.value)}
                      className="px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-semibold text-foreground focus:outline-none"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.emoji} {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredTemplatesList.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    No templates match your filter. Create a new template above!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTemplatesList.map((tpl) => {
                      const cat = getCategoryMeta(tpl.category);
                      return (
                        <div
                          key={tpl.id}
                          className={`p-4 rounded-xl border transition-colors space-y-2 ${
                            tpl.isDefault
                              ? 'border-amber-500/45 bg-amber-500/5'
                              : 'border-border bg-muted/20 hover:bg-muted/40'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-extrabold text-foreground">
                                  {tpl.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}
                                >
                                  {cat.emoji} {cat.label}
                                </span>
                                {tpl.isDefault && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 border border-amber-500/35 inline-flex items-center gap-1">
                                    <Star size={10} className="fill-amber-500 text-amber-600" />
                                    Global Default
                                  </span>
                                )}
                                {tpl.isCategoryDefault && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                                    ⚡ Cat Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-foreground">{tpl.title}</p>
                              {tpl.subtitle && (
                                <p className="text-[11px] font-semibold text-amber-700">
                                  {tpl.subtitle}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {tpl.body}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                              {tpl.ctaText && (
                                <span className="px-2 py-0.5 rounded bg-muted font-semibold text-foreground">
                                  CTA: {tpl.ctaText}
                                </span>
                              )}
                              <code className="px-1.5 py-0.5 rounded bg-muted">
                                {tpl.actionRoute}
                              </code>
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <button
                                type="button"
                                onClick={() =>
                                  applyTemplateToComposer(tpl, { switchToComposer: true })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold transition-all"
                              >
                                <Send size={11} />
                                Load
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetTemplateDefault(tpl, 'category')}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                                  tpl.isCategoryDefault
                                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-700'
                                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                }`}
                                title="Toggle auto-load default for this category"
                              >
                                <Zap size={11} />
                                Cat Default
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetTemplateDefault(tpl, 'global')}
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all ${
                                  tpl.isDefault
                                    ? 'border-amber-500/40 bg-amber-500/15 text-amber-800'
                                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                }`}
                                title="Toggle global default auto-loaded when opening composer"
                              >
                                <Star size={11} />
                                Global
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditTemplate(tpl)}
                                className="p-1.5 rounded-lg border border-border bg-background hover:border-amber-500 text-muted-foreground hover:text-foreground"
                                title="Edit template"
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateTemplate(tpl)}
                                className="p-1.5 rounded-lg border border-border bg-background hover:border-amber-500 text-muted-foreground hover:text-foreground"
                                title="Duplicate template"
                              >
                                <Copy size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTemplate(tpl)}
                                className="p-1.5 rounded-lg border border-red-500/25 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-600"
                                title="Delete template"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASTROTALK AUTOMATED DAILY ENGINE */}
      {moduleTab === 'automations' && (
        <div className="space-y-6">
          {/* Engine Header Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-600" />
                    Astrotalk-Style Automated Daily Engagement Engine
                  </h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/25">
                    Cron Ready
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Automate high-converting daily push notifications like Astrotalk: Morning Panchang, Midday Astrologer Recommendations, Kundli Transits, and Evening Sandhya Aarti.
                </p>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                {currentTimeIST && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-muted/40 text-xs font-semibold text-foreground">
                    <Clock size={13} className="text-amber-600" />
                    <span>
                      IST Time: <strong className="text-amber-700">{currentTimeIST}</strong>
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRunCronNow}
                  disabled={runningCron}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-bold text-foreground transition-all"
                  title="Check and trigger any automations that are due right now"
                >
                  <RefreshCw size={13} className={runningCron ? 'animate-spin' : ''} />
                  {runningCron ? 'Evaluating...' : 'Run Cron Check Now'}
                </button>
                <button
                  type="button"
                  onClick={handleSaveAutomations}
                  disabled={savingAutomations}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  {savingAutomations ? 'Saving Schedules...' : 'Save All Schedules'}
                </button>
              </div>
            </div>

            {/* Cron Webhook Quick Info Banner */}
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-600" />
                  Automated Daily Cron Trigger URL
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Vercel Cron is configured in{' '}
                  <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[10px]">
                    vercel.json
                  </code>{' '}
                  to ping this endpoint hourly. You can also hook this up to EasyCron or cron-job.org.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/api/cron/daily-notifications`;
                  navigator.clipboard.writeText(url);
                  toast.success('Copied Cron URL to clipboard!');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-card hover:bg-muted text-xs font-bold text-amber-800 transition-all shrink-0"
              >
                <Copy size={13} />
                Copy Webhook URL
              </button>
            </div>
          </div>

          {/* List of Automated Daily Schedules */}
          <div className="space-y-4">
            {automations.map((sch) => {
              const cat = getCategoryMeta(sch.category);
              const isTriggering = triggeringId === sch.id;

              return (
                <div
                  key={sch.id}
                  className={`bg-card border rounded-2xl p-5 shadow-xs transition-all space-y-4 ${
                    sch.enabled
                      ? 'border-amber-500/30 ring-1 ring-amber-500/10'
                      : 'border-border opacity-85'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg shrink-0">
                        {cat.emoji}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground">{sch.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cat.badgeClass}`}
                          >
                            {cat.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{sch.description}</p>
                      </div>
                    </div>

                    {/* Enable Switch & Time */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Time (IST):
                        </span>
                        <input
                          type="time"
                          value={sch.time}
                          onChange={(e) =>
                            handleUpdateAutomationField(sch.id, 'time', e.target.value)
                          }
                          className="px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-mono font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleAutomation(sch.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          sch.enabled ? 'bg-emerald-600' : 'bg-muted'
                        }`}
                        title={sch.enabled ? 'Enabled' : 'Disabled'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            sch.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Card Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Category
                      </label>
                      <select
                        value={sch.category}
                        onChange={(e) =>
                          handleUpdateAutomationField(sch.id, 'category', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.emoji} {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Auto-Fill From Saved Template
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          const tpl = templates.find((t) => t.id === e.target.value);
                          if (!tpl) return;
                          handleUpdateAutomationField(sch.id, 'category', tpl.category);
                          handleUpdateAutomationField(sch.id, 'title', tpl.title);
                          handleUpdateAutomationField(sch.id, 'subtitle', tpl.subtitle || '');
                          handleUpdateAutomationField(sch.id, 'body', tpl.body);
                          handleUpdateAutomationField(sch.id, 'ctaText', tpl.ctaText || '');
                          handleUpdateAutomationField(sch.id, 'actionRoute', tpl.actionRoute);
                          handleUpdateAutomationField(sch.id, 'deliveryMode', tpl.deliveryMode);
                          toast.info(`Applied "${tpl.name}" to ${sch.name}`);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="">-- Pick a template to auto-load copy --</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {getCategoryMeta(tpl.category).emoji} {tpl.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Notification Title
                      </label>
                      <input
                        type="text"
                        value={sch.title}
                        onChange={(e) =>
                          handleUpdateAutomationField(sch.id, 'title', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Subtitle (Optional)
                      </label>
                      <input
                        type="text"
                        value={sch.subtitle || ''}
                        onChange={(e) =>
                          handleUpdateAutomationField(sch.id, 'subtitle', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Message Body
                      </label>
                      <textarea
                        rows={2}
                        value={sch.body}
                        onChange={(e) =>
                          handleUpdateAutomationField(sch.id, 'body', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Deep Link Destination
                      </label>
                      <select
                        value={sch.actionRoute}
                        onChange={(e) =>
                          handleUpdateAutomationField(sch.id, 'actionRoute', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {DEEP_LINK_ROUTES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label} ({r.value})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-foreground mb-1">
                        Delivery Mode
                      </label>
                      <select
                        value={sch.deliveryMode}
                        onChange={(e) =>
                          handleUpdateAutomationField(sch.id, 'deliveryMode', e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="push_and_inapp">🔔 Lock-Screen Push + In-App Bell</option>
                        <option value="push_only">📲 Lock-Screen Push Only</option>
                        <option value="inapp_only">📬 In-App Bell Inbox Only</option>
                      </select>
                    </div>
                  </div>

                  {/* Card Footer: Status & Manual Test Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/60 pt-3">
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                      <span>
                        Status:{' '}
                        <strong
                          className={
                            sch.enabled ? 'text-emerald-600 font-bold' : 'text-neutral-500'
                          }
                        >
                          {sch.enabled
                            ? `Active • Fires daily at ${sch.time} IST`
                            : 'Paused / Inactive'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Last triggered:{' '}
                        <strong className="text-foreground">
                          {sch.lastTriggeredAt ? formatTimeAgo(sch.lastTriggeredAt) : 'Never'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span>
                        Lifetime sent:{' '}
                        <strong className="text-foreground">{sch.totalSentCount || 0} times</strong>
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isTriggering}
                      onClick={() => handleTriggerAutomation(sch.id, sch.name)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-600 hover:text-white text-xs font-bold text-amber-800 transition-all disabled:opacity-50 self-start sm:self-auto"
                      title="Trigger this automated notification immediately to test delivery on your phone"
                    >
                      <Zap size={13} className={isTriggering ? 'animate-spin' : ''} />
                      {isTriggering ? 'Broadcasting...' : '⚡ Test Send Now'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
