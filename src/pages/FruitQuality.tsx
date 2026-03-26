import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Apple, AlertCircle, Star, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeFruit, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { sendNotification } from "@/services/notificationService";
import { incrementAnalysis } from "@/services/analysisStats";
import AnalysisUploadCard from "@/components/AnalysisUploadCard";
import AnalysisResultCard, { ResultItem, ConfidenceBar, ErrorResult, StaggerItem } from "@/components/AnalysisResultCard";

const FruitQuality = () => {
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
      const data = await analyzeFruit(userId, file);
      setResult(data);
      sendNotification({ title: "Fruit Quality Analyzed 🍎", description: `Quality: ${data?.quality || data?.prediction || "Completed"}`, type: "success" });
      incrementAnalysis("fruit_quality");
    } catch { toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" }); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title={t("fruitQuality.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <AnalysisUploadCard
          icon={Apple}
          gradient="from-rose-500 to-pink-600"
          preview={preview}
          loading={loading}
          hasFile={!!file}
          onFileChange={handleFile}
          onAnalyze={handleAnalyze}
        />

        <AnimatePresence mode="wait">
          {result && (() => {
            if (result.detail || result.status === "Rejected")
              return <ErrorResult key="err" title={t("fruitQuality.error")} message={result.detail || result.message || "Request rejected"} />;

            if (result.status === "low_confidence")
              return <ErrorResult key="low" title={t("fruitQuality.lowConfidence")} message={result.message || ""} />;

            const grade = result.quality_grade || result.quality || result.grade;
            const gradeDescription = result.grade_description || result.description;
            const ripeness = result.ripeness_level || result.ripeness;
            const defect = result.defect_detection || result.defects;
            const confidence = result.confidence;
            const confidenceNum = confidence ? (typeof confidence === 'number' ? confidence * 100 : parseFloat(String(confidence).replace('%', ''))) : null;
            const isLow = grade && (grade.toLowerCase().includes('c') || grade.toLowerCase().includes('low'));
            const variant = isLow ? "destructive" as const : "primary" as const;

            return (
              <AnalysisResultCard key="res" title={t("fruitQuality.results")} statusColor={variant}>
                {grade && (
                  <StaggerItem>
                    <ResultItem
                      icon={<Star className={`w-6 h-6 ${isLow ? 'text-destructive' : 'text-primary'}`} />}
                      label={t("fruitQuality.qualityGrade")}
                      value={`${grade}${gradeDescription ? ` — ${gradeDescription}` : ''}`}
                      variant={variant}
                      large
                    />
                  </StaggerItem>
                )}
                {ripeness && (
                  <StaggerItem>
                    <ResultItem icon={<Apple className="w-5 h-5 text-primary" />} label={t("fruitQuality.ripenessLevel")} value={ripeness} />
                  </StaggerItem>
                )}
                {defect && (
                  <StaggerItem>
                    <ResultItem icon={<AlertCircle className="w-5 h-5 text-amber-600" />} label={t("fruitQuality.defectDetection")} value={defect} variant="warning" />
                  </StaggerItem>
                )}
                {confidenceNum != null && !isNaN(confidenceNum) && (
                  <StaggerItem><ConfidenceBar value={confidenceNum} label={t("fruitQuality.confidence")} /></StaggerItem>
                )}
                {!grade && !ripeness && !defect && (
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

export default FruitQuality;
