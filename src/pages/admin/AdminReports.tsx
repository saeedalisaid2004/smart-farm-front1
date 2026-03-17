import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, Users, Globe, Activity, Filter, FileText, Calendar, Download } from "lucide-react";
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

const usageData = [
  { service: "Plant Disease", value: 340 },
  { service: "Animal Weight", value: 250 },
  { service: "Crop Rec.", value: 190 },
  { service: "Soil Analysis", value: 160 },
  { service: "Fruit Quality", value: 140 },
  { service: "Chatbot", value: 310 },
];

const dailyData = [
  { day: "Jun 1", activity: 240 },
  { day: "Jun 2", activity: 265 },
  { day: "Jun 3", activity: 250 },
  { day: "Jun 4", activity: 300 },
  { day: "Jun 5", activity: 270 },
  { day: "Jun 6", activity: 210 },
  { day: "Jun 7", activity: 180 },
];

const growthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 240 },
  { month: "Apr", users: 300 },
  { month: "May", users: 380 },
  { month: "Jun", users: 420 },
];

const AdminReports = () => {
  const { t } = useLanguage();

  const generatedReports = [
    { name: t("adminReports.monthlyUsage"), date: "Jun 1, 2024", tag: "Usage", size: "2.4 MB",
      content: () => `Monthly Usage Report - June 2024\n\nTotal Analyses: 8,456\nActive Users: 1,247\n\nService Breakdown:\n- Plant Disease Detection: 340\n- Animal Weight Estimation: 250\n- Crop Recommendation: 190\n- Soil Analysis: 160\n- Fruit Quality: 140\n- Smart Chatbot: 310` },
    { name: t("adminReports.userActivity"), date: "Jun 1, 2024", tag: "Users", size: "1.8 MB",
      content: () => `User Activity Analysis - June 2024\n\nTotal Users: 1,247\nNew Users: 40\nDaily Active Users: 312` },
    { name: t("adminReports.modelPerformance"), date: "May 25, 2024", tag: "Performance", size: "3.2 MB",
      content: () => `AI Model Performance Report - May 2024\n\nPlant Disease: 94.2%\nAnimal Weight: 91.8%\nCrop Recommendation: 89.5%\nFruit Quality: 92.1%` },
    { name: t("adminReports.systemHealth"), date: "May 20, 2024", tag: "System", size: "1.5 MB",
      content: () => `System Health Report - May 2024\n\nUptime: 99.8%\nAvg Response: 145ms\nPeak Load: 450 req/min` },
    { name: t("adminReports.revenue"), date: "May 15, 2024", tag: "Finance", size: "2.1 MB",
      content: () => `Revenue Analytics - May 2024\n\nTotal Revenue: $12,450\nGrowth: +18%\nChurn: 2.1%` },
  ];

  const statsCards = [
    { icon: TrendingUp, label: t("adminReports.totalAnalyses"), value: "8,456", change: `+23% ${t("adminReports.fromLastMonth")}`, color: "text-green-600", bg: "bg-green-50" },
    { icon: Users, label: t("adminReports.activeUsers"), value: "1,247", change: `+12% ${t("adminReports.fromLastMonth")}`, color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Globe, label: t("adminReports.aiServices"), value: "6 Active", change: t("adminReports.uptimePercent"), color: "text-green-600", bg: "bg-green-50" },
    { icon: Activity, label: t("adminReports.avgResponse"), value: "145ms", change: `-8% ${t("adminReports.fromLastMonth")}`, color: "text-green-600", bg: "bg-orange-50" },
  ];

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
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
              {t("adminReports.generateNew")}
            </Button>
          </div>

          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report.name} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{report.tag}</Badge>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const blob = new Blob([report.content()], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${report.name.replace(/\s+/g, "_")}.txt`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground py-2.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> {t("adminReports.download")}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
