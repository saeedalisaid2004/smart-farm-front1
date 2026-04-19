import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, AlertCircle, CheckCircle2, Shield, FileText, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { detectPlantDisease, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";

import { incrementAnalysis } from "@/services/analysisStats";
import AnalysisUploadCard from "@/components/AnalysisUploadCard";
import AnalysisResultCard, { ResultItem, ConfidenceBar, ErrorResult, StaggerItem } from "@/components/AnalysisResultCard";
import { containsArabic, containsLatin, stripArabic, stripEnglish } from "@/lib/textLang";

const cleanByLang = (v: any, lang: string) => {
  if (typeof v !== "string" || !v) return v;
  if (lang === "ar") {
    if (containsArabic(v) && containsLatin(v)) return stripEnglish(v) || v;
    return v;
  }
  if (containsArabic(v)) return stripArabic(v) || v;
  return v;
};

const PlantDisease = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { t, language } = useLanguage();
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
      const data = await detectPlantDisease(userId, file, language);
      setResult(data);
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

            // API returns "arabic - english" or "english - arabic" in single fields
            const splitBilingual = (raw: string): { ar: string; en: string } => {
              if (!raw || typeof raw !== "string") return { ar: "", en: "" };
              const parts = raw.split(/\s+[-–—]\s+/).map(p => p.trim()).filter(Boolean);
              let ar = "", en = "";
              for (const p of parts) {
                if (containsArabic(p) && !ar) ar = stripEnglish(p) || p;
                else if (containsLatin(p) && !en) en = stripArabic(p).trim() || p;
              }
              if (!ar && !en) {
                if (containsArabic(raw)) ar = stripEnglish(raw) || raw;
                if (containsLatin(raw)) en = stripArabic(raw).trim() || raw;
              }
              return { ar, en };
            };
            const formatBi = (raw: string): string => {
              const { ar, en } = splitBilingual(raw);
              if (language === "ar") return ar && en ? `${ar} (${en})` : (ar || en);
              return en || ar;
            };

            const cropDisplay = formatBi(a.crop_type_ar || a.crop_type_en || a.crop_type || a.crop || "");
            const diseaseDisplay = formatBi(a.disease_name || a.disease_ar || a.disease_en || a.disease || condition || "");
            const messageDisplay = a.message || "";
            const treatmentsRaw: string[] = a.suggested_treatments?.length ? a.suggested_treatments : (a.treatment ? [a.treatment] : []);
            const treatments = treatmentsRaw.map(formatBi).filter(Boolean);

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
                {messageDisplay && (
                  <StaggerItem>
                    <ResultItem icon={<MessageCircle className="w-5 h-5 text-muted-foreground" />} label="Details" value={messageDisplay} />
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
