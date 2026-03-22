import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FlaskConical, Loader2, AlertCircle, Droplets, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeSoil, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const SoilAnalysis = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [ph, setPh] = useState("");
  const [moisture, setMoisture] = useState("");
  const [n, setN] = useState("");
  const [p, setP] = useState("");
  const [k, setK] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!ph || !moisture || !n || !p || !k) {
      toast({ variant: "destructive", title: "Please fill all fields" });
      return;
    }
    const userId = getExternalUserId();
    if (!userId) {
      toast({ variant: "destructive", title: "Please login first" });
      return;
    }
    setLoading(true);
    try {
      const data = await analyzeSoil(userId, {
        ph: parseFloat(ph),
        moisture: parseFloat(moisture),
        n: parseFloat(n),
        p: parseFloat(p),
        k: parseFloat(k),
      });
      setResult(data);
    } catch {
      toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" });
    } finally {
      setLoading(false);
    }
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-card"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("soil.manualInput")}</h2>
              <p className="text-sm text-muted-foreground">Enter soil parameters for analysis</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {inputFields.map((field, i) => (
              <div key={i} className={i === 0 ? "sm:col-span-2" : ""}>
                <Label className="text-foreground mb-2 block text-sm font-medium">{field.label}</Label>
                <Input
                  placeholder={field.placeholder}
                  type="number"
                  step={field.step || "1"}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-colors"
                />
              </div>
            ))}
          </div>

          <Button className="w-full rounded-xl h-12 text-sm font-semibold shadow-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FlaskConical className="w-4 h-4 mr-2" />}
            {loading ? "Analyzing..." : t("soil.analyze")}
          </Button>
        </motion.div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {(() => {
                if (result.detail || result.status === "Rejected") {
                  const msg = result.detail || result.message || "Request rejected";
                  return (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-destructive text-sm">Analysis Error</p>
                        <p className="text-sm text-muted-foreground mt-1">{msg}</p>
                      </div>
                    </div>
                  );
                }

                const nested = result.result || {};
                const soilType = result.soil_type || nested.detected_soil_type || result.predicted_class || result.prediction;
                const fertility = result.fertility_level || nested.fertility_level || result.fertility;
                const recommendation = result.recommendation || result.description || nested.message;

                const getFertilityStyle = (level: string) => {
                  const l = level.toLowerCase();
                  if (l === 'high') return { bg: 'bg-primary/5 border-primary/20', text: 'text-primary', icon: 'bg-primary/10' };
                  if (l === 'medium') return { bg: 'bg-warning/5 border-warning/20', text: 'text-warning', icon: 'bg-warning/10' };
                  return { bg: 'bg-destructive/5 border-destructive/20', text: 'text-destructive', icon: 'bg-destructive/10' };
                };

                return (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <h3 className="text-lg font-semibold text-foreground">Analysis Result</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {soilType && (
                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FlaskConical className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-xs text-muted-foreground">Soil Type</span>
                          </div>
                          <p className="text-xl font-bold text-foreground capitalize">{soilType}</p>
                        </div>
                      )}

                      {fertility && (() => {
                        const style = getFertilityStyle(fertility);
                        return (
                          <div className={`border rounded-2xl p-5 ${style.bg}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${style.icon}`}>
                                <Droplets className={`w-4 h-4 ${style.text}`} />
                              </div>
                              <span className="text-xs text-muted-foreground">Fertility Level</span>
                            </div>
                            <p className={`text-xl font-bold capitalize ${style.text}`}>{fertility}</p>
                          </div>
                        );
                      })()}
                    </div>

                    {recommendation && (
                      <div className="bg-secondary/40 border border-border rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Sprout className="w-4 h-4 text-primary" />
                          <p className="text-xs font-medium text-muted-foreground">Recommendation</p>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{recommendation}</p>
                      </div>
                    )}

                    {!soilType && !fertility && (
                      <pre className="text-xs text-muted-foreground bg-secondary rounded-xl p-4 overflow-auto max-h-60">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default SoilAnalysis;
