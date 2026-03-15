import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const reports = [
  { id: 1, name: "Plant Disease Analysis Report", desc: "45 images analyzed, 3 diseases detected", date: "December 10, 2024", tags: ["AI Analysis", "Completed"],
    content: () => `Plant Disease Analysis Report\n================================\n\nDate: December 10, 2024\nStatus: Completed\n\nSUMMARY:\n- Total Images Analyzed: 45\n- Diseases Detected: 3\n- Healthy Plants: 42 (93.3%)\n\nDETECTED DISEASES:\n1. Tomato Early Blight (Alternaria solani)\n   - Affected plants: 2\n   - Confidence: 96.5%\n\n2. Apple Scab (Venturia inaequalis)\n   - Affected plants: 1\n   - Confidence: 92.1%\n\n3. Grape Black Rot (Guignardia bidwellii)\n   - Affected plants: 0\n   - Confidence: Detected in 1 sample\n\nRECOMMENDATIONS:\n- Apply fungicide treatment for Early Blight\n- Remove and destroy infected leaves\n- Monitor soil moisture levels` },
  { id: 2, name: "Livestock Weight Monitoring", desc: "156 animals tracked, avg weight: 425kg", date: "December 8, 2024", tags: ["Computer Vision", "Completed"],
    content: () => `Livestock Weight Monitoring Report\n===================================\n\nDate: December 8, 2024\nStatus: Completed\n\nSUMMARY:\n- Total Animals Tracked: 156\n- Average Weight: 425 kg\n- Weight Range: 310 kg - 580 kg\n\nWEIGHT DISTRIBUTION:\n- Underweight (< 350 kg): 12 animals (7.7%)\n- Normal (350-500 kg): 128 animals (82.1%)\n- Overweight (> 500 kg): 16 animals (10.3%)\n\nGROWTH ANALYSIS:\n- Average weight gain: +15 kg since last month\n- Growth rate: +3.7%\n- Health status: Excellent\n\nRECOMMENDATIONS:\n- Provide supplemental feed for underweight animals\n- Maintain current nutrition plan for normal weight group\n- Monitor exercise for overweight group` },
  { id: 3, name: "Crop Yield Forecast", desc: "Seasonal prediction for 12 crop varieties", date: "December 5, 2024", tags: ["ML Prediction", "Completed"],
    content: () => `Crop Yield Forecast Report\n===========================\n\nDate: December 5, 2024\nStatus: Completed\n\nSUMMARY:\n- Crop Varieties Analyzed: 12\n- Forecast Period: Next Season\n- Confidence Level: 88.5%\n\nTOP PERFORMING CROPS:\n1. Wheat - Predicted Yield: 4.2 tons/hectare\n2. Corn - Predicted Yield: 8.7 tons/hectare\n3. Soybean - Predicted Yield: 3.1 tons/hectare\n\nWEATHER IMPACT:\n- Expected rainfall: Normal to above normal\n- Temperature: Favorable for most crops\n- Risk Level: Low\n\nRECOMMENDATIONS:\n- Increase wheat planting by 15%\n- Maintain corn rotation schedule\n- Consider drought-resistant varieties as backup` },
  { id: 4, name: "Soil Quality Assessment", desc: "pH, moisture, and nutrient analysis", date: "December 1, 2024", tags: ["Soil Analysis", "Completed"],
    content: () => `Soil Quality Assessment Report\n==============================\n\nDate: December 1, 2024\nStatus: Completed\n\nSUMMARY:\n- Fields Analyzed: 8\n- Soil Health Score: 78/100 (Good)\n\nPH LEVELS:\n- Average pH: 6.8 (Slightly acidic, optimal range)\n- Field 1-4: pH 6.5-7.0 (Optimal)\n- Field 5-8: pH 6.2-6.5 (Acceptable)\n\nNUTRIENT LEVELS:\n- Nitrogen (N): Medium (45 ppm)\n- Phosphorus (P): High (32 ppm)\n- Potassium (K): Medium (180 ppm)\n\nMOISTURE CONTENT:\n- Average: 22% (Optimal)\n- Field variability: ±4%\n\nRECOMMENDATIONS:\n- Apply nitrogen-rich fertilizer to fields 5-8\n- Maintain current phosphorus levels\n- Monitor moisture during dry spells` },
];

const DashboardReports = () => {
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
              <button
                onClick={() => handleDownload(report)}
                className="w-full py-3 border-t border-border text-sm text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
              >
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
