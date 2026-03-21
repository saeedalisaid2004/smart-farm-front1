import AdminLayout from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Palette, Globe, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiSaveSettings, getExternalUserId } from "@/services/smartFarmApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SETTINGS_STORAGE_KEY = "admin_settings";

type NotificationSettings = {
  pushNotifications: boolean;
  emailAlerts: boolean;
};

const defaultNotifications: NotificationSettings = {
  pushNotifications: true,
  emailAlerts: true,
};

const getStoredSettings = () => {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};

    return {
      phone: parsed.phone && parsed.phone !== "+1234567890" ? parsed.phone : "",
      notifications: {
        ...defaultNotifications,
        ...(parsed.notifications || {}),
      },
    };
  } catch {
    return {
      phone: "",
      notifications: defaultNotifications,
    };
  }
};

const persistSettings = (updates: Partial<{ phone: string; notifications: NotificationSettings }>) => {
  const current = getStoredSettings();

  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify({
      ...current,
      ...updates,
      notifications: {
        ...current.notifications,
        ...(updates.notifications || {}),
      },
    }),
  );
};

const AdminSettings = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState(user?.name || "Farm Owner");
  const [email, setEmail] = useState(user?.email || "owner@smartfarm.com");
  const [phone, setPhone] = useState(() => getStoredSettings().phone);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("theme") === "dark" ? "dark" : "light",
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(() => getStoredSettings().notifications);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    setFullName(user.name || "Farm Owner");
    setEmail(user.email || "owner@smartfarm.com");
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    persistSettings({ notifications });
  }, [notifications]);

  const handleSave = async () => {
    const userId = getExternalUserId();

    setSaving(true);
    try {
      if (userId) {
        await apiSaveSettings(userId, {
          full_name: fullName,
          email,
          phone,
        });
      }

      if (user) {
        setUser({ ...user, name: fullName, email });
      }

      persistSettings({ phone });
      toast({ title: t("settings.settingsSaved"), description: t("settings.profileUpdatedDesc") });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={t("settings.title")}>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
            <p className="text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">{t("settings.profile")}</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">{t("settings.fullName")}</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">{t("settings.email")}</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">{t("settings.phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11 rounded-lg" />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full h-11 rounded-lg text-sm font-medium">
              {t("settings.saveProfile")}
            </Button>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Palette className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">{t("settings.theme")}</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <input type="radio" name="theme" value="light" checked={theme === "light"} onChange={() => setTheme("light")} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-foreground">{t("settings.lightMode")}</span>
            </label>
            <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <input type="radio" name="theme" value="dark" checked={theme === "dark"} onChange={() => setTheme("dark")} className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-foreground">{t("settings.darkMode")}</span>
            </label>
          </div>
        </div>

        {/* Language Selection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">{t("settings.language")}</h3>
          </div>
          <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "ar")}>
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notification Preferences */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">{t("settings.notifications")}</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <span className="text-sm font-medium text-foreground">{t("settings.pushNotifications")}</span>
              <Checkbox
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, pushNotifications: checked === true }))
                }
                className="h-5 w-5"
              />
            </label>
            <label className="flex items-center justify-between border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <span className="text-sm font-medium text-foreground">{t("settings.emailAlerts")}</span>
              <Checkbox
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, emailAlerts: checked === true }))
                }
                className="h-5 w-5"
              />
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
