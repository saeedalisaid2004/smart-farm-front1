import AdminLayout from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Palette, Globe, Bell, Sun, Moon, Check, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiSaveSettings, getExternalUserId, updateAdminNotificationSettings } from "@/services/smartFarmApi";
import { motion } from "framer-motion";
import ChangePasswordSection from "@/components/ChangePasswordSection";

type NotificationSettings = { pushNotifications: boolean; emailAlerts: boolean };

const defaultNotifications: NotificationSettings = { pushNotifications: true, emailAlerts: true };

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

const AdminSettings = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const currentUserId = getExternalUserId() || user?.id;
  const [fullName, setFullName] = useState(user?.name || "Farm Owner");
  const [email, setEmail] = useState(user?.email || "owner@smartfarm.com");
  const [phone, setPhone] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">(() => localStorage.getItem("theme") === "dark" ? "dark" : "light");
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications);
  const [saving, setSaving] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifLoading, setNotifLoading] = useState(true);

  useEffect(() => { if (user) { setFullName(user.name || "Farm Owner"); setEmail(user.email || "owner@smartfarm.com"); } }, [user]);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); localStorage.setItem("theme", theme); }, [theme]);

  // Fetch notification settings from external API on mount
  useEffect(() => {
    const userId = getExternalUserId();
    if (!userId) { setNotifLoading(false); return; }

    let cancelled = false;
    setNotifLoading(true);

    updateAdminNotificationSettings(userId, {})
      .then((data) => {
        if (cancelled) return;
        if (data?.current_settings) {
          setNotifications({
            pushNotifications: data.current_settings.push ?? true,
            emailAlerts: data.current_settings.email ?? true,
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setNotifLoading(false); });

    return () => { cancelled = true; };
  }, [currentUserId]);

  const handleNotifToggle = async (key: "pushNotifications" | "emailAlerts", checked: boolean) => {
    const userId = getExternalUserId();
    if (!userId) return;
    const prev = { ...notifications };
    setNotifications({ ...notifications, [key]: checked });
    setNotifSaving(true);
    try {
      const apiKey = key === "pushNotifications" ? "push" : "email";
      const data = await updateAdminNotificationSettings(userId, { [apiKey]: checked });
      if (data?.current_settings) {
        const next = {
          pushNotifications: data.current_settings.push ?? checked,
          emailAlerts: data.current_settings.email ?? notifications.emailAlerts,
        };
        setNotifications(next);
      } else {
        // No current_settings returned, keep optimistic state
      }
      }
      toast({ title: t("settings.settingsSaved") });
    } catch {
      setNotifications(prev);
      toast({ title: "Failed to update notifications", variant: "destructive" });
    } finally { setNotifSaving(false); }
  };

  const handleSave = async () => {
    const userId = getExternalUserId();
    setSaving(true);
    try {
      if (userId) await apiSaveSettings(userId, { full_name: fullName, email, phone });
      if (user) setUser({ ...user, name: fullName, email });
      
      toast({ title: t("settings.settingsSaved"), description: t("settings.profileUpdatedDesc") });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout title={t("settings.title")}>
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
          {/* Profile */}
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

          {/* Theme */}
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

          {/* Language */}
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
                  <span className={`text-sm font-semibold ${language === lang.value ? "text-primary" : "text-foreground"}`}>{lang.label}</span>
                  {language === lang.value && (
                    <div className="ms-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard icon={Bell} title={t("settings.notifications")} index={3} gradient="from-rose-500 to-pink-500">
            <div className="space-y-3">
              {[
                { key: "pushNotifications" as const, label: t("settings.pushNotifications"), desc: t("settings.pushDesc"), checked: notifications.pushNotifications },
                { key: "emailAlerts" as const, label: t("settings.emailAlerts"), desc: t("settings.emailDesc"), checked: notifications.emailAlerts },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/30 hover:bg-secondary/50 transition-colors">
                  <div>
                    <Label className="text-foreground font-medium">{item.label}</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <Switch disabled={notifSaving || notifLoading} checked={item.checked}
                    onCheckedChange={(checked) => handleNotifToggle(item.key, checked)} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Lock} title={t("settings.changePassword")} index={4} gradient="from-emerald-500 to-teal-500">
            <ChangePasswordSection />
          </SectionCard>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
