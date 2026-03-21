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
          const primary = result.recommendations?.primary || result.recommended_crop;
          const alternatives = result.recommendations?.alternatives || [];
          const description = result.description || "";
          const confidence = result.confidence;
          const inputData = result.input_data;

          return (
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
              {primary ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Recommended Crop</p>
                    <p className="text-3xl font-bold text-primary capitalize">{primary}</p>
                  </div>

                  {alternatives.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Alternatives</p>
                      <div className="flex flex-wrap gap-2">
                        {alternatives.map((alt: string, i: number) => (
                          <span key={i} className="px-4 py-1.5 bg-secondary text-foreground rounded-full text-sm font-medium capitalize">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {confidence && (
                    <p className="text-sm text-muted-foreground">
                      Confidence: <span className="font-semibold text-foreground">{typeof confidence === 'number' ? `${(confidence * 100).toFixed(1)}%` : confidence}</span>
                    </p>
                  )}

                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}

                  {inputData && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                      {inputData.temperature && (
                        <div className="p-3 bg-secondary/50 rounded-xl">
                          <p className="text-xs text-muted-foreground">{t("crop.temperature")}</p>
                          <p className="text-sm font-medium text-foreground">{inputData.temperature}</p>
                        </div>
                      )}
                      {inputData.humidity && (
                        <div className="p-3 bg-secondary/50 rounded-xl">
                          <p className="text-xs text-muted-foreground">{t("crop.humidity")}</p>
                          <p className="text-sm font-medium text-foreground">{inputData.humidity}</p>
                        </div>
                      )}
                      {inputData.rainfall && (
                        <div className="p-3 bg-secondary/50 rounded-xl">
                          <p className="text-xs text-muted-foreground">{t("crop.rainfall")}</p>
                          <p className="text-sm font-medium text-foreground">{inputData.rainfall}</p>
                        </div>
                      )}
                      {inputData.soil_type && (
                        <div className="p-3 bg-secondary/50 rounded-xl">
                          <p className="text-xs text-muted-foreground">{t("crop.soilType")}</p>
                          <p className="text-sm font-medium text-foreground">{inputData.soil_type}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
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
