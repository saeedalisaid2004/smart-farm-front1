import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Upload, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { estimateAnimalWeight, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";

const AnimalWeight = () => {
  const fileRef = useRef<HTMLInputElement>(null);
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
      const data = await estimateAnimalWeight(userId, file);
      setResult(data);
    } catch {
      toast({ variant: "destructive", title: "Analysis failed", description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("animalWeight.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
              <Eye className="w-7 h-7 text-accent-foreground" />
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
          const animalName = isRTL
            ? result.animal_name_ar || result.animal_type || result.animal || result.class_name || result.label || result.animal_name_en
            : result.animal_name_en || result.animal_type || result.animal || result.class_name || result.label || result.animal_name_ar;
          const weightValue = result.estimated_weight || result.weight;

          return (
            <div className="bg-card border border-border rounded-2xl p-6 grid grid-cols-2 gap-6">
              {/* Estimation Result */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{t("animalWeight.estimationResult")}</p>
                <p className="text-3xl font-bold text-primary">
                  {weightValue ? `${String(weightValue).replace(/\s*kg\s*/gi, "")} kg` : "—"}
                </p>
              </div>

              {/* Animal Name */}
              {animalName && (
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{t("animalWeight.animalName")}</p>
                  <p className="text-3xl font-bold text-primary">{animalName}</p>
                </div>
              )}

              {/* Confidence - full width */}
              {result.confidence && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">{t("animalWeight.confidence")}: <span className="font-medium text-foreground">{typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : result.confidence}</span></p>
                </div>
              )}

              {!weightValue && !animalName && (
                <pre className="col-span-2 text-xs text-muted-foreground bg-secondary rounded-lg p-4 overflow-auto max-h-60">
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

export default AnimalWeight;
