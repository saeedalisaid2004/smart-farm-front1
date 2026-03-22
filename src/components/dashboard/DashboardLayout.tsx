import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home, Leaf, Eye, Sprout, FlaskConical, Apple, MessageCircle, FileText, Settings, Bell, Moon, Sun,
  User, LogOut, CheckCircle, AlertCircle, Globe, FlaskRound
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

const menuItems = [
  { icon: Home, labelKey: "dashboard.welcome" as const, path: "/dashboard" },
  { icon: Leaf, labelKey: "dashboard.plantDisease" as const, path: "/dashboard/plant-disease" },
  { icon: Eye, labelKey: "dashboard.animalWeight" as const, path: "/dashboard/animal-weight" },
  { icon: Sprout, labelKey: "dashboard.cropRecommendation" as const, path: "/dashboard/crop-recommendation" },
  { icon: FlaskConical, labelKey: "dashboard.soilAnalysis" as const, path: "/dashboard/soil-analysis" },
  { icon: Apple, labelKey: "dashboard.fruitQuality" as const, path: "/dashboard/fruit-quality" },
  { icon: MessageCircle, labelKey: "dashboard.chatbot" as const, path: "/dashboard/chatbot" },
  { icon: FileText, labelKey: "dashboard.reports" as const, path: "/dashboard/reports" },
  { icon: Settings, labelKey: "dashboard.settings" as const, path: "/dashboard/settings" },
];

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const notifications = [
  { id: 1, icon: CheckCircle, title: "AI analysis completed", desc: "Your plant disease scan is ready to view", time: "5 min ago", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10", unread: true },
  { id: 2, icon: AlertCircle, title: "Disease detected warning", desc: "Late blight found in tomato plants", time: "30 min ago", color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10", unread: true },
  { id: 3, icon: Globe, title: "Crop recommendation ready", desc: "Best crops for your soil type available", time: "2 hours ago", color: "text-primary", bg: "bg-primary/10", unread: true },
  { id: 4, icon: FlaskRound, title: "Soil analysis results", desc: "Soil nutrient analysis report is ready", time: "5 hours ago", color: "text-primary", bg: "bg-primary/10", unread: false },
];

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
  };

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

  return (
    <div className="min-h-screen bg-background flex" dir={isRTL ? "rtl" : "ltr"}>
      {/* Sidebar */}
      <aside className={cn(
        "h-screen w-64 bg-card border-border flex flex-col sticky top-0 shadow-sm",
        isRTL ? "border-l order-last" : "border-r order-first"
      )}>
        <div className={cn("p-5 flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">{t("app.name")}</span>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 relative",
                      isRTL && "flex-row-reverse text-right",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium shadow-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-border">
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">{t("common.farmer")}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center px-6 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-foreground flex-1">{title}</h2>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
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
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0 rounded-2xl shadow-lg" align={isRTL ? "start" : "end"}>
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">{t("header.notifications")}</h3>
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-medium">3 new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.bg)}>
                        <n.icon className={cn("w-5 h-5", n.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-2 cursor-pointer rounded-xl px-2 py-1.5 hover:bg-secondary transition-colors", isRTL && "flex-row-reverse")}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center relative overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isRTL ? "start" : "end"} className="w-48 rounded-xl">
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
        </header>

        <main className="flex-1 p-8">
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
