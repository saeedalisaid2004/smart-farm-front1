import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, Users, Globe, Activity, Filter, FileText, Download, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAdminReportStats, generatePremiumReport } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const AdminReports = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    getAdminReportStats()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingPdf(true);
    try {
      const result = await generatePremiumReport();
      if (result.file_url) {
        window.open(result.file_url, "_blank");
        toast({ title: "Report generated successfully" });
      } else {
        toast({ title: result.message || "Report generated" });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to generate report" });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const usageData = data?.charts?.usage_by_service
    ? Object.entries(data.charts.usage_by_service).map(([service, value]) => ({ service, value }))
    : [
        { service: "Plant Disease", value: 340 },
        { service: "Animal Weight", value: 250 },
        { service: "Crop Rec.", value: 190 },
        { service: "Soil Analysis", value: 160 },
        { service: "Fruit Quality", value: 140 },
        { service: "Chatbot", value: 310 },
      ];

  const growthData = data?.charts?.user_growth
    ? Object.entries(data.charts.user_growth).map(([month, users]) => ({ month, users }))
    : [
        { month: "Jan", users: 120 }, { month: "Feb", users: 180 },
        { month: "Mar", users: 240 }, { month: "Apr", users: 300 },
        { month: "May", users: 380 }, { month: "Jun", users: 420 },
      ];

  const dailyData = data?.charts?.daily_activity
    ? Object.entries(data.charts.daily_activity).map(([day, activity]) => ({ day, activity }))
    : [
        { day: "Jun 1", activity: 240 }, { day: "Jun 2", activity: 265 },
        { day: "Jun 3", activity: 250 }, { day: "Jun 4", activity: 300 },
        { day: "Jun 5", activity: 270 }, { day: "Jun 6", activity: 210 },
        { day: "Jun 7", activity: 180 },
      ];

  const statsCards = [
    { icon: TrendingUp, label: t("adminReports.totalAnalyses"), value: data?.total_analyses ?? "8,456", change: `+23% ${t("adminReports.fromLastMonth")}`, gradient: "from-emerald-500 to-green-600" },
    { icon: Users, label: t("adminReports.activeUsers"), value: data?.active_users ?? "1,247", change: `+12% ${t("adminReports.fromLastMonth")}`, gradient: "from-blue-500 to-indigo-600" },
    { icon: Globe, label: t("adminReports.aiServices"), value: data?.ai_services_count ?? "6 Active", change: t("adminReports.uptimePercent"), gradient: "from-purple-500 to-violet-600" },
    { icon: Activity, label: t("adminReports.avgResponse"), value: data?.avg_response_time ?? "145ms", change: `-8% ${t("adminReports.fromLastMonth")}`, gradient: "from-orange-500 to-amber-600" },
  ];

  if (loading) {
    return (
      <AdminLayout title={t("adminReports.title")}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t("adminReports.title")}>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("adminReports.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("adminReports.subtitle")}</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-foreground">{t("adminReports.filters")}</h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">{t("adminReports.dateRange")}</p>
            <Select defaultValue="30">
              <SelectTrigger className="w-64 h-11 rounded-xl">
                <SelectValue placeholder={t("adminReports.dateRange")} />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7">{t("adminReports.last7")}</SelectItem>
                <SelectItem value="30">{t("adminReports.last30")}</SelectItem>
                <SelectItem value="90">{t("adminReports.last90")}</SelectItem>
                <SelectItem value="365">{t("adminReports.lastYear")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs mt-1 text-primary font-medium">{stat.change}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminReports.usageByService")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminReports.totalPerService")}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="service" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminReports.userGrowth")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminReports.newRegistrations")}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="users" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ fill: "hsl(142, 71%, 45%)", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Daily Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t("adminReports.dailyActivity")}</h3>
              <p className="text-sm text-muted-foreground">{t("adminReports.platformActivity")}</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
              <Line type="monotone" dataKey="activity" stroke="hsl(142, 71%, 45%)" strokeWidth={3} dot={{ fill: "hsl(142, 71%, 45%)", r: 5, strokeWidth: 2, stroke: "hsl(var(--card))" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Generate Report */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminReports.generatedReports")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminReports.downloadHistorical")}</p>
              </div>
            </div>
            <Button onClick={handleGenerateReport} disabled={generatingPdf} className="rounded-xl px-6 shadow-md shadow-primary/20 gap-2">
              {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {t("adminReports.generateNew")}
            </Button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
