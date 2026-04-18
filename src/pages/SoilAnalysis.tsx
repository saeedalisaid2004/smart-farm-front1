import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FlaskConical, Loader2, Droplets, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeSoil, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

import { incrementAnalysis } from "@/services/analysisStats";
import AnalysisResultCard, { ResultItem, ErrorResult, StaggerItem } from "@/components/AnalysisResultCard";
import { containsArabic, stripArabic } from "@/lib/textLang";

const translateRecommendation = (text: string, lang: string): string => {
  if (!text) return text;
  // EN UI: strip Arabic words/parens to keep only English
  if (lang !== "ar") {
    if (containsArabic(text)) {
      const cleaned = stripArabic(text);
      return cleaned || text;
    }
    return text;
  }
  // AR UI: try to translate english phrases
  const npkMatch = text.match(/Based on your soil's NPK \(([^)]+)\), it is classified as (\w+)/i);
  if (npkMatch) {
    const soilNames: Record<string, string> = { sandy: "رملية", loamy: "طينية رملية", clay: "طينية", silty: "طميية", peaty: "خثية", chalky: "كلسية", saline: "ملحية" };
    return `بناءً على قيم NPK للتربة (${npkMatch[1]})، تم تصنيفها كتربة ${soilNames[npkMatch[2].toLowerCase()] || npkMatch[2]}.`;
  }
  return text.replace(/Based on your soil/gi, "بناءً على تربتك").replace(/it is classified as/gi, "تم تصنيفها كـ");
};

const SoilAnalysis = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [ph, setPh] = useState("");
  const [moisture, setMoisture] = useState("");
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!ph || !moisture || !n || !p || !k) { toast({ variant: "destructive", title: "Please fill all fields" }); return; }
    const userId = getExternalUserId();
    if (!userId) { toast({ variant: "destructive", title: "Please login first" }); return; }
    setLoading(true);
    try {
      const data = await analyzeSoil(userId, { ph: parseFloat(ph), moisture: parseFloat(moisture), n: parseFloat(n), p: parseFloat(p), k: parseFloat(k) });
      setResult(data);
      const nested = data?.["Analysis Result"] || data?.result || data;
      const soilType = nested?.["Soil Type"] || nested?.detected_soil_type || data?.soil_type || data?.prediction || "Analyzed";
      
      incrementAnalysis("soil_analysis");
    } catch { toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" }); }
    finally { setLoading(false); }
  };

  const inputFields = [
    { label: t("soil.ph"), value: ph, setter: setPh, placeholder: "e.g., 6.5", step: "0.1" },
    { label: t("soil.moisture"), value: moisture, setter: setMoisture, placeholder: "e.g., 45" },
    { label: t("soil.nitrogen"), value: n, setter: setN, placeholder: "e.g., 20" },
    { label: t("soil.phosphorus"), value: p, setter: setP, placeholder: "e.g., 30" },
    { label: t("soil.potassium"), value: k, setter: setK, placeholder: "e.g., 25" },
  ];

  return (
    <DashboardLayout title={t("soil.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-card group/card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 opacity-[0.03] group-hover/card:opacity-[0.06] transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
                  <FlaskConical className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("soil.manualInput")}</h2>
                <p className="text-sm text-muted-foreground">{t("soil.inputDesc")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {inputFields.map((field, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className={i === 0 ? "sm:col-span-2" : ""}
                >
                  <Label className="text-foreground mb-2 block text-sm font-medium">{field.label}</Label>
                  <Input
                    placeholder={field.placeholder}
                    type="number"
                    step={field.step || "1"}
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-all focus:shadow-sm focus:shadow-primary/10"
                  />
                </motion.div>
              ))}
            </div>

            <Button className="w-full rounded-xl h-12 text-sm font-semibold shadow-primary hover:shadow-glow transition-all duration-300" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FlaskConical className="w-4 h-4 mr-2" />}
              {loading ? t("soil.analyzing") : t("soil.analyze")}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {result && (() => {
            if (result.detail || result.status === "Rejected")
              return <ErrorResult key="err" title={t("soil.error")} message={result.detail || result.message || "Request rejected"} />;

            const nested = result["Analysis Result"] || result.result || result;
            const soilTypeRaw = nested["Soil Type"] || nested.detected_soil_type || result.soil_type || result.predicted_class || result.prediction;
            const fertilityRaw = nested["Fertility Level"] || nested["Fertility"] || nested.fertility_level || result.fertility_level || result.fertility;
            const recommendation = nested["Recommendation"] || result.recommendation || result.description || nested.message;

            const soilTypeMap: Record<string, string> = { loamy: t("soil.types.loamy"), sandy: t("soil.types.sandy"), clay: t("soil.types.clay"), silty: t("soil.types.silty"), peaty: t("soil.types.peaty"), chalky: t("soil.types.chalky"), saline: t("soil.types.saline") };
            const fertilityMap: Record<string, string> = { high: t("soil.fertility.high"), medium: t("soil.fertility.medium"), low: t("soil.fertility.low") };
            const cleanLangVal = (v: string | undefined) => {
              if (!v) return v;
              if (language !== "ar" && containsArabic(v)) return stripArabic(v) || v;
              return v;
            };
            const soilType = soilTypeRaw ? cleanLangVal(soilTypeMap[soilTypeRaw.toLowerCase()] || soilTypeRaw) : undefined;
            const fertility = fertilityRaw ? cleanLangVal(fertilityMap[fertilityRaw.toLowerCase()] || fertilityRaw) : undefined;
            let fertVariant: "primary" | "warning" | "destructive" | "default" = "default";
            if (fertilityRaw) {
              const fl = fertilityRaw.toLowerCase();
              fertVariant = fl === 'high' ? 'primary' : fl === 'medium' ? 'warning' : 'destructive';
            }

            return (
              <AnalysisResultCard key="res" title={t("soil.resultTitle")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {soilType && (
                    <StaggerItem>
                      <ResultItem icon={<FlaskConical className="w-5 h-5 text-primary" />} label={t("soil.soilType")} value={soilType} variant="primary" />
                    </StaggerItem>
                  )}
                  {fertility && (
                    <StaggerItem>
                      <ResultItem icon={<Droplets className={`w-5 h-5 ${fertVariant === 'primary' ? 'text-primary' : fertVariant === 'warning' ? 'text-amber-600' : 'text-destructive'}`} />} label={t("soil.fertilityLevel")} value={fertility} variant={fertVariant} />
                    </StaggerItem>
                  )}
                </div>
                {recommendation && (
                  <StaggerItem>
                    <div className="bg-secondary/40 border border-border rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Sprout className="w-4 h-4 text-primary" />
                        <p className="text-xs font-medium text-muted-foreground">{t("soil.recommendation")}</p>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed" dir="auto">{translateRecommendation(recommendation, language)}</p>
                    </div>
                  </StaggerItem>
                )}
                {!soilType && !fertility && (
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

export default SoilAnalysis;
