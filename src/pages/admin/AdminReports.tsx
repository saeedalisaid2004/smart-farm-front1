import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, Users, Globe, Activity, Filter, FileText, Calendar, Download, Loader2 } from "lucide-react";
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
        { month: "Jan", users: 120 },
        { month: "Feb", users: 180 },
        { month: "Mar", users: 240 },
        { month: "Apr", users: 300 },
        { month: "May", users: 380 },
        { month: "Jun", users: 420 },
      ];

  const dailyData = data?.charts?.daily_activity
    ? Object.entries(data.charts.daily_activity).map(([day, activity]) => ({ day, activity }))
    : [
        { day: "Jun 1", activity: 240 },
        { day: "Jun 2", activity: 265 },
        { day: "Jun 3", activity: 250 },
        { day: "Jun 4", activity: 300 },
        { day: "Jun 5", activity: 270 },
        { day: "Jun 6", activity: 210 },
        { day: "Jun 7", activity: 180 },
      ];

  const statsCards = [
    { icon: TrendingUp, label: t("adminReports.totalAnalyses"), value: data?.total_analyses ?? "8,456", change: `+23% ${t("adminReports.fromLastMonth")}`, color: "text-green-600", bg: "bg-green-50" },
    { icon: Users, label: t("adminReports.activeUsers"), value: data?.active_users ?? "1,247", change: `+12% ${t("adminReports.fromLastMonth")}`, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Globe, label: t("adminReports.aiServices"), value: data?.ai_services_count ?? "6 Active", change: t("adminReports.uptimePercent"), color: "text-green-600", bg: "bg-green-50" },
    { icon: Activity, label: t("adminReports.avgResponse"), value: data?.avg_response_time ?? "145ms", change: `-8% ${t("adminReports.fromLastMonth")}`, color: "text-green-600", bg: "bg-orange-50" },
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adminReports.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("adminReports.subtitle")}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">{t("adminReports.filters")}</h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">{t("adminReports.dateRange")}</p>
            <Select defaultValue="30">
              <SelectTrigger className="w-64 h-10">
                <SelectValue placeholder={t("adminReports.dateRange")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">{t("adminReports.last7")}</SelectItem>
                <SelectItem value="30">{t("adminReports.last30")}</SelectItem>
                <SelectItem value="90">{t("adminReports.last90")}</SelectItem>
                <SelectItem value="365">{t("adminReports.lastYear")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
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
                <Tooltip />
                <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
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
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
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
              <Tooltip />
              <Line type="monotone" dataKey="activity" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{t("adminReports.generatedReports")}</h3>
                <p className="text-sm text-muted-foreground">{t("adminReports.downloadHistorical")}</p>
              </div>
            </div>
            <Button onClick={handleGenerateReport} disabled={generatingPdf} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
              {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t("adminReports.generateNew")}
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
