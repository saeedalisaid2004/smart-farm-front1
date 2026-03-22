import AdminLayout from "@/components/admin/AdminLayout";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Camera, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiSaveSettings, getExternalUserId } from "@/services/smartFarmApi";
import { uploadAvatar, getSavedAvatarUrl } from "@/services/avatarService";

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || getSavedAvatarUrl());
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@smartfarm.com";

  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const getStoredPhone = () => {
    try {
      const stored = localStorage.getItem("admin_settings");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.phone && parsed.phone !== "+1234567890") return parsed.phone;
      }
    } catch {}
    return "";
  };
  const [editPhone, setEditPhone] = useState(getStoredPhone());

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
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const userId = getExternalUserId();
    if (!userId || !user) return;

    setSaving(true);
    try {
      await apiSaveSettings(userId, {
        full_name: editName,
        email: editEmail,
        phone: editPhone,
      });
      setUser({ ...user, name: editName, email: editEmail });
      setEditing(false);
      toast({ title: "Profile updated successfully" });
    } catch {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={t("profile.title")}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-32 gradient-primary relative" />
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                <div className="w-28 h-28 rounded-2xl border-4 border-card bg-secondary flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="pb-2">
                <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
                <p className="text-muted-foreground">{t("common.admin")}</p>
              </div>
            </div>

            {editing ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("profile.fullName")}</Label>
                    <Input id="name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("profile.email")}</Label>
                    <Input id="email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("profile.phone")}</Label>
                    <Input id="phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleSave} disabled={saving} className="rounded-xl">
                    <Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">
                    <X className="w-4 h-4 mr-2" />Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <Mail className="w-5 h-5 text-primary" />
                    <div><p className="text-xs text-muted-foreground">{t("profile.email")}</p><p className="text-sm font-medium text-foreground">{userEmail}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <Phone className="w-5 h-5 text-primary" />
                    <div><p className="text-xs text-muted-foreground">{t("profile.phone")}</p><p className="text-sm font-medium text-foreground">{editPhone || "—"}</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div><p className="text-xs text-muted-foreground">{t("profile.location")}</p><p className="text-sm font-medium text-foreground">Smart Farm Valley</p></div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div><p className="text-xs text-muted-foreground">{t("profile.memberSince")}</p><p className="text-sm font-medium text-foreground">2024</p></div>
                  </div>
                </div>
                <Button className="mt-6 rounded-xl" onClick={() => setEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-2" />{t("profile.editProfile")}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
