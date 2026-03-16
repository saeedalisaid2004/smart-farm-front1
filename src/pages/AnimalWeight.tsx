import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Upload, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const AnimalWeight = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { t } = useLanguage();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  return (
    <DashboardLayout title={t("animalWeight.title")}>
      <div className="max-w-2xl mx-auto">
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
            <Button className="flex-1 rounded-full py-6 text-base font-medium">
              {t("common.analyzeImage")}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnimalWeight;
