import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Sprout, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { recommendCrop, getExternalUserId } from "@/services/smartFarmApi";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

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
    } catch {
      toast({ variant: "destructive", title: "Failed", description: "Please try again" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title={t("crop.title")}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-medium text-foreground">{t("crop.envParams")}</h2>
          </div>
          <div className="space-y-5 mb-8">
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.temperature")}</Label>
              <Input placeholder="e.g., 25" type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.humidity")}</Label>
              <Input placeholder="e.g., 65" type="number" value={humidity} onChange={(e) => setHumidity(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.rainfall")}</Label>
              <Input placeholder="e.g., 120" type="number" value={rainfall} onChange={(e) => setRainfall(e.target.value)} className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.soilType")}</Label>
              <Select value={soil} onValueChange={setSoil}>
                <SelectTrigger className="rounded-full h-11 bg-secondary border-0 px-4">
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
          <Button className="w-full rounded-full py-6 text-base font-medium" onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("crop.recommend")}
          </Button>
        </div>

        {result && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Recommendation</h3>
            {result.recommended_crop && (
              <p className="text-2xl font-bold text-primary">{result.recommended_crop}</p>
            )}
            {result.confidence && (
              <p className="text-sm text-muted-foreground">Confidence: <span className="font-medium text-foreground">{typeof result.confidence === 'number' ? `${(result.confidence * 100).toFixed(1)}%` : result.confidence}</span></p>
            )}
            {result.description && (
              <p className="text-sm text-muted-foreground">{result.description}</p>
            )}
            {!result.recommended_crop && (
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

export default CropRecommendation;
