import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Mail, Phone, Calendar, Edit2, Camera, Save, X, Trash2, Shield, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiSaveSettings, getExternalUserId } from "@/services/smartFarmApi";
import { uploadAvatar, getSavedAvatarUrl, removeAvatar } from "@/services/avatarService";
import { motion } from "framer-motion";
import ChangePasswordSection from "@/components/ChangePasswordSection";

const getSettingsKey = (userId?: string | number) =>
  userId ? `dashboard_settings_${userId}` : "dashboard_settings";

const getStoredPhone = (userId?: string | number) => {
  if (!userId) return "";
  try {
    const stored = localStorage.getItem(getSettingsKey(userId));
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.phone && parsed.phone !== "+1234567890") return parsed.phone;
    }
  } catch {}
  return "";
};

const persistPhone = (phone: string, userId?: string | number) => {
  try {
    const key = getSettingsKey(userId);
    const stored = localStorage.getItem(key);
    const parsed = stored ? JSON.parse(stored) : {};
    localStorage.setItem(key, JSON.stringify({ ...parsed, phone }));
  } catch {
    localStorage.setItem(getSettingsKey(userId), JSON.stringify({ phone }));
  }
};

const InfoCard = ({ icon: Icon, label, value, gradient, index }: {
  icon: React.ElementType; label: string; value: string; gradient: string; index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + index * 0.1, duration: 0.4, ease: "easeOut" as const }}
    className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-5 hover:shadow-md transition-all duration-300"
  >
    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${gradient}`} />
    <div className="flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</p>
      </div>
    </div>
  </motion.div>
);

const Profile = () => {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || getSavedAvatarUrl());
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const userName = user?.name || "John Farmer";
  const userEmail = user?.email || "farmer@smartfarm.com";

  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const currentUserId = getExternalUserId() || user?.id;
  const [editPhone, setEditPhone] = useState(user?.phone || getStoredPhone(currentUserId));

  useEffect(() => { setAvatarUrl(user?.avatar_url || getSavedAvatarUrl()); }, [user?.avatar_url]);
  useEffect(() => {
    setEditPhone(user?.phone || getStoredPhone(currentUserId));
  }, [currentUserId, user?.phone]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const userId = getExternalUserId() || user.id;
      const url = await uploadAvatar(String(userId), file);
      setAvatarUrl(url);
      setUser({ ...user, avatar_url: url });
      window.dispatchEvent(new CustomEvent("avatar-updated", { detail: url }));
      toast({ title: t("profile.photoUpdated") });
    } catch {
      toast({ title: "Failed to upload photo", variant: "destructive" });
    } finally { setUploading(false); }
  };

  const handleRemoveAvatar = () => {
    if (!user) return;
    const userId = getExternalUserId() || user.id;
    removeAvatar(String(userId));
    setAvatarUrl(null);
    setUser({ ...user, avatar_url: undefined });
    window.dispatchEvent(new CustomEvent("avatar-updated", { detail: null }));
    toast({ title: t("profile.photoRemoved") });
  };

  const handleSave = async () => {
    const userId = getExternalUserId();
    if (!userId || !user) return;
    setSaving(true);
    try {
      await apiSaveSettings(userId, { full_name: editName, email: editEmail, phone: editPhone });
      persistPhone(editPhone, currentUserId);
      setUser({ ...user, name: editName, email: editEmail, phone: editPhone, avatar_url: avatarUrl || user.avatar_url });
      setEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout title={t("profile.title")}>
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-sm">
          {/* Hero Header */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-br from-primary via-primary/80 to-primary/60 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_40%)]" />
            <Sparkles className="absolute top-4 right-4 w-5 h-5 text-white/30" />
          </div>

          <div className="px-5 sm:px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col items-center sm:items-start -mt-14 mb-2">
              <div className="relative flex-shrink-0">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-28 h-28 rounded-2xl border-4 border-card bg-secondary flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-primary/20">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-muted-foreground" />
                  )}
                </motion.div>
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
                {avatarUrl && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="absolute -top-1 -right-1 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("profile.removePhotoTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("profile.removePhotoDesc")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemoveAvatar} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{t("profile.remove")}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
            </div>
            <div className="mb-6 text-center sm:text-start">
              <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
              <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground font-medium capitalize">
                  {user?.role === "admin" ? t("common.admin") : t("common.farmer")}
                </span>
              </div>
            </div>

            {editing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { id: "name", label: t("profile.fullName"), value: editName, onChange: setEditName, type: "text" },
                    { id: "email", label: t("profile.email"), value: editEmail, onChange: setEditEmail, type: "email" },
                    { id: "phone", label: t("profile.phone"), value: editPhone, onChange: setEditPhone, type: "tel" },
                  ].map((f) => (
                    <div key={f.id} className="space-y-1.5">
                      <Label htmlFor={f.id} className="text-sm font-medium text-muted-foreground">{f.label}</Label>
                      <Input id={f.id} type={f.type} value={f.value} onChange={(e) => f.onChange(e.target.value)}
                        className="h-12 rounded-xl bg-secondary/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary/20 px-4" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="rounded-xl h-11 px-6 shadow-sm">
                    <Save className="w-4 h-4 mr-2" />{saving ? "..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl h-11 px-6">
                    <X className="w-4 h-4 mr-2" />Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <InfoCard icon={Mail} label={t("profile.email")} value={userEmail} gradient="from-blue-500 to-cyan-500" index={0} />
                  <InfoCard icon={Phone} label={t("profile.phone")} value={editPhone || "—"} gradient="from-emerald-500 to-green-500" index={1} />
                  <InfoCard icon={Calendar} label={t("profile.memberSince")} value={user?.created_at ? new Date(user.created_at).getFullYear().toString() : "—"} gradient="from-violet-500 to-purple-500" index={2} />
                </div>
                <Button className="mt-6 rounded-xl h-11 px-6 shadow-sm hover:shadow-md transition-shadow" onClick={() => setEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />{t("profile.editProfile")}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-5 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{t("settings.changePassword")}</h2>
            </div>
            <ChangePasswordSection />
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
