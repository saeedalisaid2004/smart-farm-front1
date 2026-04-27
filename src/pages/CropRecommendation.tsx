import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Sprout, Loader2, AlertCircle, Droplets, Leaf, Bug, CloudSun, MapPin, Apple, Wheat, Carrot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { recommendCrop, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

import { incrementAnalysis } from "@/services/analysisStats";
import AnalysisResultCard, { ErrorResult, StaggerItem } from "@/components/AnalysisResultCard";
import { containsArabic, containsLatin, stripArabic, stripEnglish } from "@/lib/textLang";

const hasMeaningfulText = (s: string) => /[A-Za-z\u0600-\u06FF]/.test(s);

// Arabic → English dictionary for crop names, weather, advice values
const arToEn: Record<string, string> = {
  // Vegetables
  "الطماطم": "Tomato", "الخيار": "Cucumber", "الفلفل": "Pepper", "البطاطس": "Potato",
  "البصل": "Onion", "الثوم": "Garlic", "الباذنجان": "Eggplant", "الكوسة": "Zucchini",
  "الجزر": "Carrot", "الخس": "Lettuce", "الملفوف": "Cabbage", "القرنبيط": "Cauliflower",
  "البامية": "Okra", "الفاصوليا": "Green Beans", "الفجل": "Radish", "السبانخ": "Spinach",
  // Fruits
  "الجوافة": "Guava", "الزيتون": "Olive", "المانجو": "Mango", "البرتقال": "Orange",
  "الليمون": "Lemon", "العنب": "Grapes", "التين": "Fig", "الرمان": "Pomegranate",
  "البطيخ": "Watermelon", "الشمام": "Cantaloupe", "الفراولة": "Strawberry", "التفاح": "Apple",
  "الموز": "Banana", "المشمش": "Apricot", "الخوخ": "Peach", "البلح": "Dates",
  // Field crops
  "عباد الشمس": "Sunflower", "السمسم": "Sesame", "القمح": "Wheat", "الذرة": "Corn",
  "الأرز": "Rice", "الشعير": "Barley", "القطن": "Cotton", "الفول": "Beans",
  "العدس": "Lentils", "البرسيم": "Clover", "قصب السكر": "Sugarcane", "بنجر السكر": "Sugar Beet",
  // Categories
  "الخضروات": "Vegetables", "الفواكه": "Fruits", "المحاصيل الحقلية": "Field Crops",
  // Common phrases
  "تجهيز الأرض": "Land Preparation",
  // Weather
  "سماء صافية": "Clear sky", "غائم جزئياً": "Partly cloudy", "غائم": "Cloudy",
  "ممطر": "Rainy", "عاصف": "Stormy", "ضباب": "Foggy", "حار": "Hot", "بارد": "Cold",
  // Irrigation
  "ري معتدل": "Moderate Irrigation", "ري خفيف": "Light Irrigation",
  "ري كثيف": "Heavy Irrigation", "لا حاجة للري": "No Irrigation Needed",
  // Fertilizer
  "مناسب للتسميد": "Suitable for Fertilizing", "غير مناسب للتسميد": "Not Suitable for Fertilizing",
  "تسميد خفيف": "Light Fertilizing", "تسميد كثيف": "Heavy Fertilizing",
  // Disease
  "حالة مستقرة": "Stable Condition", "خطر منخفض": "Low Risk",
  "خطر متوسط": "Medium Risk", "خطر عالي": "High Risk", "تنبيه": "Alert",
  // General
  "الجو مستقر": "Weather is stable", "الجو غير مستقر": "Weather is unstable",
};

const translateAr = (s: string): string => {
  let out = s;
  Object.entries(arToEn).forEach(([ar, en]) => {
    out = out.split(ar).join(en);
  });
  return out;
};

const cleanByLang = (v: any, lang: string) => {
  if (typeof v !== "string" || !v) return v;
  if (lang === "ar") {
    if (containsArabic(v) && containsLatin(v)) {
      const stripped = stripEnglish(v);
      return stripped && hasMeaningfulText(stripped) ? stripped : v;
    }
    return v;
  }
  // English UI: translate Arabic words first, then strip remaining Arabic
  let translated = translateAr(v);
  if (containsArabic(translated)) {
    const stripped = stripArabic(translated);
    translated = stripped && hasMeaningfulText(stripped) ? stripped : translated;
  }
  return translated;
};

const soilMap: Record<string, string> = { clay: "طينية", sandy: "رملية", loamy: "طميية" };


const CropRecommendation = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [cityName, setCityName] = useState("");
  const [soil, setSoil] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!cityName || !soil) { toast({ variant: "destructive", title: t("crop.error"), description: language === "ar" ? "يرجى ملء جميع الحقول" : "Please fill all fields" }); return; }
    const userId = getExternalUserId();
    if (!userId) { toast({ variant: "destructive", title: language === "ar" ? "سجل دخول أولاً" : "Please login first" }); return; }
    setLoading(true);
    try {
      const data = await recommendCrop(userId, { city_name: cityName, soil: soilMap[soil] || soil }, language);
      setResult(data);
      
      incrementAnalysis("crop_recommendation");
    } catch { toast({ variant: "destructive", title: t("crop.error"), description: language === "ar" ? "حاول مرة أخرى" : "Please try again" }); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title={t("crop.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-card group/card"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 opacity-[0.03] group-hover/card:opacity-[0.06] transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl blur-xl opacity-30 animate-pulse" />
                <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Sprout className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t("crop.inputParams")}</h2>
                <p className="text-sm text-muted-foreground">{language === "ar" ? "أدخل اسم المدينة ونوع التربة" : "Enter city name and soil type"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.4 }}>
                <Label className="text-foreground mb-2 block text-sm font-medium">{t("crop.cityName")}</Label>
                <Select value={cityName} onValueChange={setCityName}>
                  <SelectTrigger className="rounded-xl h-12 bg-secondary/50 border-border px-4">
                    <SelectValue placeholder={t("crop.cityPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {[
                      { en: "Cairo", ar: "القاهرة" },
                      { en: "Giza", ar: "الجيزة" },
                      { en: "Alexandria", ar: "الإسكندرية" },
                      { en: "Banha", ar: "القليوبية" },
                      { en: "Sharqia", ar: "الشرقية" },
                      { en: "Mansoura", ar: "الدقهلية" },
                      { en: "Gharbia", ar: "الغربية" },
                      { en: "Shibin El Kom", ar: "المنوفية" },
                      { en: "Kafr El Sheikh", ar: "كفر الشيخ" },
                      { en: "Damanhur", ar: "البحيرة" },
                      { en: "Damietta", ar: "دمياط" },
                      { en: "Port Said", ar: "بورسعيد" },
                      { en: "Ismailia", ar: "الإسماعيلية" },
                      { en: "Suez", ar: "السويس" },
                      { en: "Arish", ar: "شمال سيناء" },
                      { en: "South Sinai", ar: "جنوب سيناء" },
                      { en: "Beni Suef", ar: "بني سويف" },
                      { en: "Faiyum", ar: "الفيوم" },
                      { en: "Minya", ar: "المنيا" },
                      { en: "Asyut", ar: "أسيوط" },
                      { en: "Sohag", ar: "سوهاج" },
                      { en: "Qena", ar: "قنا" },
                      { en: "Luxor", ar: "الأقصر" },
                      { en: "Aswan", ar: "أسوان" },
                      { en: "Hurghada", ar: "البحر الأحمر" },
                      { en: "Kharga", ar: "الوادي الجديد" },
                      { en: "Marsa Matruh", ar: "مطروح" },
                    ].map((c) => (
                      <SelectItem key={c.en} value={c.en}>
                        {language === "ar" ? c.ar : c.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06, duration: 0.4 }}>
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
              </motion.div>
            </div>

            <Button className="w-full rounded-xl h-12 text-sm font-semibold shadow-primary hover:shadow-glow transition-all duration-300" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sprout className="w-4 h-4 mr-2" />}
              {loading ? (language === "ar" ? "جاري المعالجة..." : "Processing...") : t("crop.recommend")}
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {result && (() => {
            if (result.detail)
              return <ErrorResult key="err" title={t("crop.error")} message={typeof result.detail === "string" ? result.detail : Array.isArray(result.detail) ? result.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ") : JSON.stringify(result.detail)} />;

            return (
              <div key="res" className="space-y-4">
                {result.recommendation && (
                  <AnalysisResultCard title={t("crop.resultTitle")}>
                    {result.city_name && (
                      <StaggerItem>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{result.city_name}</span>
                        </div>
                      </StaggerItem>
                    )}
                    {(() => {
                      const rec = result.recommendation;
                      const categories = [
                        { key: "vegetables", fallbackTitle: t("crop.vegetables"), color: "from-emerald-500 to-green-600", icon: Carrot },
                        { key: "fruits", fallbackTitle: t("crop.fruits"), color: "from-red-500 to-orange-500", icon: Apple },
                        { key: "field_crops", fallbackTitle: t("crop.fieldCrops"), color: "from-amber-500 to-orange-600", icon: Wheat },
                      ];
                      const hasNewFormat = categories.some((c) => rec[c.key]);

                      if (hasNewFormat) {
                        return (
                          <div className="space-y-4">
                            {categories.map(({ key, fallbackTitle, color, icon: Ic }) => {
                              const cat = rec[key];
                              if (!cat) return null;
                              const items: string[] = Array.isArray(cat.items) ? cat.items : Array.isArray(cat) ? cat : [];
                              if (!items.length) return null;
                              const titleRaw = cat.title || fallbackTitle;
                              const title = cleanByLang(titleRaw, language) || fallbackTitle;
                              return (
                                <StaggerItem key={key}>
                                  <div className="bg-secondary/40 border border-border rounded-2xl p-4">
                                    <div className="flex items-center gap-2.5 mb-3">
                                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
                                        <Ic className="w-4.5 h-4.5 text-white" />
                                      </div>
                                      <p className="text-sm font-semibold text-foreground" dir="auto">{title}</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                      {items.map((it, idx) => {
                                        const display = cleanByLang(it, language) || it;
                                        return (
                                          <motion.div
                                            key={idx}
                                            whileHover={{ y: -2, scale: 1.02 }}
                                            className="bg-primary/5 border border-primary/20 rounded-xl px-3 py-2.5 text-center"
                                          >
                                            <p className="text-sm font-bold text-foreground" dir="auto">{display}</p>
                                          </motion.div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </StaggerItem>
                              );
                            })}
                          </div>
                        );
                      }

                      // Legacy fallback (primary/secondary/tertiary)
                      return (
                        <StaggerItem>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                              { key: "primary", label: t("crop.recommendedCrop"), color: "from-amber-500 to-orange-600" },
                              { key: "secondary", label: t("crop.secondaryCrop"), color: "from-emerald-500 to-green-600" },
                              { key: "tertiary", label: t("crop.tertiaryCrop"), color: "from-blue-500 to-cyan-600" },
                            ].map(({ key, label, color }) => {
                              const cropRaw = rec[key];
                              if (!cropRaw) return null;
                              const crop = cleanByLang(cropRaw, language);
                              return (
                                <motion.div key={key} whileHover={{ y: -4, scale: 1.02 }} className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center cursor-default">
                                  <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg mb-2`}>
                                    <Sprout className="w-5 h-5 text-white" />
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                                  <p className="text-base font-bold text-foreground" dir="auto">{crop}</p>
                                </motion.div>
                              );
                            })}
                          </div>
                        </StaggerItem>
                      );
                    })()}
                    {result.recommendation.description && (() => {
                      const desc = result.recommendation.description;
                      const cleanDesc = cleanByLang(desc, language);
                      return (
                        <StaggerItem>
                          <div className="bg-gradient-to-br from-secondary/60 to-secondary/30 border border-border rounded-2xl p-5">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{t("crop.details")}</p>
                            <p className="text-sm text-foreground leading-7 font-medium" dir="auto">{cleanDesc}</p>
                          </div>
                        </StaggerItem>
                      );
                    })()}
                  </AnalysisResultCard>
                )}

                {(result.general_warning || result.general_status) && (() => {
                  const gw = result.general_warning || result.general_status;
                  const cleanGw = cleanByLang(gw, language);
                  return (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-3xl p-4 flex items-center gap-3 shadow-card">
                      <CloudSun className="w-5 h-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t("crop.generalWarning")}</p>
                        <p className="text-sm font-semibold text-foreground" dir="auto">{cleanGw}</p>
                      </div>
                    </motion.div>
                  );
                })()}

                {result.expert_daily_guide?.length > 0 && (
                  <AnalysisResultCard title={t("crop.dailyGuide")}>
                    {result.expert_daily_guide.map((day: any, i: number) => (
                      <StaggerItem key={i}>
                        <div className="bg-secondary/40 border border-border rounded-2xl p-4 space-y-2">
                          <p className="text-sm font-bold text-foreground">{day["التاريخ"] || day.date}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {[
                              { icon: CloudSun, label: t("crop.weather"), val: day["الطقس"] || day.weather },
                              { icon: Droplets, label: t("crop.irrigation"), val: day["نصيحة الري"] || day.irrigation },
                              { icon: Leaf, label: t("crop.fertilizer"), val: day["نصيحة السماد"] || day.fertilizer },
                              { icon: Bug, label: t("crop.diseaseAlert"), val: day["تنبيه الأمراض"] || day.disease_alert || day.disease },
                            ].map(({ icon: Ic, label, val }, j) => {
                              const displayVal = cleanByLang(val, language);
                              return (
                                <div key={j} className="flex items-center gap-2">
                                  <Ic className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="text-foreground/80 font-medium">{label}:</span>
                                  <span className="text-foreground font-semibold" dir="auto">{displayVal}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </StaggerItem>
                    ))}
                  </AnalysisResultCard>
                )}
              </div>
            );
          })()}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default CropRecommendation;
