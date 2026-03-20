import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, UserCheck, UserX, Shield, Search, MoreVertical, Mail, Eye, UserMinus, Trash2, UserPlus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const mockUsers = [
  { id: 1, name: "John Farmer", email: "john.farmer@example.com", role: "Farmer", status: "Active", joined: "Jan 15, 2024" },
  { id: 2, name: "Sarah Miller", email: "sarah.miller@example.com", role: "Farmer", status: "Active", joined: "Feb 20, 2024" },
  { id: 3, name: "Mike Johnson", email: "mike.johnson@example.com", role: "Admin", status: "Active", joined: "Jan 10, 2024" },
  { id: 4, name: "Emma Wilson", email: "emma.wilson@example.com", role: "Farmer", status: "Active", joined: "Mar 5, 2024" },
  { id: 5, name: "David Brown", email: "david.brown@example.com", role: "Farmer", status: "Inactive", joined: "Feb 12, 2024" },
  { id: 6, name: "Lisa Anderson", email: "lisa.anderson@example.com", role: "Farmer", status: "Active", joined: "Mar 18, 2024" },
  { id: 7, name: "Tom Harris", email: "tom.harris@example.com", role: "Farmer", status: "Active", joined: "Jan 25, 2024" },
  { id: 8, name: "Rachel Green", email: "rachel.green@example.com", role: "Admin", status: "Active", joined: "Feb 8, 2024" },
];

const AdminUsers = () => {
  const { t } = useLanguage();
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const statsCards = [
    { icon: Users, label: t("adminUsers.totalUsers"), value: "1,247", iconColor: "text-primary", iconBg: "bg-primary/10" },
    { icon: UserCheck, label: t("adminUsers.activeUsers"), value: "1,156", iconColor: "text-primary", iconBg: "bg-primary/10" },
    { icon: UserX, label: t("adminUsers.inactiveUsers"), value: "91", iconColor: "text-destructive", iconBg: "bg-destructive/10" },
    { icon: Shield, label: t("adminUsers.admins"), value: "12", iconColor: "text-primary", iconBg: "bg-primary/10" },
  ];

  const handleAddAdmin = async () => {
    if (!adminEmail.trim()) {
      toast({ title: t("adminUsers.enterEmail"), variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("promote_to_admin", { _email: adminEmail.trim() });

      if (error) throw error;

      const result = data as { success: boolean; message: string; user_name?: string };

      if (result.success) {
        toast({
          title: t("adminUsers.addNewAdmin"),
          description: `${result.user_name || adminEmail} ${t("adminUsers.promotedSuccess")}`,
        });
        setShowAddAdmin(false);
        setAdminEmail("");
      } else {
        const msg = result.message === "User not found"
          ? t("adminUsers.userNotFound")
          : result.message === "User is already an admin"
            ? t("adminUsers.alreadyAdmin")
            : result.message;
        toast({ title: msg, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: t("adminUsers.userNotFound"), variant: "destructive" });
    } finally {
      setIsLoading(false);
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
            <Input placeholder={t("adminUsers.searchPlaceholder")} className="pl-12 h-12 rounded-lg border-0 bg-secondary" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.user")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.email")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.role")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.status")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.joined")}</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">{t("adminUsers.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
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
                        user.role === "Admin"
                          ? "border-primary/30 text-primary bg-primary/5"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {user.role === "Admin" && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${
                        user.status === "Active"
                          ? "border-primary/30 text-primary bg-primary/5"
                          : "border-destructive/30 text-destructive bg-destructive/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === "Active" ? "bg-primary" : "bg-destructive"
                      }`} />
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.joined}</td>
                  <td className="px-6 py-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1">
                        <button
                          onClick={() => toast({ title: t("adminUsers.viewProfile"), description: `${t("adminUsers.viewing")} ${user.name}` })}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {t("adminUsers.viewProfile")}
                        </button>
                        <button
                          onClick={() => toast({ title: t("adminUsers.deactivate"), description: `${user.name} ${t("adminUsers.deactivated")}` })}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors"
                        >
                          <UserMinus className="w-4 h-4 text-muted-foreground" />
                          {t("adminUsers.deactivate")}
                        </button>
                        <button
                          onClick={() => toast({ title: t("adminUsers.deleteUser"), description: `${user.name} ${t("adminUsers.deleted")}`, variant: "destructive" })}
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
      </div>

      {/* Add New Admin Dialog */}
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
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowAddAdmin(false); setAdminEmail(""); }}
              >
                {t("adminUsers.cancel")}
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddAdmin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  t("adminUsers.addAdmin")
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
