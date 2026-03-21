import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Settings, User, Palette, Globe, Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language, setLanguage } = useLanguage();
  const [fullName, setFullName] = useState(user?.name || "Farm Owner");
  const [email, setEmail] = useState(user?.email || "owner@smartfarm.com");
  const [phone, setPhone] = useState("+1234567890");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const handleThemeChange = (value: "light" | "dark") => {
    setTheme(value);
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSave = () => {
    toast({ title: t("settings.profileUpdated"), description: t("settings.profileSaved") });
  };

  return (
    <DashboardLayout title={t("settings.title")}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{t("settings.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          {/* Profile Settings */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{t("settings.profile")}</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="text-foreground mb-2 block">{t("settings.fullName")}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl h-12 bg-secondary border-0 px-4"
                />
              </div>
              <div>
                <Label className="text-foreground mb-2 block">{t("settings.email")}</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  className="rounded-xl h-12 bg-secondary border-0 px-4"
                />
              </div>
              <div>
                <Label className="text-foreground mb-2 block">{t("settings.phone")}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="rounded-xl h-12 bg-secondary border-0 px-4"
                />
              </div>
            </div>

            <Button
              onClick={handleSave}
              className="w-full rounded-xl py-6 text-base font-medium mt-8"
            >
              {t("settings.saveProfile")}
            </Button>
          </div>

          {/* Theme Preference */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{t("settings.theme")}</h2>
            </div>
            <div className="space-y-3">
              <label
                className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => handleThemeChange("light")}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${theme === "light" ? "border-primary" : "border-muted-foreground"}`}>
                  {theme === "light" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className="text-foreground">{t("settings.lightMode")}</span>
              </label>
              <label
                className="flex items-center gap-3 p-4 rounded-xl border border-border cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => handleThemeChange("dark")}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${theme === "dark" ? "border-primary" : "border-muted-foreground"}`}>
                  {theme === "dark" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
                <span className="text-foreground">{t("settings.darkMode")}</span>
              </label>
            </div>
          </div>

          {/* Language Selection */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{t("settings.language")}</h2>
            </div>
            <Select value={language} onValueChange={(val) => setLanguage(val as "en" | "ar")}>
              <SelectTrigger className="rounded-full h-11 bg-secondary border-0 px-4">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification Preferences */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{t("settings.notifications")}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <Label className="text-foreground">{t("settings.emailNotifications")}</Label>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <Label className="text-foreground">{t("settings.analysisAlerts")}</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-border">
                <Label className="text-foreground">{t("settings.weeklyReport")}</Label>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
