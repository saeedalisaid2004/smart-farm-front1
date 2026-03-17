import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Activity, Cpu, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

const usageData = [
  { month: "Jan", value: 150 },
  { month: "Feb", value: 180 },
  { month: "Mar", value: 230 },
  { month: "Apr", value: 280 },
  { month: "May", value: 350 },
  { month: "Jun", value: 400 },
];

const COLORS = [
  "hsl(142, 71%, 35%)",
  "hsl(142, 71%, 45%)",
  "hsl(142, 71%, 55%)",
  "hsl(142, 71%, 65%)",
  "hsl(142, 71%, 75%)",
  "hsl(142, 71%, 85%)",
];

const activeUsersData = [
  { day: "Mon", users: 32 },
  { day: "Tue", users: 40 },
  { day: "Wed", users: 36 },
  { day: "Thu", users: 50 },
  { day: "Fri", users: 45 },
  { day: "Sat", users: 28 },
  { day: "Sun", users: 24 },
];

const recentActivity = [
  { nameKey: "John Farmer", action: "Used Plant Disease Detection", time: "2 minutes ago" },
  { nameKey: "Sarah Miller", action: "Completed Soil Analysis", time: "15 minutes ago" },
  { nameKey: "Mike Johnson", action: "Requested Crop Recommendation", time: "1 hour ago" },
  { nameKey: "Emma Wilson", action: "Used Animal Weight Estimation", time: "2 hours ago" },
  { nameKey: "David Brown", action: "Analyzed Fruit Quality", time: "3 hours ago" },
];

const AdminDashboard = () => {
  const { t } = useLanguage();

  const serviceData = [
    { name: t("adminDash.plantDisease"), value: 25 },
    { name: t("adminDash.chatbot"), value: 21 },
    { name: t("adminDash.animalWeight"), value: 18 },
    { name: t("adminDash.recommendation"), value: 14 },
    { name: t("adminDash.soilAnalysis"), value: 12 },
    { name: t("adminDash.fruitQuality"), value: 10 },
  ];

  const statsCards = [
    { icon: Users, label: t("adminDash.totalUsers"), value: "1,247", sub: t("adminDash.registered"), change: "+12%", changeColor: "text-primary" },
    { icon: Activity, label: t("adminDash.totalAnalyses"), value: "8,456", sub: t("adminDash.thisMonth"), change: "+23%", changeColor: "text-primary" },
    { icon: Cpu, label: t("adminDash.aiServices"), value: "6 of 6", sub: t("adminDash.active"), badge: t("adminDash.allOnline"), badgeColor: "text-primary" },
    { icon: TrendingUp, label: t("adminDash.mostUsed"), value: t("adminDash.plantDisease"), sub: t("adminDash.detection"), badge: t("adminDash.top"), badgeColor: "text-primary" },
  ];

  return (
    <AdminLayout title={t("adminDash.title")}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adminDash.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("adminDash.subtitle")}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                {card.change && (
                  <span className={`text-xs font-semibold ${card.changeColor}`}>{card.change}</span>
                )}
                {card.badge && (
                  <span className={`text-xs font-semibold ${card.badgeColor}`}>{card.badge}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{card.label}</p>
                <p className="text-sm text-muted-foreground">{card.value} {card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminDash.usageOverTime")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminDash.monthlyTrend")}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 46%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminDash.serviceDistribution")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminDash.usageByService")}</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} fontSize={11}>
                    {serviceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Users Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("adminDash.activeUsers")}</h3>
              <p className="text-sm text-muted-foreground">{t("adminDash.dailyActive")}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="day" stroke="hsl(220, 10%, 46%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="users" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent System Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">{t("adminDash.recentActivity")}</h3>
          <div className="divide-y divide-border">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.nameKey}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
