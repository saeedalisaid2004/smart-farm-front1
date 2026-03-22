import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Activity, Cpu, TrendingUp, Loader2, Zap } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminDashboardStats } from "@/services/smartFarmApi";
import { motion } from "framer-motion";

const COLORS = [
  "hsl(142, 71%, 45%)",
  "hsl(199, 89%, 48%)",
  "hsl(262, 83%, 58%)",
  "hsl(25, 95%, 53%)",
  "hsl(346, 77%, 50%)",
  "hsl(47, 96%, 53%)",
];

const parseApiTime = (timeStr: string): Date => {
  const isoStr = timeStr.replace(" ", "T") + "+02:00";
  return new Date(isoStr);
};

const getTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 0) return "just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboardStats()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary;
  const statsCards = [
    { icon: Users, label: t("adminDash.totalUsers"), value: summary?.total_users ?? "—", sub: t("adminDash.registered"), change: "+12%", gradient: "from-blue-500 to-indigo-600", bgGlow: "bg-blue-500/10" },
    { icon: Activity, label: t("adminDash.totalAnalyses"), value: summary?.total_analyses ?? "—", sub: t("adminDash.thisMonth"), change: "+23%", gradient: "from-emerald-500 to-green-600", bgGlow: "bg-emerald-500/10" },
    { icon: Cpu, label: t("adminDash.aiServices"), value: summary?.active_services ?? "6 of 6", sub: t("adminDash.active"), badge: t("adminDash.allOnline"), gradient: "from-purple-500 to-violet-600", bgGlow: "bg-purple-500/10" },
    { icon: TrendingUp, label: t("adminDash.mostUsed"), value: summary?.top_service ?? t("adminDash.plantDisease"), sub: t("adminDash.detection"), badge: t("adminDash.top"), gradient: "from-orange-500 to-amber-600", bgGlow: "bg-orange-500/10" },
  ];

  const usageByService = data?.charts?.service_distribution
    ? Object.entries(data.charts.service_distribution).map(([name, value]) => ({ name, value }))
    : [
        { name: t("adminDash.plantDisease"), value: 25 },
        { name: t("adminDash.chatbot"), value: 21 },
        { name: t("adminDash.animalWeight"), value: 18 },
        { name: t("adminDash.recommendation"), value: 14 },
        { name: t("adminDash.soilAnalysis"), value: 12 },
        { name: t("adminDash.fruitQuality"), value: 10 },
      ];

  const userGrowth = data?.charts?.usage_over_time
    ? Object.entries(data.charts.usage_over_time).map(([month, value]) => ({ month, value }))
    : [
        { month: "Jan", value: 150 }, { month: "Feb", value: 180 },
        { month: "Mar", value: 230 }, { month: "Apr", value: 280 },
        { month: "May", value: 350 }, { month: "Jun", value: 400 },
      ];

  const dailyActivity = data?.charts?.active_users_week
    ? Object.entries(data.charts.active_users_week).map(([day, users]) => ({ day, users }))
    : [
        { day: "Mon", users: 32 }, { day: "Tue", users: 40 },
        { day: "Wed", users: 36 }, { day: "Thu", users: 50 },
        { day: "Fri", users: 45 }, { day: "Sat", users: 28 },
        { day: "Sun", users: 24 },
      ];

  if (loading) {
    return (
      <AdminLayout title={t("adminDash.title")}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t("adminDash.title")}>
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("adminDash.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("adminDash.subtitle")}</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card, i) => (
            <motion.div
              key={card.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="group bg-card border border-border rounded-2xl p-5 space-y-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
                {card.change && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{card.change}</span>
                )}
                {card.badge && (
                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{card.badge}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminDash.usageOverTime")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminDash.monthlyTrend")}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="value" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ fill: "hsl(142, 71%, 45%)", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminDash.serviceDistribution")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminDash.usageByService")}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={usageByService} cx="50%" cy="50%" outerRadius={90} innerRadius={50} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} fontSize={11} strokeWidth={2} stroke="hsl(var(--card))">
                  {usageByService.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Daily Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("adminDash.activeUsers")}</h3>
              <p className="text-sm text-muted-foreground">{t("adminDash.dailyActive")}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Bar dataKey="users" fill="hsl(142, 71%, 45%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">{t("adminDash.recentActivity")}</h3>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {(data?.recent_activity && data.recent_activity.length > 0
              ? data.recent_activity
              : []
            ).map((item: any, idx: number) => {
              const timeStr = item.time || "";
              const date = timeStr ? parseApiTime(timeStr) : null;
              const ago = date ? getTimeAgo(date) : "";

              return (
                <div key={idx} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.user}</p>
                      <p className="text-xs text-muted-foreground">{item.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-full">{ago}</span>
                </div>
              );
            })}
            {(!data?.recent_activity || data.recent_activity.length === 0) && (
              <p className="text-muted-foreground text-sm py-4">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
