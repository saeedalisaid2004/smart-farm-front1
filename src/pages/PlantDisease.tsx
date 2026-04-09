import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, AlertCircle, CheckCircle2, Shield, FileText, MessageCircle } from "lucide-react";
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
      const analysis = data?.analysis || data;
      const condition = analysis?.condition || analysis?.disease_en || analysis?.prediction || "";
      const isHealthy = condition.toLowerCase().includes("healthy");
      sendNotification({ title: isHealthy ? "Plant is Healthy ✅" : "Disease Detected ⚠️", description: `Plant Disease Analysis: ${analysis?.disease_en || condition || "Completed"}`, type: isHealthy ? "success" : "warning" });
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

            const a = result.analysis || result;
            const condition = a.condition || a.disease_en || a.disease || a.prediction || a.label;
            const isHealthy = condition && (condition.toLowerCase().includes('healthy') || condition.toLowerCase().includes('سليم'));
            const confidenceRaw = a.confidence;
            const confidenceNum = confidenceRaw ? parseFloat(String(confidenceRaw)) : null;
            const variant = isHealthy ? "primary" as const : "destructive" as const;
            const cropNameEn = a.crop_type_en || "";
            const cropNameAr = a.crop_type_ar || "";
            const cropDisplay = cropNameEn && cropNameAr ? `${cropNameEn} (${cropNameAr})` : cropNameEn || cropNameAr;
            const diseaseEn = a.disease_en || "";
            const diseaseAr = a.disease_ar || "";
            const diseaseDisplay = isHealthy
              ? (diseaseEn || condition)
              : (diseaseEn && diseaseAr ? `${diseaseEn} (${diseaseAr})` : diseaseEn || diseaseAr || condition);
            const treatments = a.suggested_treatments?.length ? a.suggested_treatments : (a.treatment ? [a.treatment] : []);

            return (
              <AnalysisResultCard key="res" title="Analysis Result" statusColor={variant}>
                {cropDisplay && (
                  <StaggerItem>
                    <ResultItem
                      icon={<Leaf className="w-6 h-6 text-primary" />}
                      label="Crop"
                      value={cropDisplay}
                      variant="primary"
                      large
                    />
                  </StaggerItem>
                )}
                {condition && (
                  <StaggerItem>
                    <ResultItem
                      icon={isHealthy ? <CheckCircle2 className="w-6 h-6 text-primary" /> : <AlertCircle className="w-6 h-6 text-destructive" />}
                      label="Status"
                      value={diseaseDisplay}
                      variant={variant}
                      large
                    />
                  </StaggerItem>
                )}
                {confidenceNum != null && !isNaN(confidenceNum) && (
                  <StaggerItem><ConfidenceBar value={confidenceNum} /></StaggerItem>
                )}
                {a.message && (
                  <StaggerItem>
                    <ResultItem icon={<MessageCircle className="w-5 h-5 text-muted-foreground" />} label="Details" value={a.message} />
                  </StaggerItem>
                )}
                {treatments.length > 0 && (
                  <StaggerItem>
                    <ResultItem icon={<Shield className="w-5 h-5 text-primary" />} label="Treatment" value={treatments.join(" • ")} />
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
