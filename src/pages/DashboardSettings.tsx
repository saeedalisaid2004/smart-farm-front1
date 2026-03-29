import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Settings, User, Palette, Globe, Bell, Sun, Moon, Check, Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiSaveSettings, getExternalUserId, updateFarmerNotificationSettings } from "@/services/smartFarmApi";
import { setAnalysisAlertsEnabled } from "@/services/notificationService";
import { motion } from "framer-motion";
import ChangePasswordSection from "@/components/ChangePasswordSection";

const getSettingsKey = (userId?: string | number) =>
  userId ? `dashboard_settings_${userId}` : "dashboard_settings";

type NotificationSettings = { email: boolean; analysis_alerts: boolean; weekly_report: boolean };

const defaultNotifications: NotificationSettings = { email: true, analysis_alerts: true, weekly_report: true };

const getStoredSettings = (userId?: string | number) => {
  try {
    const key = getSettingsKey(userId);
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : {};
    return {
      phone: parsed.phone && parsed.phone !== "+1234567890" ? parsed.phone : "",
      notifications: { ...defaultNotifications, ...(parsed.notifications || {}) },
    };
  } catch {
    return { phone: "", notifications: defaultNotifications };
  }
};

const persistSettings = (userId: string | number | undefined, updates: Partial<{ phone: string; notifications: NotificationSettings }>) => {
  const current = getStoredSettings(userId);
  const key = getSettingsKey(userId);
  localStorage.setItem(key, JSON.stringify({
    ...current, ...updates,
    notifications: { ...current.notifications, ...(updates.notifications || {}) },
  }));
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const } }),
};

const SectionCard = ({ icon: Icon, title, children, index, gradient }: {
  icon: React.ElementType; title: string; children: React.ReactNode; index: number; gradient: string;
}) => (
  <motion.div custom={index} initial="hidden" animate="visible" variants={cardVariants}
    className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <div className={`h-1 bg-gradient-to-r ${gradient}`} />
    <div className="p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  </motion.div>
);

