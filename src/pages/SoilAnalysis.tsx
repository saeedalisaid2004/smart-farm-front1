import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

const SoilAnalysis = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout title={t("soil.title")}>
      <div className="max-w-2xl mx-auto">
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
              <Input placeholder="e.g., 6.5" type="number" step="0.1" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.moisture")}</Label>
              <Input placeholder="e.g., 45" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.nitrogen")}</Label>
              <Input placeholder="e.g., 20" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.phosphorus")}</Label>
              <Input placeholder="e.g., 30" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">{t("soil.potassium")}</Label>
              <Input placeholder="e.g., 25" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
          </div>
          <Button className="w-full rounded-full py-6 text-base font-medium">
            {t("soil.analyze")}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SoilAnalysis;
