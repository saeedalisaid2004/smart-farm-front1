import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FlaskConical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { analyzeSoil, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <DashboardLayout title={t("soil.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">{t("soil.manualInput")}</h2>
          </div>
          <div className="space-y-5 mb-8">
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.ph")}</Label>
              <Input placeholder="e.g., 6.5" type="number" step="0.1" value={ph} onChange={(e) => setPh(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.moisture")}</Label>
              <Input placeholder="e.g., 45" type="number" value={moisture} onChange={(e) => setMoisture(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.nitrogen")}</Label>
              <Input placeholder="e.g., 20" type="number" value={n} onChange={(e) => setN(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.phosphorus")}</Label>
              <Input placeholder="e.g., 30" type="number" value={p} onChange={(e) => setP(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.potassium")}</Label>
              <Input placeholder="e.g., 25" type="number" value={k} onChange={(e) => setK(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
          </div>
          <Button className="w-full rounded-full py-6 text-base font-medium" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("soil.analyze")}
          </Button>
        </div>

        {result && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Analysis Result</h3>
            {result.soil_type && (
              <p className="text-2xl font-bold text-primary">{result.soil_type}</p>
            )}
            {result.recommendation && (
              <p className="text-sm text-muted-foreground">{result.recommendation}</p>
            )}
            {result.confidence && (
              <p className="text-sm text-muted-foreground">Confidence: <span className="font-medium text-foreground">{typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : result.confidence}</span></p>
            )}
            {!result.soil_type && (
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

export default SoilAnalysis;
