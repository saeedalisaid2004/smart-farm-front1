import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { User, Mail, Phone, MapPin, Calendar, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const userName = user?.user_metadata?.full_name || "John Farmer";
  const userEmail = user?.email || "farmer@smartfarm.com";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "January 1, 2024";

  return (
    <DashboardLayout title={t("profile.title")}>
      <div className="max-w-3xl mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-primary/60" />
          <div className="px-8 pb-6 -mt-12">
            <div className="flex items-end justify-between">
              <div className="flex items-end gap-4">
                <div className="w-24 h-24 rounded-full bg-card border-4 border-card flex items-center justify-center shadow-lg">
                  <span className="text-primary text-3xl font-bold">{userName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="mb-1">
                  <h1 className="text-2xl font-bold text-foreground">{userName}</h1>
                  <p className="text-sm text-muted-foreground">{t("common.farmer")}</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-full gap-2" onClick={() => window.location.href = "/dashboard/settings"}>
                <Edit2 className="w-4 h-4" />
                {t("profile.editProfile")}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{t("profile.personalInfo")}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.fullName")}</p>
                  <p className="text-sm font-medium text-foreground">{userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.email")}</p>
                  <p className="text-sm font-medium text-foreground">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.phone")}</p>
                  <p className="text-sm font-medium text-foreground">+1234567890</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-medium text-foreground">{t("profile.accountDetails")}</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.memberSince")}</p>
                  <p className="text-sm font-medium text-foreground">{createdAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.location")}</p>
                  <p className="text-sm font-medium text-foreground">{t("profile.locationValue")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                <User className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">{t("profile.role")}</p>
                  <p className="text-sm font-medium text-foreground">{t("common.farmer")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
