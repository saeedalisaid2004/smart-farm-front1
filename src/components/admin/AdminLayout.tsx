import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, Monitor, BarChart3, Settings, Bell, Moon, Sun,
  Leaf, User, LogOut, CheckCircle, AlertCircle, Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const adminMenuItems = [
  { icon: LayoutDashboard, labelKey: "admin.dashboard" as const, path: "/admin/dashboard" },
  { icon: Users, labelKey: "admin.users" as const, path: "/admin/users" },
  { icon: Monitor, labelKey: "admin.system" as const, path: "/admin/system" },
  { icon: BarChart3, labelKey: "admin.reports" as const, path: "/admin/reports" },
  { icon: Settings, labelKey: "admin.settings" as const, path: "/admin/settings" },
];

const notifications = [
  { id: 1, icon: CheckCircle, title: "New user registered", desc: "A new farmer has joined the platform", time: "5 min ago", color: "text-green-500", bg: "bg-green-50", unread: true },
  { id: 2, icon: AlertCircle, title: "System alert", desc: "High server load detected", time: "30 min ago", color: "text-destructive", bg: "bg-red-50", unread: true },
  { id: 3, icon: Globe, title: "Service update", desc: "Plant Disease Detection model updated", time: "2 hours ago", color: "text-primary", bg: "bg-primary/10", unread: false },
];

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout = ({ children, title }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();

  const toggleTheme = () => document.documentElement.classList.toggle("dark");

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const userName = user?.user_metadata?.full_name || "Admin User";

  return (
    <div className={cn("min-h-screen bg-background flex", isRTL && "flex-row-reverse")}>
      {/* Sidebar */}
      <aside className={cn("h-screen w-64 bg-card border-border flex flex-col sticky top-0", isRTL ? "border-l" : "border-r")}>
        <div className={cn("p-5 flex items-center gap-3", isRTL && "flex-row-reverse")}>
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-foreground">{t("app.name")}</span>
        </div>

        <nav className="flex-1 px-3 py-2">
          <ul className="space-y-1">
            {adminMenuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200",
                      isRTL && "flex-row-reverse text-right",
                      isActive
                        ? "bg-primary text-primary-foreground font-medium"
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
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className={cn("h-16 bg-card border-b border-border flex items-center justify-between px-6 sticky top-0 z-10", isRTL && "flex-row-reverse")}>
          <div className="flex-1" />
          <h2 className="text-lg font-medium text-foreground">{title}</h2>
          <div className={cn("flex-1 flex items-center gap-4", isRTL ? "justify-start flex-row-reverse" : "justify-end")}>
            <Popover>
              <PopoverTrigger asChild>
                <button className="relative text-muted-foreground hover:text-foreground transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-semibold text-foreground">{t("header.notifications")}</h3>
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-medium">2 new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className="flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", n.bg)}>
                        <n.icon className={cn("w-5 h-5", n.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                        <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
                      </div>
                      {n.unread && <div className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0 mt-1.5" />}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground transition-colors">
              <Moon className="w-5 h-5 dark:hidden" />
              <Sun className="w-5 h-5 hidden dark:block" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn("flex items-center gap-2 cursor-pointer", isRTL && "flex-row-reverse")}>
                  <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center relative">
                    <span className="text-primary text-sm font-semibold">{userName.charAt(0).toUpperCase()}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                  </div>
                  <div className={isRTL ? "text-left" : "text-right"}>
                    <p className="text-sm font-medium text-foreground leading-tight">{userName}</p>
                    <p className="text-xs text-muted-foreground leading-tight">{t("common.admin")}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/admin/profile")} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" /> {t("header.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" /> {t("admin.settings")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> {t("header.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
