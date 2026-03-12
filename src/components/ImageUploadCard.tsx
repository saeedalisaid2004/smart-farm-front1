import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

interface ImageUploadCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onImageSelected?: (file: File) => void;
}

const ImageUploadCard = ({ title, description, icon, onImageSelected }: ImageUploadCardProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageSelected?.(file);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-1">{title}</h1>
      <p className="text-muted-foreground mb-8">{description}</p>

      <div className="bg-card border border-border rounded-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            {icon}
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
              <p className="text-muted-foreground text-sm">Click below to upload an image</p>
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <Button
          className="w-full rounded-xl py-6 text-base font-medium"
          onClick={() => fileRef.current?.click()}
        >
          Choose Image
        </Button>
      </div>
    </div>
  );
};

export default ImageUploadCard;
