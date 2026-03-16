import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const CropRecommendation = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout title={t("crop.title")}>
      <div className="max-w-2xl mx-auto">
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
              <Input placeholder="e.g., 25" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.humidity")}</Label>
              <Input placeholder="e.g., 65" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.rainfall")}</Label>
              <Input placeholder="e.g., 120" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("crop.soilType")}</Label>
              <Select>
                <SelectTrigger className="rounded-full h-11 bg-secondary border-0 px-4">
                  <SelectValue placeholder={t("crop.selectSoil")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">{t("crop.clay")}</SelectItem>
                  <SelectItem value="sandy">{t("crop.sandy")}</SelectItem>
                  <SelectItem value="loamy">{t("crop.loamy")}</SelectItem>
                  <SelectItem value="silt">{t("crop.silt")}</SelectItem>
                  <SelectItem value="peaty">{t("crop.peaty")}</SelectItem>
                  <SelectItem value="chalky">{t("crop.chalky")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full rounded-full py-6 text-base font-medium">
            {t("crop.recommend")}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CropRecommendation;
