import { Upload, Loader2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useRef } from "react";
import { LucideIcon } from "lucide-react";

interface AnalysisUploadCardProps {
  icon: LucideIcon;
  gradient: string;
  preview: string | null;
  loading: boolean;
  hasFile: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
}

const AnalysisUploadCard = ({
  icon: Icon,
  gradient,
  preview,
  loading,
  hasFile,
  onFileChange,
  onAnalyze,
}: AnalysisUploadCardProps) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-card group/card"
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover/card:opacity-[0.06] transition-opacity duration-700`} />
      
      <div className="relative z-10">
        {/* Icon with pulse ring */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-30 animate-pulse`} />
            <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Upload zone */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="border-2 border-dashed border-border rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center mb-5 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 group"
          onClick={() => fileRef.current?.click()}
        >
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-lg" />
              <img
                src={preview}
                alt="Preview"
                className="relative max-h-52 rounded-xl object-contain shadow-lg"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center mb-3 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                <ImageIcon className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted-foreground text-sm font-medium">{t("common.uploadHint")}</p>
              <p className="text-xs text-muted-foreground/50 mt-1.5">PNG, JPG, WEBP</p>
            </motion.div>
          )}
        </motion.div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12 text-sm font-medium border-2 hover:border-primary/40 hover:bg-primary/5 transition-all"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {t("common.chooseImage")}
          </Button>
          <Button
            className="flex-1 rounded-xl h-12 text-sm font-medium shadow-primary hover:shadow-glow transition-all duration-300"
            onClick={onAnalyze}
            disabled={loading || !hasFile}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span className="animate-pulse">Analyzing...</span>
              </>
            ) : (
              t("common.analyzeImage")
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisUploadCard;
