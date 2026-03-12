import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SoilAnalysis = () => {
  return (
    <DashboardLayout title="Soil Type Analysis">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-accent-foreground" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Manual Soil Properties Input</h2>
          </div>

          <div className="space-y-5 mb-8">
            <div>
              <Label className="text-foreground mb-2 block">Soil pH</Label>
              <Input placeholder="e.g., 6.5" type="number" step="0.1" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Moisture Level (%)</Label>
              <Input placeholder="e.g., 45" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Nitrogen (N)</Label>
              <Input placeholder="e.g., 20" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Phosphorus (P)</Label>
              <Input placeholder="e.g., 30" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Potassium (K)</Label>
              <Input placeholder="e.g., 25" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
          </div>

          <Button className="w-full rounded-full py-6 text-base font-medium">
            Analyze Soil Properties
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SoilAnalysis;
