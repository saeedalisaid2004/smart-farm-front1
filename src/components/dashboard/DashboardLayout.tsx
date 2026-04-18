import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Leaf, Eye, Sprout, FlaskConical, Apple, MessageCircle, FileText, Settings, Bell, Moon, Sun,
  User, LogOut, CheckCircle, AlertCircle, Info, Menu, Trash2, CheckCheck, XCircle, Mail
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
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { useUnreadMessages } from "@/hooks/useUnreadMessages";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const menuItems = [
  { icon: Home, labelKey: "dashboard.welcome" as const, path: "/dashboard" },
  { icon: Leaf, labelKey: "dashboard.plantDisease" as const, path: "/dashboard/plant-disease" },
  { icon: Eye, labelKey: "dashboard.animalWeight" as const, path: "/dashboard/animal-weight" },
  { icon: Sprout, labelKey: "dashboard.cropRecommendation" as const, path: "/dashboard/crop-recommendation" },
  { icon: FlaskConical, labelKey: "dashboard.soilAnalysis" as const, path: "/dashboard/soil-analysis" },
  { icon: Apple, labelKey: "dashboard.fruitQuality" as const, path: "/dashboard/fruit-quality" },
  { icon: MessageCircle, labelKey: "dashboard.chatbot" as const, path: "/dashboard/chatbot" },
  { icon: FileText, labelKey: "dashboard.reports" as const, path: "/dashboard/reports" },
  { icon: Mail, labelKey: "dashboard.messages" as const, path: "/dashboard/messages" },
  { icon: Settings, labelKey: "dashboard.settings" as const, path: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "success": return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" };
    case "warning": return { icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" };
    case "error": return { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10" };
    default: return { icon: Info, color: "text-primary", bg: "bg-primary/10" };
  }
};

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [mobileOpen, setMobileOpen] = useState(false);
  const unreadMsgCount = useUnreadMessages("farmer");

  const toggleTheme = () => { import("@/lib/theme").then(m => m.toggleTheme("farmer")); };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = user?.name || "John Farmer";
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

  const formatTime = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), {
        addSuffix: true,
        locale: isRTL ? ar : enUS,
      });
    } catch {
      return dateStr;
    }
  };

  const SidebarContent = () => (
    <>
      <div className={cn("p-5 flex items-center gap-3", isRTL && "flex-row-reverse")}>
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-bold text-foreground tracking-tight">{t("app.name")}</span>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 relative",
                    isRTL && "flex-row-reverse text-right",
                    isActive
                      ? "bg-primary text-primary-foreground font-medium shadow-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1">{t(item.labelKey)}</span>
                  {item.path === "/dashboard/messages" && unreadMsgCount > 0 && (
                    <span className="min-w-5 h-5 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold flex items-center justify-center animate-pulse">
                      {unreadMsgCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex" dir={isRTL ? "rtl" : "ltr"}>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "hidden md:flex h-screen w-64 bg-card border-border flex-col sticky top-0 shadow-sm",
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
        <header className="h-14 md:h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-3 md:px-6 sticky top-0 z-10">
          {isRTL ? (
            <>
              <div className="flex items-center gap-1.5 md:gap-3 flex-row-reverse">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="md:hidden w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                >
                  <Moon className="w-4 h-4 dark:hidden" />
                  <Sun className="w-4 h-4 hidden dark:block" />
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all relative">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] max-w-96 p-0 rounded-2xl shadow-lg" align="start">
                    <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
                      <h3 className="font-semibold text-foreground text-sm md:text-base">{t("header.notifications")}</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" /> {t("header.new")}
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={clearAll} className="text-xs text-destructive hover:underline flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 md:max-h-80 overflow-y-auto">
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
                                  "flex items-start gap-2.5 md:gap-3 p-3 md:p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer group",
                                  !n.is_read && "bg-primary/5"
                                )}
                                onClick={() => markAsRead(n.id)}
                              >
                                <div className={cn("w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                                  <Icon className={cn("w-4 h-4 md:w-5 md:h-5", color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-xs md:text-sm text-foreground", !n.is_read && "font-medium")}>{n.title}</p>
                                  {n.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.description}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
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
                    <button className="flex items-center gap-2 cursor-pointer rounded-xl px-1.5 md:px-2 py-1.5 hover:bg-secondary transition-colors flex-row-reverse">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary text-xs md:text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-card" />
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-semibold text-foreground leading-tight">{userName}</span>
                        <span className="text-xs text-muted-foreground leading-tight capitalize">
                          {user?.role === "admin" ? t("common.admin") : t("common.farmer")}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48 rounded-xl">
                    <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer rounded-lg">
                      <User className="w-4 h-4 mr-2" /> {t("header.profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer rounded-lg">
                      <Settings className="w-4 h-4 mr-2" /> {t("dashboard.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> {t("header.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h2 className="text-base md:text-lg font-semibold text-foreground truncate mr-auto">{title}</h2>
            </>
          ) : (
            <>
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors mr-2"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-base md:text-lg font-semibold text-foreground flex-1 truncate">{title}</h2>
              <div className="flex items-center gap-1.5 md:gap-3">
                <button
                  onClick={toggleTheme}
                  className="w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
                >
                  <Moon className="w-4 h-4 dark:hidden" />
                  <Sun className="w-4 h-4 hidden dark:block" />
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-9 h-9 rounded-xl bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all relative">
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-destructive text-destructive-foreground rounded-full text-[10px] font-bold flex items-center justify-center px-1">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[calc(100vw-2rem)] max-w-96 p-0 rounded-2xl shadow-lg" align="end">
                    <div className="flex items-center justify-between p-3 md:p-4 border-b border-border">
                      <h3 className="font-semibold text-foreground text-sm md:text-base">{t("header.notifications")}</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllAsRead} className="text-xs text-primary hover:underline flex items-center gap-1">
                            <CheckCheck className="w-3 h-3" /> {t("header.new")}
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={clearAll} className="text-xs text-destructive hover:underline flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-72 md:max-h-80 overflow-y-auto">
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
                                  "flex items-start gap-2.5 md:gap-3 p-3 md:p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer group",
                                  !n.is_read && "bg-primary/5"
                                )}
                                onClick={() => markAsRead(n.id)}
                              >
                                <div className={cn("w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
                                  <Icon className={cn("w-4 h-4 md:w-5 md:h-5", color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={cn("text-xs md:text-sm text-foreground", !n.is_read && "font-medium")}>{n.title}</p>
                                  {n.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.description}</p>
                                  )}
                                  <p className="text-xs text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-2" />}
                                  <button
                                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
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
                    <button className="flex items-center gap-2 cursor-pointer rounded-xl px-1.5 md:px-2 py-1.5 hover:bg-secondary transition-colors">
                      <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-primary text-xs md:text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
                        )}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-card" />
                      </div>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-semibold text-foreground leading-tight">{userName}</span>
                        <span className="text-xs text-muted-foreground leading-tight capitalize">
                          {user?.role === "admin" ? t("common.admin") : t("common.farmer")}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/dashboard/profile")} className="cursor-pointer rounded-lg">
                      <User className="w-4 h-4 mr-2" /> {t("header.profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/settings")} className="cursor-pointer rounded-lg">
                      <Settings className="w-4 h-4 mr-2" /> {t("dashboard.settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-lg text-destructive">
                      <LogOut className="w-4 h-4 mr-2" /> {t("header.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </header>

        <main className="flex-1 p-4 md:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
