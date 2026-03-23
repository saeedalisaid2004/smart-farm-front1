import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Download, Calendar, TrendingUp, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFarmerStats, generateFarmerPdf, listFarmerReports, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";

const DashboardReports = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState("last30");
  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const fetchData = () => {
    const userId = getExternalUserId();
    if (!userId) return;

    setLoadingStats(true);
    Promise.all([
      getFarmerStats(userId).catch(() => null),
      listFarmerReports(userId).catch(() => []),
    ]).then(([statsData, reportsData]) => {
      if (statsData) setStats(statsData);
      if (Array.isArray(reportsData)) setReports(reportsData);
    }).finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGeneratePdf = async () => {
    const userId = getExternalUserId();
    if (!userId) return;
    setGeneratingPdf(true);
    try {
      const data = await generateFarmerPdf(userId);
      let url = data.file_url || data.download_url;
      if (data.detail) {
        toast({ variant: "destructive", title: "Failed to generate report", description: "The server encountered an error generating the PDF. Please try again later." });
      } else if (url) {
        // Ensure absolute URL
        if (!url.startsWith("http")) {
          url = `https://mahmoud123mahmoud-smartfarm-api.hf.space${url}`;
        }
        // Download as blob to avoid browser blocking
        try {
          const pdfRes = await fetch(url);
          const blob = await pdfRes.blob();
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = `Farm_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        } catch {
          // Fallback: try opening directly
          window.open(url, "_blank");
        }
        toast({ title: "Report generated successfully" });
        // Refresh stats and reports list
        fetchData();
      } else {
        toast({ title: data.message || "Report generated" });
      }
    } catch {
      toast({ variant: "destructive", title: "Failed to generate report", description: "Please try again later." });
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <DashboardLayout title={t("reports.title")}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{t("reports.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("reports.subtitle")}</p>
          </div>
          <Button className="rounded-full gap-2" onClick={handleGeneratePdf} disabled={generatingPdf}>
            {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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

        {loadingStats ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.total_reports || stats?.total_analyses || 0}</p>
                  <p className="text-sm text-muted-foreground">{t("reports.totalReports")}</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.this_month || 0}</p>
                  <p className="text-sm text-muted-foreground">{t("reports.thisMonth")}</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats?.growth || "N/A"}</p>
                  <p className="text-sm text-muted-foreground">{t("reports.vsLastMonth")}</p>
                </div>
              </div>
            </div>

            {/* Generated Reports Section */}
            <div className="bg-card border border-border rounded-2xl p-5 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Generated Reports</h3>
                  <p className="text-sm text-muted-foreground">Download your farm analysis reports</p>
                </div>
              </div>
              <Button className="rounded-full gap-2" onClick={handleGeneratePdf} disabled={generatingPdf}>
                {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Generate New Report
              </Button>
            </div>

            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report: any, idx: number) => (
                  <div key={idx} className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground">{report.name || report.title || `Report #${idx + 1}`}</h3>
                          <p className="text-sm text-muted-foreground mt-0.5">{report.description || ""}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {report.date || report.created_at || ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {report.file_url && (
                      <a
                        href={report.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 border-t border-border text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        {t("reports.download")}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No reports available yet
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
