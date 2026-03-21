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

        {result && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Estimation Result</h3>
            {(result.estimated_weight || result.weight) && (
              <div className="flex items-baseline gap-3 flex-wrap">
                <p className="text-3xl font-bold text-primary">
                  {String(result.estimated_weight || result.weight).replace(/\s*kg\s*/gi, '')} kg
                </p>
                {(result.animal_type || result.animal || result.class_name || result.label) && (
                  <span className="text-xl font-semibold text-foreground">
                    — {result.animal_type || result.animal || result.class_name || result.label}
                  </span>
                )}
              </div>
            )}
            {result.confidence && (
              <p className="text-sm text-muted-foreground">Confidence: <span className="font-medium text-foreground">{typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : result.confidence}</span></p>
            )}
            {!result.estimated_weight && !result.weight && !result.animal_type && (
              <pre className="text-xs text-muted-foreground bg-secondary rounded-lg p-4 overflow-auto max-h-60">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AnimalWeight;
