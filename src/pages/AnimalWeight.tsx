import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Eye, AlertCircle, Weight, PawPrint, Camera, Info } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { estimateAnimalWeight, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";

import { incrementAnalysis } from "@/services/analysisStats";
import AnalysisUploadCard from "@/components/AnalysisUploadCard";
import AnalysisResultCard, { ResultItem, ConfidenceBar, ErrorResult, StaggerItem } from "@/components/AnalysisResultCard";

const AnimalWeight = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t, isRTL } = useLanguage();
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
      const data = await estimateAnimalWeight(userId, file);
      setResult(data);
      
      incrementAnalysis("animal_weight");
    } catch { toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" }); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title={t("animalWeight.title")}>
       <div className="max-w-2xl mx-auto space-y-6">
        {/* Tip Card */}
        <div className="relative overflow-hidden rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/10 via-destructive/5 to-secondary/30 p-4 shadow-sm">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-destructive/10 blur-2xl" />
          <div className="flex items-start gap-3" dir={isRTL ? "rtl" : "ltr"}>
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mt-0.5">
              <Camera className="w-5 h-5 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-destructive" />
                {isRTL ? "نصيحة للحصول على نتيجة دقيقة" : "Tip for accurate results"}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isRTL
                  ? "صوّر الحيوان من الجنب وهو واقف على أرض مستوية، على بُعد من 2 إلى 3 متر."
                  : "Photograph the animal from the side while standing on flat ground, from 2 to 3 meters away."}
              </p>
            </div>
          </div>
        </div>

        <AnalysisUploadCard
          icon={Eye}
          gradient="from-blue-500 to-indigo-600"
          preview={preview}
          loading={loading}
          hasFile={!!file}
          onFileChange={handleFile}
          onAnalyze={handleAnalyze}
        />

        <AnimatePresence mode="wait">
          {result && (() => {
            if (result.detail || result.status === "Rejected" || result.status === "Not Supported")
              return <ErrorResult key="err" title={result.status === "Not Supported" ? "Not Supported" : "Analysis Error"} message={result.message || result.detail || "Request rejected"} />;

            const animalName = isRTL
              ? result.animal_name_ar || result.animal_type || result.animal || result.class_name || result.label || result.animal_name_en
              : result.animal_name_en || result.animal_type || result.animal || result.class_name || result.label || result.animal_name_ar;
            const weightValue = result.estimated_weight || result.weight;
            const confidenceNum = result.confidence
              ? typeof result.confidence === 'number' ? result.confidence * 100 : parseFloat(String(result.confidence))
              : null;

            return (
              <AnalysisResultCard key="res" title="Estimation Result">
                <StaggerItem>
                  <ResultItem
                    icon={<Weight className="w-6 h-6 text-primary" />}
                    label="Estimated Weight"
                    value={weightValue ? `${String(weightValue).replace(/\s*kg\s*/gi, "")} kg` : "—"}
                    variant="primary"
                    large
                  />
                </StaggerItem>
                {animalName && (
                  <StaggerItem>
                    <ResultItem icon={<PawPrint className="w-5 h-5 text-primary" />} label="Animal Type" value={animalName} />
                  </StaggerItem>
                )}
                {confidenceNum != null && !isNaN(confidenceNum) && (
                  <StaggerItem><ConfidenceBar value={confidenceNum} /></StaggerItem>
                )}
                {!weightValue && !animalName && (
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

export default AnimalWeight;
