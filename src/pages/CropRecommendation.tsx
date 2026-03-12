import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CropRecommendation = () => {
  return (
    <DashboardLayout title="Crop Recommendation (ML)">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sprout className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Environmental Parameters</h2>
          </div>

          <div className="space-y-5 mb-8">
            <div>
              <Label className="text-foreground mb-2 block">Temperature (°C)</Label>
              <Input placeholder="e.g., 25" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Humidity (%)</Label>
              <Input placeholder="e.g., 65" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Rainfall (mm)</Label>
              <Input placeholder="e.g., 120" type="number" className="rounded-full h-11 bg-secondary border-0 px-4" />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Soil Type</Label>
              <Select>
                <SelectTrigger className="rounded-full h-11 bg-secondary border-0 px-4">
                  <SelectValue placeholder="Select soil type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clay">Clay</SelectItem>
                  <SelectItem value="sandy">Sandy</SelectItem>
                  <SelectItem value="loamy">Loamy</SelectItem>
                  <SelectItem value="silt">Silt</SelectItem>
                  <SelectItem value="peaty">Peaty</SelectItem>
                  <SelectItem value="chalky">Chalky</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full rounded-full py-6 text-base font-medium">
            Recommend Crop
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CropRecommendation;
