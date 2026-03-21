import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Upload, Apple, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeFruit, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";

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
    } catch {
      toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("fruitQuality.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Apple className="w-7 h-7 text-destructive" />
            </div>
          </div>
          <div
            className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center justify-center mb-6 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-sm">{t("common.uploadHint")}</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 rounded-full py-6 text-base font-medium" onClick={() => fileRef.current?.click()}>
              {t("common.chooseImage")}
            </Button>
            <Button className="flex-1 rounded-full py-6 text-base font-medium" onClick={handleAnalyze} disabled={loading || !file}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("common.analyzeImage")}
            </Button>
          </div>
        </div>

        {result && (() => {
          if (result.detail || result.status === "Rejected") {
            const msg = result.detail || result.message || "Request rejected";
            return (
              <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-6 flex items-start gap-3">
                <Apple className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive font-medium">{msg}</p>
              </div>
            );
          }

          const grade = result.quality_grade || result.quality || result.grade;
          const gradeDescription = result.grade_description || result.description;
          const ripeness = result.ripeness_level || result.ripeness;
          const defect = result.defect_detection || result.defects;
          const isLowGrade = grade && (grade.toLowerCase().includes('c') || grade.toLowerCase().includes('low'));

          return (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Analysis Results</h3>

              {grade && (
                <div className={`border-2 rounded-2xl p-5 ${isLowGrade ? 'bg-destructive/5 border-destructive/30' : 'bg-primary/10 border-primary/30'}`}>
                  <p className="text-sm text-muted-foreground mb-1">Quality Grade</p>
                  <p className={`text-2xl font-bold ${isLowGrade ? 'text-destructive' : 'text-primary'}`}>{grade}</p>
                  {gradeDescription && (
                    <p className="text-sm text-muted-foreground mt-1">{gradeDescription}</p>
                  )}
                </div>
              )}

              {ripeness && (
                <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                  <span className="font-semibold text-foreground">Ripeness Level: </span>
                  <span className="text-foreground">{ripeness}</span>
                </div>
              )}

              {defect && (
                <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                  <span className="font-semibold text-foreground">Defect Detection: </span>
                  <span className="text-foreground">{defect}</span>
                </div>
              )}

              {!grade && !ripeness && !defect && (
                <pre className="text-xs text-muted-foreground bg-secondary rounded-lg p-4 overflow-auto max-h-60">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          );
        })()}
      </div>
    </DashboardLayout>
  );
};

export default FruitQuality;
