import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Sprout, Loader2, AlertCircle, Droplets, Leaf, Bug, CloudSun, MapPin } from "lucide-react";
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

const soilMap: Record<string, string> = {
  clay: "طينية",
  sandy: "رملية",
  loamy: "طميية",
};

const CropRecommendation = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [cityName, setCityName] = useState("");
  const [soil, setSoil] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!cityName || !soil) {
      toast({ variant: "destructive", title: t("crop.error"), description: language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields" });
      return;
    }
    const userId = getExternalUserId();
    if (!userId) {
      toast({ variant: "destructive", title: language === "ar" ? "سجل دخول أولاً" : "Please login first" });
      return;
    }
    setLoading(true);
    try {
      const apiSoil = soilMap[soil] || soil;
      const data = await recommendCrop(userId, { city_name: cityName, soil: apiSoil });
      setResult(data);
      const cropName = data?.recommendation?.primary || "";
      sendNotification({
        title: language === "ar" ? "توصية المحاصيل جاهزة 🌾" : "Crop Recommendation Ready 🌾",
        description: cropName || "Available",
        type: "success",
      });
      incrementAnalysis("crop_recommendation");
    } catch {
      toast({ variant: "destructive", title: t("crop.error"), description: language === "ar" ? "حاول مرة أخرى" : "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("crop.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-card border border-border rounded-2xl p-5 sm:p-8 shadow-card">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t("crop.inputParams")}</h2>
              <p className="text-sm text-muted-foreground">{language === "ar" ? "أدخل اسم المدينة ونوع التربة" : "Enter city name and soil type"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.cityName")}</Label>
              <Input placeholder={t("crop.cityPlaceholder")} value={cityName} onChange={(e) => setCityName(e.target.value)} className="rounded-xl h-12 bg-secondary/50 border-border focus:border-primary px-4 transition-colors" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.soilType")}</Label>
              <Select value={soil} onValueChange={setSoil}>
                <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border px-4">
                  <SelectValue placeholder={t("crop.selectSoil")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">{t("crop.clay")}</SelectItem>
                  <SelectItem value="sandy">{t("crop.sandy")}</SelectItem>
                  <SelectItem value="loamy">{t("crop.loamy")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full rounded-xl h-12 text-sm font-semibold shadow-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sprout className="w-4 h-4 mr-2" />}
            {loading ? (language === "ar" ? "جاري المعالجة..." : "Processing...") : t("crop.recommend")}
          </Button>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="space-y-4">
              {result.detail ? (
                <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  </div>
                  <div>
                    <p className="font-medium text-destructive text-sm">{t("crop.error")}</p>
                    <p className="text-sm text-muted-foreground mt-1" dir="auto">
                      {typeof result.detail === "string" ? result.detail : Array.isArray(result.detail) ? result.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ") : JSON.stringify(result.detail)}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Crop Recommendations */}
                  {result.recommendation && (
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{t("crop.resultTitle")}</h3>
                      </div>

                      {/* City info */}
                      {result.city_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{result.city_name}</span>
                        </div>
                      )}

                      {/* Crops grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { key: "primary", label: t("crop.recommendedCrop"), color: "from-amber-500 to-orange-600" },
                          { key: "secondary", label: t("crop.secondaryCrop"), color: "from-emerald-500 to-green-600" },
                          { key: "tertiary", label: t("crop.tertiaryCrop"), color: "from-blue-500 to-cyan-600" },
                        ].map(({ key, label, color }) => {
                          const crop = result.recommendation[key];
                          if (!crop) return null;
                          return (
                            <div key={key} className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center">
                              <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-2`}>
                                <Sprout className="w-5 h-5 text-white" />
                              </div>
                              <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                              <p className="text-base font-bold text-foreground" dir="auto">{crop}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Description */}
                      {result.recommendation.description && (
                        <div className="bg-gradient-to-br from-secondary/60 to-secondary/30 border border-border rounded-2xl p-5">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{t("crop.details")}</p>
                          <p className="text-sm text-foreground leading-7 font-medium" dir="auto">{result.recommendation.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* General Warning */}
                  {result.general_warning && (
                    <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-card">
                      <CloudSun className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("crop.generalWarning")}</p>
                        <p className="text-sm font-semibold text-foreground" dir="auto">{result.general_warning}</p>
                      </div>
                    </div>
                  )}

                  {/* Daily Guide */}
                  {result.expert_daily_guide && result.expert_daily_guide.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <h3 className="text-lg font-semibold text-foreground">{t("crop.dailyGuide")}</h3>
                      </div>
                      <div className="space-y-3">
                        {result.expert_daily_guide.map((day: any, i: number) => (
                          <div key={i} className="bg-secondary/40 border border-border rounded-xl p-4 space-y-2">
                            <p className="text-sm font-bold text-foreground">{day["التاريخ"] || day.date}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-2">
                                <CloudSun className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{t("crop.weather")}:</span>
                                <span className="text-foreground font-medium" dir="auto">{day["الطقس"] || day.weather}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Droplets className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{t("crop.irrigation")}:</span>
                                <span className="text-foreground font-medium" dir="auto">{day["نصيحة الري"] || day.irrigation}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Leaf className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{t("crop.fertilizer")}:</span>
                                <span className="text-foreground font-medium" dir="auto">{day["نصيحة السماد"] || day.fertilizer}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Bug className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{t("crop.diseaseAlert")}:</span>
                                <span className="text-foreground font-medium" dir="auto">{day["تنبيه الأمراض"] || day.disease_alert}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default CropRecommendation;
