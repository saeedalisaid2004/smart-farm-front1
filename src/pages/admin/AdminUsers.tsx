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
import { motion } from "framer-motion";
import {
  getUserManagementData, searchUsers as apiSearchUsers,
  deleteUser as apiDeleteUser, deactivateUser as apiDeactivateUser,
  activateUser as apiActivateUser, promoteToAdmin as apiPromoteToAdmin,
} from "@/services/smartFarmApi";
import { sendNotification } from "@/services/notificationService";

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
        sendNotification({ title: "New Admin Added", description: `${adminEmail} has been promoted to admin`, type: "success" });
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
      sendNotification({ title: "User Deleted", description: `${user.name || user.email} has been removed from the system`, type: "warning" });
      loadData();
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" });
    }
  };

  const handleDeactivateUser = async (user: any) => {
    try {
      await apiDeactivateUser(user.id || user.user_id);
      toast({ title: `${user.name} deactivated` });
      sendNotification({ title: "User Deactivated", description: `${user.name || user.email} account has been deactivated`, type: "warning" });
      loadData();
    } catch {
      toast({ title: "Failed", variant: "destructive" });
    }
  };

  const handleActivateUser = async (user: any) => {
    try {
      await apiActivateUser(user.id || user.user_id);
      toast({ title: `${user.name} activated` });
      sendNotification({ title: "User Activated", description: `${user.name || user.email} account has been activated`, type: "success" });
      loadData();
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
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <span className="text-primary font-semibold text-sm">
                              {(user.name || user.full_name || "U").charAt(0).toUpperCase()}
                            </span>
                          </div>
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
                              onClick={() => setViewUser(user)}
                              className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-foreground rounded-lg hover:bg-secondary transition-colors"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                              {t("adminUsers.viewProfile")}
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
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
