import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, AlertCircle, CheckCircle2, Shield } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { detectPlantDisease, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { sendNotification } from "@/services/notificationService";
import { incrementAnalysis } from "@/services/analysisStats";
import AnalysisUploadCard from "@/components/AnalysisUploadCard";
import AnalysisResultCard, { ResultItem, ConfidenceBar, ErrorResult, StaggerItem } from "@/components/AnalysisResultCard";

const PlantDisease = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!file) { toast({ variant: "destructive", title: t("common.chooseImage") }); return; }
    const userId = getExternalUserId();
    if (!userId) { toast({ variant: "destructive", title: "Please login first" }); return; }
    setLoading(true);
    try {
      const data = await detectPlantDisease(userId, file);
      setResult(data);
      const isHealthy = data?.prediction?.toLowerCase().includes("healthy");
      sendNotification({ title: isHealthy ? "Plant is Healthy ✅" : "Disease Detected ⚠️", description: `Plant Disease Analysis: ${data?.prediction || "Completed"}`, type: isHealthy ? "success" : "warning" });
      incrementAnalysis("plant_disease");
    } catch { toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" }); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title={t("plantDisease.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <AnalysisUploadCard
          icon={Leaf}
          gradient="from-emerald-500 to-green-600"
          preview={preview}
          loading={loading}
          hasFile={!!file}
          onFileChange={handleFile}
          onAnalyze={handleAnalyze}
        />

        <AnimatePresence mode="wait">
          {result && (() => {
            if (result.detail || result.status === "Rejected")
              return <ErrorResult key="err" title="Analysis Error" message={result.detail || result.message || "Request rejected"} />;

            const status = result.disease || result.prediction || result.status || result.label;
            const isHealthy = status && (status.toLowerCase().includes('healthy') || status.toLowerCase().includes('سليم'));
            const confidenceRaw = result.confidence;
            const confidenceNum = confidenceRaw ? (typeof confidenceRaw === 'number' ? confidenceRaw * 100 : parseFloat(String(confidenceRaw))) : null;
            const variant = isHealthy ? "primary" as const : "destructive" as const;

            return (
              <AnalysisResultCard key="res" title="Analysis Result" statusColor={variant}>
                {status && (
                  <StaggerItem>
                    <ResultItem
                      icon={isHealthy ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <AlertCircle className="w-6 h-6 text-destructive" />}
                      label="Status"
                      value={status}
                      variant={variant}
                      large
                    />
                  </StaggerItem>
                )}
                {confidenceNum != null && !isNaN(confidenceNum) && (
                  <StaggerItem><ConfidenceBar value={confidenceNum} /></StaggerItem>
                )}
                {result.treatment && (
                  <StaggerItem>
                    <ResultItem icon={<Shield className="w-5 h-5 text-primary" />} label="Treatment" value={result.treatment} />
                  </StaggerItem>
                )}
                {!status && (
                  <StaggerItem>
                    <pre className="text-xs text-muted-foreground bg-secondary rounded-xl p-4 overflow-auto max-h-60">{JSON.stringify(result, null, 2)}</pre>
                  </StaggerItem>
                )}
              </AnalysisResultCard>
            );
          })()}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default PlantDisease;
