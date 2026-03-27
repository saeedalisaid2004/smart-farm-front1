import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { getExternalUserId, changePassword } from "@/services/smartFarmApi";
import { Lock, Eye, EyeOff } from "lucide-react";

const ChangePasswordSection = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({ title: t("settings.passwordRequired"), variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t("settings.passwordMismatch"), variant: "destructive" });
      return;
    }
    const userId = getExternalUserId();
    if (!userId) return;

    setSaving(true);
    try {
      await changePassword(userId, currentPassword, newPassword);
      toast({ title: t("settings.passwordChanged"), description: t("settings.passwordChangedDesc") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: err?.message || "Failed to change password", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { label: t("settings.currentPassword"), value: currentPassword, onChange: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
    { label: t("settings.newPassword"), value: newPassword, onChange: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
    { label: t("settings.confirmPassword"), value: confirmPassword, onChange: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.label} className="space-y-1.5">
          <Label className="text-sm font-medium text-muted-foreground">{field.label}</Label>
          <div className="relative">
            <Input
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              type={field.show ? "text" : "password"}
              autoComplete="new-password"
              className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 px-4 pe-12 transition-all"
            />
            <button
              type="button"
              onClick={field.toggle}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {field.show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      ))}
      <Button onClick={handleChangePassword} disabled={saving}
        className="w-full h-12 rounded-xl text-base font-semibold mt-4 shadow-sm hover:shadow-md transition-shadow">
        {saving ? "..." : t("settings.updatePassword")}
      </Button>
    </div>
  );
};

export { ChangePasswordSection, Lock };
export default ChangePasswordSection;
