import AdminLayout from "@/components/admin/AdminLayout";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminProfile = () => {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [uploading, setUploading] = useState(false);

  const userName = user?.name || "Admin User";
  const userEmail = user?.email || "admin@smartfarm.com";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    if (user) {
      setUser({ ...user, avatar_url: url });
    }
    window.dispatchEvent(new CustomEvent("avatar-updated", { detail: url }));
    toast({ title: t("profile.photoUpdated") });
    setUploading(false);
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
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <Mail className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">{t("profile.email")}</p><p className="text-sm font-medium text-foreground">{userEmail}</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <Phone className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">{t("profile.phone")}</p><p className="text-sm font-medium text-foreground">+1234567890</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <MapPin className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">{t("profile.location")}</p><p className="text-sm font-medium text-foreground">Smart Farm Valley</p></div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl">
                <Calendar className="w-5 h-5 text-primary" />
                <div><p className="text-xs text-muted-foreground">{t("profile.location")}</p><p className="text-sm font-medium text-foreground">2024</p></div>
              </div>
            </div>
            <Button className="mt-6 rounded-xl"><Edit2 className="w-4 h-4 mr-2" />{t("profile.editProfile")}</Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
