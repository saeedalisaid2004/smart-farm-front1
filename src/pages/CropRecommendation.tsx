import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Sprout, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { recommendCrop, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { sendNotification } from "@/services/notificationService";
import { incrementAnalysis } from "@/services/analysisStats";

const CropRecommendation = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [soil, setSoil] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!temperature || !humidity || !rainfall || !soil) {
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
      const data = await recommendCrop(userId, {
        temperature: parseFloat(temperature),
        humidity: parseFloat(humidity),
        rainfall: parseFloat(rainfall),
        soil,
      });
      setResult(data);
      sendNotification({
        title: "Crop Recommendation Ready 🌾",
        description: `Recommended: ${data?.recommended_crop || data?.prediction || "Available"}`,
        type: "success",
      });
      incrementAnalysis("crop_recommendation");
    } catch {
      toast({ variant: "destructive", title: "Failed", description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("crop.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-card"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("crop.envParams")}</h2>
              <p className="text-sm text-muted-foreground">Enter environmental conditions</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.temperature")}</Label>
              <Input placeholder="e.g., 25" type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-colors" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.humidity")}</Label>
              <Input placeholder="e.g., 65" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-colors" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.rainfall")}</Label>
              <Input placeholder="e.g., 120" type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-colors" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.soilType")}</Label>
              <Select value={soil} onValueChange={setSoil}>
                <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border px-4">
                  <SelectValue placeholder={t("crop.selectSoil")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clay">{t("crop.clay")}</SelectItem>
                  <SelectItem value="Sandy">{t("crop.sandy")}</SelectItem>
                  <SelectItem value="Loamy">{t("crop.loamy")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full rounded-xl h-12 text-sm font-semibold shadow-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sprout className="w-4 h-4 mr-2" />}
            {loading ? "Processing..." : t("crop.recommend")}
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
                if (result.detail) {
                  const detailMsg = typeof result.detail === 'string'
                    ? result.detail
                    : Array.isArray(result.detail)
                      ? result.detail.map((d: any) => d.msg || JSON.stringify(d)).join(', ')
                      : JSON.stringify(result.detail);
                  return (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-destructive text-sm">{t("crop.error")}</p>
                        <p className="text-sm text-muted-foreground mt-1" dir="auto">{detailMsg}</p>
                      </div>
                    </div>
                  );
                }

                const crop = result.recommendations?.primary || result.recommended_crop || result.prediction || result.predicted_class;
                const yieldLevel = result.expected_yield || result.yield_level;
                const description = result.description || result.recommendation || result.summary;

                const getYieldStyle = (level: string) => {
                  const l = level.toLowerCase();
                  if (l === 'high') return 'text-primary';
                  if (l === 'medium') return 'text-warning';
                  return 'text-destructive';
                };

                return (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <h3 className="text-lg font-semibold text-foreground">{t("crop.resultTitle")}</h3>
                    </div>

                    {crop && (
                      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shrink-0">
                          <Sprout className="w-7 h-7 text-white" />
                        </div>
                        <div>
                           <p className="text-xs text-muted-foreground mb-0.5">{t("crop.recommendedCrop")}</p>
                           <p className="text-2xl font-bold text-foreground capitalize" dir="auto">{crop}</p>
                        </div>
                      </div>
                    )}

                    {yieldLevel && (
                      <div className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                           <p className="text-xs text-muted-foreground">{t("crop.yieldLevel")}</p>
                           <p className={`font-bold ${getYieldStyle(yieldLevel)}`} dir="auto">{yieldLevel}</p>
                        </div>
                      </div>
                    )}

                    {description && (
                      <div className="bg-gradient-to-br from-secondary/60 to-secondary/30 border border-border rounded-2xl p-6">
                         <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{t("crop.details")}</p>
                         <p className="text-base text-foreground leading-7 font-medium" dir="auto" style={{ lineHeight: 1.9 }}>{description}</p>
                      </div>
                    )}

                    {!crop && (
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

export default CropRecommendation;
