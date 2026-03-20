import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Download, Calendar, TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

const DashboardReports = () => {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState("last30");

  const reports = [
    { id: 1, name: t("reports.plantReport"), desc: t("reports.plantReportDesc"), date: "December 10, 2024", tags: ["AI Analysis", "Completed"],
      content: () => `Plant Disease Analysis Report\n================================\nDate: December 10, 2024\nTotal Images Analyzed: 45\nDiseases Detected: 3\nHealthy Plants: 42 (93.3%)\n\nDetected Diseases:\n1. Tomato Early Blight - Confidence: 96.5%\n2. Apple Scab - Confidence: 92.1%\n3. Grape Black Rot - Detected in 1 sample` },
    { id: 2, name: t("reports.livestockReport"), desc: t("reports.livestockReportDesc"), date: "December 8, 2024", tags: ["Computer Vision", "Completed"],
      content: () => `Livestock Weight Monitoring Report\n===================================\nDate: December 8, 2024\nTotal Animals Tracked: 156\nAverage Weight: 425 kg\nWeight Range: 310 kg - 580 kg` },
    { id: 3, name: t("reports.cropReport"), desc: t("reports.cropReportDesc"), date: "December 5, 2024", tags: ["ML Prediction", "Completed"],
      content: () => `Crop Yield Forecast Report\n===========================\nDate: December 5, 2024\nCrop Varieties Analyzed: 12\nConfidence Level: 88.5%` },
    { id: 4, name: t("reports.soilReport"), desc: t("reports.soilReportDesc"), date: "December 1, 2024", tags: ["Soil Analysis", "Completed"],
      content: () => `Soil Quality Assessment Report\n==============================\nDate: December 1, 2024\nFields Analyzed: 8\nSoil Health Score: 78/100` },
  ];

  const handleDownload = (report: typeof reports[0]) => {
    const blob = new Blob([report.content()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout title={t("reports.title")}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t("reports.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("reports.subtitle")}</p>
          </div>
          <Button className="rounded-full gap-2">
            <Download className="w-4 h-4" />
            {t("reports.exportAll")}
          </Button>
        </div>

        {/* Report Filters */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Filter className="w-4 h-4 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">{t("adminReports.filters")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5">{t("adminReports.dateRange")}</p>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-56 bg-secondary/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">{t("adminReports.last7")}</SelectItem>
                <SelectItem value="last30">{t("adminReports.last30")}</SelectItem>
                <SelectItem value="last90">{t("adminReports.last90")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">{t("reports.totalReports")}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-sm text-muted-foreground">{t("reports.thisMonth")}</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">+25%</p>
              <p className="text-sm text-muted-foreground">{t("reports.vsLastMonth")}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{report.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{report.desc}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {report.date}
                      </span>
                      {report.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDownload(report)}
                className="w-full py-3 border-t border-border text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                {t("reports.download")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
