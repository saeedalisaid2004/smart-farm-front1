import { AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ResultItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  variant?: "primary" | "destructive" | "warning" | "default";
  large?: boolean;
}

const variantStyles = {
  primary: {
    bg: "bg-primary/5 border-primary/20",
    text: "text-primary",
    iconBg: "bg-primary/10",
  },
  destructive: {
    bg: "bg-destructive/5 border-destructive/20",
    text: "text-destructive",
    iconBg: "bg-destructive/10",
  },
  warning: {
    bg: "bg-amber-500/5 border-amber-500/20",
    text: "text-amber-600",
    iconBg: "bg-amber-500/10",
  },
  default: {
    bg: "bg-secondary/40 border-border",
    text: "text-foreground",
    iconBg: "bg-primary/10",
  },
};

export const ResultItem = ({ icon, label, value, variant = "default", large }: ResultItemProps) => {
  const style = variantStyles[variant];
  return (
    <div className={`border rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 ${style.bg}`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className={`font-bold break-words ${large ? 'text-2xl sm:text-3xl' : 'text-base sm:text-lg'} ${style.text}`} dir="auto">
          {value}
        </p>
      </div>
    </div>
  );
};

export const ConfidenceBar = ({ value, label = "Confidence" }: { value: number; label?: string }) => (
  <div className="bg-secondary/40 border border-border rounded-2xl p-4 sm:p-5 space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm font-bold text-gradient">{value.toFixed(0)}%</span>
    </div>
    <div className="relative">
      <Progress value={value} className="h-2.5" />
      <motion.div
        className="absolute top-0 left-0 h-2.5 rounded-full bg-primary/30 blur-sm"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  </div>
);

export const ErrorResult = ({ title, message }: { title: string; message: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-destructive/5 border border-destructive/20 rounded-2xl p-5 flex items-start gap-3"
  >
    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
      <AlertCircle className="w-5 h-5 text-destructive" />
    </div>
    <div>
      <p className="font-semibold text-destructive text-sm">{title}</p>
      <p className="text-sm text-muted-foreground mt-1" dir="auto">{message}</p>
    </div>
  </motion.div>
);

interface AnalysisResultCardProps {
  title: string;
  statusColor?: "primary" | "destructive";
  children: ReactNode;
}

const AnalysisResultCard = ({ title, statusColor = "primary", children }: AnalysisResultCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 24, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -12, scale: 0.97 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="relative overflow-hidden bg-card border border-border rounded-3xl p-5 sm:p-6 shadow-card"
  >
    {/* Top accent line */}
    <div className={`absolute top-0 left-6 right-6 h-[2px] rounded-full ${statusColor === "primary" ? "bg-gradient-to-r from-transparent via-primary to-transparent" : "bg-gradient-to-r from-transparent via-destructive to-transparent"}`} />
    
    <div className="flex items-center gap-2.5 mb-5">
      <div className={`w-2.5 h-2.5 rounded-full ${statusColor === "primary" ? "bg-primary" : "bg-destructive"} animate-pulse`} />
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    </div>

    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="space-y-3 sm:space-y-4"
    >
      {children}
    </motion.div>
  </motion.div>
);

export const StaggerItem = ({ children }: { children: ReactNode }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    }}
  >
    {children}
  </motion.div>
);

export default AnalysisResultCard;
