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

        {result && (() => {
          if (result.detail) {
            return (
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6">
                <p className="text-destructive font-medium">{result.detail}</p>
              </div>
            );
          }

          const crop = result.recommendations?.primary || result.recommended_crop || result.prediction || result.predicted_class;
          const yieldLevel = result.expected_yield || result.yield_level;
          const description = result.description || result.recommendation || result.summary;

          return (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Recommendation Result</h3>

              {crop && (
                <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Sprout className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Recommended Crop</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground capitalize">{crop}</p>
                </div>
              )}

              {yieldLevel && (
                <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                  <span className="font-semibold text-foreground">Expected Yield Level: </span>
                  <span className={`font-semibold ${yieldLevel.toLowerCase() === 'high' ? 'text-primary' : yieldLevel.toLowerCase() === 'medium' ? 'text-yellow-500' : 'text-orange-500'}`}>
                    {yieldLevel}
                  </span>
                </div>
              )}

              {description && (
                <div className="bg-secondary/50 border border-border rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              )}

              {!crop && (
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

export default CropRecommendation;
