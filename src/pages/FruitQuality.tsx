import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Upload, Apple, Loader2, ImageIcon, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeFruit, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { sendNotification } from "@/services/notificationService";
import { incrementAnalysis } from "@/services/analysisStats";

const FruitQuality = () => {
  const fileRef = useRef<HTMLInputElement>(null);
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
    if (!file) {
      toast({ variant: "destructive", title: t("common.chooseImage") });
      return;
    }
    const userId = getExternalUserId();
    if (!userId) {
      toast({ variant: "destructive", title: "Please login first" });
      return;
    }
    setLoading(true);
    try {
      const data = await analyzeFruit(userId, file);
      setResult(data);
      sendNotification({
        title: "Fruit Quality Analyzed 🍎",
        description: `Quality: ${data?.quality || data?.prediction || "Completed"}`,
        type: "success",
      });
      incrementAnalysis("fruit_quality");
    } catch {
      toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("fruitQuality.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-2xl p-8 shadow-card"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Apple className="w-7 h-7 text-white" />
            </div>
          </div>
          <div
            className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={preview}
                alt="Preview"
                className="max-h-52 rounded-xl object-contain"
              />
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                  <ImageIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-muted-foreground text-sm">{t("common.uploadHint")}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, WEBP</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl h-12 text-sm font-medium border-2" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {t("common.chooseImage")}
            </Button>
            <Button className="flex-1 rounded-xl h-12 text-sm font-medium shadow-primary" onClick={handleAnalyze} disabled={loading || !file}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Analyzing..." : t("common.analyzeImage")}
            </Button>
          </div>
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

                if (result.status === "low_confidence") {
                  return (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-6 h-6 text-amber-500" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="font-semibold text-amber-600 text-sm">Low Confidence</p>
                        <p className="text-sm text-muted-foreground leading-relaxed" dir="auto">{result.message}</p>
                        {result.confidence && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="h-2 flex-1 rounded-full bg-secondary overflow-hidden">
                              <div
                                className="h-full rounded-full bg-amber-500/60 transition-all duration-500"
                                style={{ width: result.confidence }}
                              />
                            </div>
                            <span className="text-xs font-medium text-amber-600">{result.confidence}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                const grade = result.quality_grade || result.quality || result.grade;
                const gradeDescription = result.grade_description || result.description;
                const ripeness = result.ripeness_level || result.ripeness;
                const defect = result.defect_detection || result.defects;
                const confidence = result.confidence;
                const isLowGrade = grade && (grade.toLowerCase().includes('c') || grade.toLowerCase().includes('low'));

                return (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-card">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isLowGrade ? 'bg-destructive' : 'bg-primary'}`} />
                      <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>
                    </div>

                    {grade && (
                      <div className={`rounded-2xl p-5 flex items-center gap-4 ${isLowGrade ? 'bg-destructive/5 border border-destructive/20' : 'bg-primary/5 border border-primary/20'}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isLowGrade ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                          <Star className={`w-6 h-6 ${isLowGrade ? 'text-destructive' : 'text-primary'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">Quality Grade</p>
                          <p className={`text-2xl font-bold ${isLowGrade ? 'text-destructive' : 'text-primary'}`}>{grade}</p>
                          {gradeDescription && (
                            <p className="text-xs text-muted-foreground mt-0.5" dir="auto">{gradeDescription}</p>
                          )}
                        </div>
                        {confidence && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Confidence</p>
                            <p className={`text-lg font-bold ${isLowGrade ? 'text-destructive' : 'text-primary'}`}>{confidence}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {ripeness && (
                      <div className="bg-secondary/40 border border-border rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Apple className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ripeness Level</p>
                          <p className="font-semibold text-foreground" dir="auto">{ripeness}</p>
                        </div>
                      </div>
                    )}

                    {defect && (
                      <div className="bg-secondary/40 border border-border rounded-2xl p-4">
                        <p className="text-xs text-muted-foreground mb-1">Defect Detection</p>
                        <p className="text-sm text-foreground" dir="auto">{defect}</p>
                      </div>
                    )}

                    {!grade && !ripeness && !defect && (
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

export default FruitQuality;
