import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { id: 1, name: "Plant Disease Analysis Report", desc: "45 images analyzed, 3 diseases detected", date: "December 10, 2024", tags: ["AI Analysis", "Completed"] },
  { id: 2, name: "Livestock Weight Monitoring", desc: "156 animals tracked, avg weight: 425kg", date: "December 8, 2024", tags: ["Computer Vision", "Completed"] },
  { id: 3, name: "Crop Yield Forecast", desc: "Seasonal prediction for 12 crop varieties", date: "December 5, 2024", tags: ["ML Prediction", "Completed"] },
  { id: 4, name: "Soil Quality Assessment", desc: "pH, moisture, and nutrient analysis", date: "December 1, 2024", tags: ["Soil Analysis", "Completed"] },
];

const DashboardReports = () => {
  return (
    <DashboardLayout title="Reports">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
            <p className="text-muted-foreground text-sm">Access and download all AI-generated reports and analyses</p>
          </div>
          <Button className="rounded-full gap-2">
            <Download className="w-4 h-4" />
            Export All
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">24</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">6</p>
              <p className="text-sm text-muted-foreground">This Month</p>
            </div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">+25%</p>
              <p className="text-sm text-muted-foreground">vs Last Month</p>
            </div>
          </div>
        </div>

        {/* Report List */}
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
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button className="w-full py-3 border-t border-border text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardReports;
