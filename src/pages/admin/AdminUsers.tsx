import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, UserCheck, UserX, Shield, Search, MoreVertical, Mail, Eye, UserMinus, Trash2, UserPlus, Loader2, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getUserManagementData, searchUsers as apiSearchUsers,
  deleteUser as apiDeleteUser, deactivateUser as apiDeactivateUser,
  activateUser as apiActivateUser, promoteToAdmin as apiPromoteToAdmin,
} from "@/services/smartFarmApi";

const AdminUsers = () => {
  const { t } = useLanguage();
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewUser, setViewUser] = useState<any>(null);

  const loadData = () => {
    setLoadingData(true);
    getUserManagementData()
      .then((data) => {
        if (data.users) setUsers(data.users);
        else if (Array.isArray(data)) setUsers(data);
        if (data.summary) setStats(data.summary);
        else if (data.stats) setStats(data.stats);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { loadData(); return; }
    try {
      const data = await apiSearchUsers(q);
      if (Array.isArray(data)) setUsers(data);
      else if (data.users) setUsers(data.users);
    } catch {}
  };

  const statsCards = [
    { icon: Users, label: t("adminUsers.totalUsers"), value: stats?.total_users ?? users.length, iconColor: "text-primary", iconBg: "bg-primary/10" },
    { icon: UserCheck, label: t("adminUsers.activeUsers"), value: stats?.active_users ?? "—", iconColor: "text-primary", iconBg: "bg-primary/10" },
    { icon: UserX, label: t("adminUsers.inactiveUsers"), value: stats?.inactive_users ?? "—", iconColor: "text-destructive", iconBg: "bg-destructive/10" },
    { icon: Shield, label: t("adminUsers.admins"), value: stats?.admins ?? "—", iconColor: "text-primary", iconBg: "bg-primary/10" },
  ];

  const handleAddAdmin = async () => {
    if (!adminEmail.trim()) {
      toast({ title: t("adminUsers.enterEmail"), variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const result = await apiPromoteToAdmin(adminEmail.trim());
      if (result.success || result.status === "success") {
        toast({ title: t("adminUsers.addNewAdmin"), description: `${adminEmail} promoted successfully` });
        setShowAddAdmin(false);
        setAdminEmail("");
        loadData();
      } else {
        toast({ title: result.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: t("adminUsers.userNotFound"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (user: any) => {
    try {
      await apiDeleteUser(user.id || user.user_id);
      toast({ title: `${user.name} deleted`, variant: "destructive" });
      loadData();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleDeactivateUser = async (user: any) => {
    try {
      await apiDeactivateUser(user.id || user.user_id);
      toast({ title: `${user.name} deactivated` });
      loadData();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const handleActivateUser = async (user: any) => {
    try {
      await apiActivateUser(user.id || user.user_id);
      toast({ title: `${user.name} activated` });
      loadData();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title={t("adminUsers.title")}>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t("adminUsers.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("adminUsers.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAddAdmin(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            {t("adminUsers.addUser")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t("adminUsers.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 rounded-lg border-0 bg-secondary"
            />
          </div>
        </div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.user")}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.email")}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.role")}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.status")}</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user: any, idx: number) => (
                  <tr key={user.id || user.user_id || idx} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium text-foreground">{user.name || user.full_name || "User"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          (user.role === "Admin" || user.role === "admin")
                            ? "border-primary/30 text-primary bg-primary/5"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {(user.role === "Admin" || user.role === "admin") && <Shield className="w-3 h-3 mr-1" />}
                        {user.role || "Farmer"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${
                          (user.status === "Active" || user.status === "active" || user.is_active)
                            ? "border-primary/30 text-primary bg-primary/5"
                            : "border-destructive/30 text-destructive bg-destructive/5"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          (user.status === "Active" || user.status === "active" || user.is_active) ? "bg-primary" : "bg-destructive"
                        }`} />
                        {user.status || (user.is_active ? "Active" : "Inactive")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-48 p-1">
                          <button
                            onClick={() => setViewUser(user)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors"
                          >
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {t("adminUsers.viewProfile")}
                          </button>
                          {(user.status === "Active" || user.status === "active" || user.is_active) ? (
                            <button
                              onClick={() => handleDeactivateUser(user)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors"
                            >
                              <UserMinus className="w-4 h-4 text-muted-foreground" />
                              {t("adminUsers.deactivate")}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateUser(user)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-primary rounded-md hover:bg-primary/10 transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              {t("adminUsers.activate")}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t("adminUsers.deleteUser")}
                          </button>
                        </PopoverContent>
                      </Popover>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>{t("adminUsers.addNewAdmin")}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("adminUsers.emailAddress")}</label>
              <Input
                type="email"
                placeholder={t("adminUsers.emailPlaceholder")}
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="h-12 bg-secondary/50 border-border"
                onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowAddAdmin(false); setAdminEmail(""); }}>
                {t("adminUsers.cancel")}
              </Button>
              <Button className="flex-1" onClick={handleAddAdmin} disabled={isLoading}>
                {isLoading ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : t("adminUsers.addAdmin")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary to-primary/70" />
          <div className="-mt-12 px-6 pb-6">
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center mb-3 shadow-md">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <DialogHeader className="text-left mb-4">
              <DialogTitle className="text-xl">{viewUser?.name || viewUser?.full_name || "User"}</DialogTitle>
              <p className="text-sm text-muted-foreground">{viewUser?.role || "Farmer"}</p>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{viewUser?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">{viewUser?.role || "Farmer"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={`text-xs mt-0.5 ${
                    (viewUser?.status === "Active" || viewUser?.status === "active") ? "border-primary/30 text-primary bg-primary/5" : "border-destructive/30 text-destructive bg-destructive/5"
                  }`}>
                    {viewUser?.status || "Active"}
                  </Badge>
                </div>
              </div>
              {viewUser?.joined && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium text-foreground">{viewUser.joined}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