const DashboardSettings = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const currentUserId = getExternalUserId() || user?.id;
  const [fullName, setFullName] = useState(user?.name || "Farm Owner");
  const [email, setEmail] = useState(user?.email || "owner@smartfarm.com");
  const [phone, setPhone] = useState(() => getStoredSettings(currentUserId).phone);
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("theme") === "dark" ? "dark" : "light");
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [notifSaving, setNotifSaving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.name || "Farm Owner");
      setEmail(user.email || "owner@smartfarm.com");
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Fetch notification settings from external API on mount
  useEffect(() => {
    const userId = getExternalUserId();
    if (!userId) { setNotifLoading(false); return; }

    let cancelled = false;
    setNotifLoading(true);

    updateFarmerNotificationSettings(userId, {})
      .then((data) => {
        if (cancelled) return;
        const s = data?.current_settings || data;
        if (s) {
          setNotifications({
            email: s.email_notifications_farmer ?? s.email ?? true,
            analysis_alerts: s.analysis_completion_alerts ?? s.analysis_alerts ?? true,
            weekly_report: s.weekly_report_summary ?? s.weekly_report ?? true,
          });
          setAnalysisAlertsEnabled(s.analysis_completion_alerts ?? s.analysis_alerts ?? true);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setNotifLoading(false); });

    return () => { cancelled = true; };
  }, [currentUserId]);

  const apiKeyMap: Record<keyof NotificationSettings, string> = {
    email: "email",
    analysis_alerts: "analysis_alerts",
    weekly_report: "weekly_report",
  };

  const extractNotificationSettings = (source: any): NotificationSettings | null => {
    if (!source || typeof source !== "object") return null;

    const hasSettingsFields = [
      "email_notifications_farmer",
      "email",
      "analysis_completion_alerts",
      "analysis_alerts",
      "weekly_report_summary",
      "weekly_report",
    ].some((field) => field in source);

    if (!hasSettingsFields) return null;

    return {
      email: source.email_notifications_farmer ?? source.email ?? notifications.email,
      analysis_alerts: source.analysis_completion_alerts ?? source.analysis_alerts ?? notifications.analysis_alerts,
      weekly_report: source.weekly_report_summary ?? source.weekly_report ?? notifications.weekly_report,
    };
  };

  const handleNotificationToggle = async (key: keyof NotificationSettings, value: boolean) => {
    const userId = getExternalUserId();
    if (!userId) return;

    const prev = { ...notifications };
    const optimistic = { ...notifications, [key]: value };
    setNotifications(optimistic);
    if (key === "analysis_alerts") setAnalysisAlertsEnabled(value);
    setNotifSaving(true);
    try {
      const data = await updateFarmerNotificationSettings(userId, { [apiKeyMap[key]]: value });
      const serverSettings = extractNotificationSettings(data?.current_settings || data);
      const nextSettings = serverSettings ?? optimistic;
      setNotifications(nextSettings);
      setAnalysisAlertsEnabled(nextSettings.analysis_alerts);
      toast({ title: t("settings.profileUpdated"), description: t("settings.profileSaved") });
    } catch {
      setNotifications(prev);
      if (key === "analysis_alerts") setAnalysisAlertsEnabled(prev.analysis_alerts);
      toast({ title: "Failed to update notifications", variant: "destructive" });
    } finally { setNotifSaving(false); }
  };

  const handleSave = async () => {
    const userId = getExternalUserId();
    setSaving(true);
    try {
      if (userId) await apiSaveSettings(userId, { full_name: fullName, email, phone });
      if (user) setUser({ ...user, name: fullName, email });
      persistSettings(currentUserId, { phone });
      toast({ title: t("settings.profileUpdated"), description: t("settings.profileSaved") });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title={t("settings.title")}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </motion.div>

        <div className="space-y-5">
          <SectionCard icon={User} title={t("settings.profile")} index={0} gradient="from-blue-500 to-cyan-500">
            <div className="space-y-4">
              {[
                { label: t("settings.fullName"), value: fullName, onChange: setFullName, type: "text" },
                { label: t("settings.email"), value: email, onChange: setEmail, type: "email" },
                { label: t("settings.phone"), value: phone, onChange: setPhone, type: "tel" },
              ].map((field) => (
                <div key={field.label} className="space-y-1.5">
                  <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
                  <Input value={field.value} onChange={(e) => field.onChange(e.target.value)} type={field.type}
                    className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 px-4 transition-all" />
                </div>
              ))}
              <Button onClick={handleSave} disabled={saving}
                className="w-full h-12 rounded-xl text-base font-semibold mt-4 shadow-sm hover:shadow-md transition-shadow">
                {saving ? "..." : t("settings.saveProfile")}
              </Button>
            </div>
          </SectionCard>

          <SectionCard icon={Palette} title={t("settings.theme")} index={1} gradient="from-amber-500 to-orange-500">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "light" as const, label: t("settings.lightMode"), icon: Sun, desc: t("settings.lightDesc") },
                { value: "dark" as const, label: t("settings.darkMode"), icon: Moon, desc: t("settings.darkDesc") },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setTheme(opt.value)}
                  className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer
                    ${theme === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-border hover:bg-secondary/30"}`}>
                  {theme === opt.value && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <opt.icon className={`w-7 h-7 ${theme === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`text-sm font-semibold ${theme === opt.value ? "text-primary" : "text-foreground"}`}>{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.desc}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Globe} title={t("settings.language")} index={2} gradient="from-violet-500 to-purple-500">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "en" as const, label: "English", flag: "🇺🇸" },
                { value: "ar" as const, label: "العربية", flag: "🇸🇦" },
              ].map((lang) => (
                <button key={lang.value} onClick={() => setLanguage(lang.value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer
                    ${language === lang.value ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-border hover:bg-secondary/30"}`}>
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-start">
                    <span className={`text-sm font-semibold block ${language === lang.value ? "text-primary" : "text-foreground"}`}>{lang.label}</span>
                  </div>
                  {language === lang.value && (
                    <div className="ms-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Bell} title={t("settings.notifications")} index={3} gradient="from-rose-500 to-pink-500">
            <div className="space-y-3">
              {[
                { key: "email" as const, label: t("settings.emailAlerts"), checked: notifications.email },
                { key: "analysis_alerts" as const, label: t("settings.analysisAlerts"), checked: notifications.analysis_alerts },
                { key: "weekly_report" as const, label: t("settings.weeklyReport") || "Weekly Report Summary", checked: notifications.weekly_report },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors">
                  <Label className="text-foreground font-medium">{item.label}</Label>
                  <Switch disabled={notifSaving || notifLoading} checked={item.checked}
                    onCheckedChange={(checked) => handleNotificationToggle(item.key, checked)} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Lock} title={t("settings.changePassword")} index={4} gradient="from-emerald-500 to-teal-500">
            <ChangePasswordSection />
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
