import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Monitor, BarChart3, Settings, Bell, Moon, Sun,
  Leaf, User, LogOut, CheckCircle, AlertCircle, Info, Menu, X, Trash2, CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success": return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" };
    case "warning": return { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" };
    case "error": return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" };
    default: return { icon: Info, color: "text-primary", bg: "bg-primary/10" };
  }
};

const adminMenuItems = [
  { icon: LayoutDashboard, labelKey: "admin.dashboard" as const, path: "/admin/dashboard", gradient: "from-blue-500 to-indigo-600" },
  { icon: Users, labelKey: "admin.users" as const, path: "/admin/users", gradient: "from-emerald-500 to-green-600" },
  { icon: Monitor, labelKey: "admin.system" as const, path: "/admin/system", gradient: "from-orange-500 to-amber-600" },
  { icon: BarChart3, labelKey: "admin.reports" as const, path: "/admin/reports", gradient: "from-purple-500 to-violet-600" },
  { icon: Settings, labelKey: "admin.settings" as const, path: "/admin/settings", gradient: "from-slate-500 to-gray-600" },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: isRTL ? ar : enUS });
    } catch { return dateStr; }
  };

  const toggleTheme = () => document.documentElement.classList.toggle("dark");

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = user?.name || "Admin User";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);

  useEffect(() => {
    if (user?.avatar_url) setAvatarUrl(user.avatar_url);
  }, [user?.avatar_url]);

  useEffect(() => {
    const handler = (e: Event) => {
      const url = (e as CustomEvent).detail;
      setAvatarUrl(url);
    };
    window.addEventListener("avatar-updated", handler);
    return () => window.removeEventListener("avatar-updated", handler);
  }, []);

  const SidebarContent = () => (
    <>
      <div className={cn("p-5 flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground">{t("app.name")}</span>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1.5">
          {adminMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300",
                    isRTL && "flex-row-reverse text-right",
                    isActive
                      ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                    isActive ? "bg-white/20" : "bg-transparent"
                  )}>
                    <item.icon className="w-4.5 h-4.5 shrink-0" />
                  </div>
                  <span>{t(item.labelKey)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10">
        <p className="text-xs text-muted-foreground font-medium">Smart Farm AI</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Admin Panel v2.0</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex h-screen w-64 bg-card/80 backdrop-blur-xl border-border flex-col sticky top-0",
        isRTL ? "border-l order-last" : "border-r order-first"
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: isRTL ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? 280 : -280 }}
              transition={{ type: "spring", damping: 25 }}
              className={cn(
                "fixed top-0 h-screen w-64 bg-card z-50 flex flex-col md:hidden shadow-2xl",
                isRTL ? "right-0" : "left-0"
              )}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-4 md:px-6 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors mr-3"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-semibold text-foreground flex-1">{title}</h2>

          <div className={cn("flex items-center gap-2 md:gap-3", isRTL && "flex-row-reverse")}>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-secondary"
            >
              <Moon className="w-4 h-4 dark:hidden" />
              <Sun className="w-4 h-4 hidden dark:block" />
            </button>

            <Popover>
              <PopoverTrigger asChild>
                <button className="relative w-9 h-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:bg-secondary">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 rounded-2xl border-border/50 shadow-xl" align={isRTL ? "start" : "end"}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">{t("header.notifications")}</h3>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <>
                        <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors"
                          title="Mark all as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No notifications yet</p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {notifications.map((n) => {
                        const { icon: Icon, color, bg } = getNotificationIcon(n.type);
                        return (
                          <motion.div
                            key={n.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className={cn(
                              "flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer group",
                              !n.is_read && "bg-primary/5"
                            )}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                              <Icon className={cn("w-5 h-5", color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm text-foreground", !n.is_read && "font-medium")}>{n.title}</p>
                              {n.description && (
                                <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(n.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-2.5 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-secondary/50 transition-colors", isRTL && "flex-row-reverse")}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center relative overflow-hidden shadow-md shadow-primary/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-foreground text-sm font-bold">{userName.charAt(0).toUpperCase()}</span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card" />
                  </div>
                  <div className={cn("hidden md:block", isRTL ? "text-left" : "text-right")}>
                    <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{t("common.admin")}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48 rounded-xl">
                <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/profile")} className="cursor-pointer rounded-lg">
                  <User className="w-4 h-4 mr-2" /> {t("header.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer rounded-lg">
                  <Settings className="w-4 h-4 mr-2" /> {t("admin.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
