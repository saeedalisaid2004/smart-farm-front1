import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, UserCheck, UserX, Shield, Search, MoreVertical, Mail, Eye, UserMinus, Trash2, UserPlus, Loader2, Calendar, Bell, BellOff, Phone, ShieldOff, Activity } from "lucide-react";
import { getSavedAvatarUrl } from "@/services/avatarService";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import {
  getUserManagementData, searchUsers as apiSearchUsers,
  deleteUser as apiDeleteUser, deactivateUser as apiDeactivateUser,
  activateUser as apiActivateUser, promoteToAdmin as apiPromoteToAdmin,
  demoteToFarmer as apiDemoteToFarmer,
  getUserActivityDetails as apiGetUserActivity,
  updateAdminNotificationSettings, updateFarmerNotificationSettings,
} from "@/services/smartFarmApi";

import { Switch } from "@/components/ui/switch";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

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
  const [activitiesUser, setActivitiesUser] = useState<any>(null);
  const [notifSettings, setNotifSettings] = useState<{ push: boolean; email: boolean } | null>(null);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [activity, setActivity] = useState<any>(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityPeriod, setActivityPeriod] = useState<"daily" | "weekly" | "monthly" | "all">("all");

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
    { icon: Users, label: t("adminUsers.totalUsers"), value: stats?.total_users ?? users.length, gradient: "from-blue-500 to-indigo-600" },
    { icon: UserCheck, label: t("adminUsers.activeUsers"), value: stats?.active_users ?? "—", gradient: "from-emerald-500 to-green-600" },
    { icon: UserX, label: t("adminUsers.inactiveUsers"), value: stats?.inactive_users ?? "—", gradient: "from-rose-500 to-red-600" },
    { icon: Shield, label: t("adminUsers.admins"), value: stats?.admins ?? "—", gradient: "from-purple-500 to-violet-600" },
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

  const handleDemoteUser = async (user: any) => {
    if (!user.email) {
      toast({ title: "Email required", variant: "destructive" });
      return;
    }
    try {
      const result = await apiDemoteToFarmer(user.email);
      if (result.success || result.status === "success" || result.message) {
        toast({ title: `${user.name || user.full_name || user.email} ${t("adminUsers.demotedSuccess")}` });
        loadData();
      } else {
        toast({ title: result.message || "Failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const loadActivity = async (uid: number | string, period: "daily" | "weekly" | "monthly" | "all") => {
    setLoadingActivity(true);
    try {
      // Always fetch all; we filter client-side because backend ignores `period`.
      const data = await apiGetUserActivity(uid, "all");
      setActivity(data);
    } catch {
      setActivity(null);
    }
    setLoadingActivity(false);
  };

  const handleViewUser = async (user: any) => {
    setViewUser(user);
    setNotifSettings(null);
    const uid = user.id || user.user_id;
    if (uid) {
      setLoadingNotif(true);
      try {
        const data = await updateAdminNotificationSettings(uid, {});
        if (data.current_settings) setNotifSettings(data.current_settings);
      } catch {}
      setLoadingNotif(false);
    }
  };

  const handleViewActivities = (user: any) => {
    setActivitiesUser(user);
    setActivity(null);
    setActivityPeriod("all");
    const uid = user.id || user.user_id;
    if (uid) loadActivity(uid, "all");
  };

  const handleChangePeriod = (period: "daily" | "weekly" | "monthly" | "all") => {
    setActivityPeriod(period);
    // Client-side filter only — data already loaded.
  };

  const handleToggleNotif = async (key: "push" | "email", value: boolean) => {
    if (!viewUser) return;
    const uid = viewUser.id || viewUser.user_id;
    try {
      const data = await updateAdminNotificationSettings(uid, { [key]: value });
      if (data.current_settings) setNotifSettings(data.current_settings);
      toast({ title: t("adminUsers.notifUpdated") || "Notification settings updated" });
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  return (
    <AdminLayout title={t("adminUsers.title")}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("adminUsers.title")}</h1>
            <p className="text-muted-foreground mt-1">{t("adminUsers.subtitle")}</p>
          </div>
          <Button onClick={() => setShowAddAdmin(true)} className="gap-2 rounded-xl shadow-md shadow-primary/20">
            <UserPlus className="w-4 h-4" />
            {t("adminUsers.addAdmin")}
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">{card.label}</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-2xl p-4"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={t("adminUsers.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl border-0 bg-secondary/50 text-foreground"
            />
          </div>
        </motion.div>

        {loadingData ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("adminUsers.user")}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("adminUsers.email")}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("adminUsers.role")}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("adminUsers.status")}</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("adminUsers.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((user: any, idx: number) => (
                    <tr key={user.id || user.user_id || idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 rounded-xl">
                            {(() => {
                              const aid = user.id || user.user_id;
                              const avatarUrl = user.avatar_url || (aid ? getSavedAvatarUrl(aid) : null);
                              return avatarUrl ? <AvatarImage src={avatarUrl} className="rounded-xl object-cover" /> : null;
                            })()}
                            <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-semibold text-sm">
                              {(user.name || user.full_name || "U").charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{user.name || user.full_name || "User"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium rounded-lg ${
                            (user.role === "Admin" || user.role === "admin")
                              ? "border-purple-500/30 text-purple-600 bg-purple-500/10"
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
                          className={`text-xs font-medium rounded-lg ${
                            (user.status === "Active" || user.status === "active" || user.is_active)
                              ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10"
                              : "border-destructive/30 text-destructive bg-destructive/10"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            (user.status === "Active" || user.status === "active" || user.is_active) ? "bg-emerald-500" : "bg-destructive"
                          }`} />
                          {user.status || (user.is_active ? "Active" : "Inactive")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent align="end" className="w-48 p-1.5 rounded-xl">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              {t("adminUsers.viewProfile")}
                            </button>
                            <button
                              onClick={() => handleViewActivities(user)}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
                            >
                              <Activity className="w-4 h-4 text-muted-foreground" />
                              {t("adminUsers.activity")}
                            </button>
                            {(user.status === "Active" || user.status === "active" || user.is_active) ? (
                              <button
                                onClick={() => handleDeactivateUser(user)}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
                              >
                                <UserMinus className="w-4 h-4 text-muted-foreground" />
                                {t("adminUsers.deactivate")}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivateUser(user)}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-primary rounded-lg hover:bg-primary/10 transition-colors"
                              >
                                <UserCheck className="w-4 h-4" />
                                {t("adminUsers.activate")}
                              </button>
                            )}
                            {(user.role === "Admin" || user.role === "admin") && (
                              <button
                                onClick={() => handleDemoteUser(user)}
                                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
                              >
                                <ShieldOff className="w-4 h-4 text-muted-foreground" />
                                {t("adminUsers.demote")}
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
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
          </motion.div>
        )}
      </div>

      {/* Add Admin Dialog */}
      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <DialogTitle className="text-lg">{t("adminUsers.addNewAdmin")}</DialogTitle>
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
                className="h-12 bg-secondary/50 border-border rounded-xl"
                onKeyDown={(e) => e.key === "Enter" && handleAddAdmin()}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setShowAddAdmin(false); setAdminEmail(""); }}>
                {t("adminUsers.cancel")}
              </Button>
              <Button className="flex-1 rounded-xl shadow-md shadow-primary/20" onClick={handleAddAdmin} disabled={isLoading}>
                {isLoading ? <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : t("adminUsers.addAdmin")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Profile Dialog */}
      <Dialog open={!!viewUser} onOpenChange={(open) => !open && setViewUser(null)}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl">
          <div className="h-28 bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          </div>
          <div className="-mt-12 px-6 pb-6">
            <div className="w-20 h-20 rounded-2xl bg-card border-4 border-background flex items-center justify-center mb-3 shadow-xl">
              <span className="text-2xl font-bold text-primary">
                {(viewUser?.name || viewUser?.full_name || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <DialogHeader className="text-left mb-4">
              <DialogTitle className="text-xl">{viewUser?.name || viewUser?.full_name || "User"}</DialogTitle>
              <p className="text-sm text-muted-foreground">{viewUser?.role || "Farmer"}</p>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-foreground">{viewUser?.email}</p>
                </div>
              </div>
              {viewUser?.phone && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("profile.phone")}</p>
                    <p className="text-sm font-medium text-foreground">{viewUser.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium text-foreground">{viewUser?.role || "Farmer"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={`text-xs mt-0.5 rounded-lg ${
                    (viewUser?.status === "Active" || viewUser?.status === "active") ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/10" : "border-destructive/30 text-destructive bg-destructive/10"
                  }`}>
                    {viewUser?.status || "Active"}
                  </Badge>
                </div>
              </div>
              {viewUser?.joined && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Joined</p>
                    <p className="text-sm font-medium text-foreground">{viewUser.joined}</p>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              <div className="p-3.5 rounded-xl bg-secondary/50 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">{t("adminUsers.notifications")}</p>
                </div>
                {loadingNotif ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : notifSettings ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{t("adminUsers.pushNotif")}</span>
                      <Switch checked={notifSettings.push} onCheckedChange={(v) => handleToggleNotif("push", v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{t("adminUsers.emailNotif")}</span>
                      <Switch checked={notifSettings.email} onCheckedChange={(v) => handleToggleNotif("email", v)} />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Activities Dialog (separate) */}
      <Dialog open={!!activitiesUser} onOpenChange={(open) => !open && setActivitiesUser(null)}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          <div className="h-20 bg-gradient-to-r from-primary via-primary/80 to-primary/60 relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          </div>
          <div className="-mt-10 px-6 pb-6">
            <div className="w-16 h-16 rounded-2xl bg-card border-4 border-background flex items-center justify-center mb-3 shadow-xl">
              <Activity className="w-7 h-7 text-primary" />
            </div>
            <DialogHeader className="text-left mb-4">
              <DialogTitle className="text-lg">{t("adminUsers.activity")}</DialogTitle>
              <p className="text-sm text-muted-foreground">{activitiesUser?.name || activitiesUser?.full_name || "User"}</p>
            </DialogHeader>

            <div className="grid grid-cols-4 gap-1 p-1 bg-secondary/50 rounded-lg mb-4">
              {(["daily", "weekly", "monthly", "all"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handleChangePeriod(p)}
                  className={`text-xs py-1.5 rounded-md transition-colors ${
                    activityPeriod === p
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {t(`adminUsers.${p === "all" ? "allTime" : p}`)}
                </button>
              ))}
            </div>

            {loadingActivity ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : activity ? (
              <div className="space-y-2 mb-3">
                {(() => {
                  // Build filtered list first (used by both counts + history sections)
                  const rawList: any[] =
                    (Array.isArray(activity?.activities) && activity.activities) ||
                    (Array.isArray(activity?.recent_activities) && activity.recent_activities) ||
                    (Array.isArray(activity?.history) && activity.history) ||
                    (Array.isArray(activity?.items) && activity.items) ||
                    [];
                  const now = new Date();
                  const cutoff =
                    activityPeriod === "daily"
                      ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                      : activityPeriod === "weekly"
                      ? now.getTime() - 7 * 24 * 60 * 60 * 1000
                      : activityPeriod === "monthly"
                      ? now.getTime() - 30 * 24 * 60 * 60 * 1000
                      : 0;
                  const filteredList =
                    activityPeriod === "all"
                      ? rawList
                      : rawList.filter((it: any) => {
                          const d = it?.date || it?.created_at || it?.timestamp;
                          if (!d) return false;
                          const t = new Date(d).getTime();
                          return !isNaN(t) && t >= cutoff;
                        });

                  // Recompute counts from filtered list when filtering, else use server counts
                  let entries: [string, number][] = [];
                  let total = 0;
                  if (activityPeriod === "all") {
                    const counts =
                      activity.activity_counts ||
                      activity.counts ||
                      activity.summary ||
                      activity.data ||
                      activity;
                    entries = counts && typeof counts === "object" && !Array.isArray(counts)
                      ? (Object.entries(counts).filter(([k, v]) =>
                          typeof v === "number" && !["user_id", "id", "period", "total"].includes(k)
                        ) as [string, number][])
                      : [];
                    total = activity.total_activities ?? activity.total ?? entries.reduce((s, [, v]) => s + v, 0);
                  } else {
                    const map: Record<string, number> = {};
                    for (const it of filteredList) {
                      const key = String(it?.type || "other").toLowerCase().replace(/\s+/g, "_");
                      map[key] = (map[key] || 0) + 1;
                    }
                    entries = Object.entries(map);
                    total = filteredList.length;
                  }

                  if (entries.length === 0 && !total) {
                    return <p className="text-xs text-muted-foreground text-center py-2">{t("adminUsers.noActivity")}</p>;
                  }
                  return (
                    <div className="p-3.5 rounded-xl bg-secondary/50 space-y-2">
                      {entries.map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-sm">
                          <span className="text-foreground capitalize" dir="auto">
                            {key.replace(/_/g, " ")}
                          </span>
                          <Badge variant="outline" className="rounded-md text-xs">
                            {value as number}
                          </Badge>
                        </div>
                      ))}
                      {total ? (
                        <div className="flex items-center justify-between text-sm pt-2 mt-1 border-t border-border/50">
                          <span className="font-medium text-foreground">Total</span>
                          <Badge className="rounded-md text-xs">{total}</Badge>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-2">{t("adminUsers.noActivity")}</p>
            )}

            {/* Activity History List (with images when available) */}
            {(() => {
              const rawList: any[] =
                (Array.isArray(activity?.activities) && activity.activities) ||
                (Array.isArray(activity?.recent_activities) && activity.recent_activities) ||
                (Array.isArray(activity?.history) && activity.history) ||
                (Array.isArray(activity?.items) && activity.items) ||
                [];
              const now = new Date();
              const cutoff =
                activityPeriod === "daily"
                  ? new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
                  : activityPeriod === "weekly"
                  ? now.getTime() - 7 * 24 * 60 * 60 * 1000
                  : activityPeriod === "monthly"
                  ? now.getTime() - 30 * 24 * 60 * 60 * 1000
                  : 0;
              const list =
                activityPeriod === "all"
                  ? rawList
                  : rawList.filter((it: any) => {
                      const d = it?.date || it?.created_at || it?.timestamp;
                      if (!d) return false;
                      const t = new Date(d).getTime();
                      return !isNaN(t) && t >= cutoff;
                    });
              if (!list.length) return null;
              return (
                <div className="pt-3 border-t border-border/50 space-y-2">
                  <p className="text-xs font-medium text-foreground/80">History</p>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {list.map((it: any, i: number) => (
                      <div key={i} className="flex gap-3 p-2.5 rounded-lg bg-secondary/40 border border-border/40">
                        {it.has_image && it.image_url ? (
                          <img
                            src={it.image_url}
                            alt={it.type || "activity"}
                            loading="lazy"
                            className="w-14 h-14 rounded-lg object-cover shrink-0 border border-border/40"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Activity className="w-5 h-5 text-primary/70" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium text-foreground truncate" dir="auto">{it.type}</p>
                            {it.date && (
                              <span className="text-[10px] text-muted-foreground shrink-0">{it.date}</span>
                            )}
                          </div>
                          {it.result && (
                            <p className="text-xs text-foreground/80 mt-0.5 line-clamp-2" dir="auto">{it.result}</p>
                          )}
                          {it.details && (
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2" dir="auto">{it.details}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
