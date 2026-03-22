import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiRegister } from "@/services/smartFarmApi";
import { motion } from "framer-motion";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiRegister(name, email, password);
      if (data.detail) {
        toast({ title: "Error", description: data.detail, variant: "destructive" });
      } else {
        toast({ title: "✅", description: "تم إنشاء الحساب بنجاح! سجل دخولك الآن." });
        navigate("/login");
      }
    } catch {
      toast({ title: "Error", description: "حدث خطأ غير متوقع", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" dir={isRTL ? "rtl" : "ltr"}>
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative">
        <div className="absolute inset-0 gradient-hero opacity-50" />
        <div className="absolute inset-0 bg-grid opacity-15" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md relative z-10"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
            <span>{t("register.backHome")}</span>
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{t("register.title")}</h1>
            <p className="text-muted-foreground">{t("register.subtitle")}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium text-sm">{t("register.fullName")}</Label>
              <div className="relative">
                <User className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                <Input id="name" type="text" placeholder={t("register.fullNamePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} className={`h-12 rounded-xl bg-secondary/50 border-border focus:border-primary transition-colors ${isRTL ? "pr-12" : "pl-12"}`} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">{t("register.email")}</Label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`h-12 rounded-xl bg-secondary/50 border-border focus:border-primary transition-colors ${isRTL ? "pr-12" : "pl-12"}`} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">{t("register.password")}</Label>
              <div className="relative">
                <Lock className={`absolute ${isRTL ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`h-12 rounded-xl bg-secondary/50 border-border focus:border-primary transition-colors ${isRTL ? "pr-12 pl-12" : "pl-12 pr-12"}`} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRTL ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors`}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" className="w-4 h-4 rounded border-input accent-primary" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                {t("register.agree")}{" "}
                <Link to="#" className="text-primary hover:underline">{t("register.terms")}</Link>
              </label>
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full h-12 rounded-xl font-semibold shadow-primary">
              {loading ? t("register.creating") : t("register.createAccount")}
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              {t("register.hasAccount")}{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">{t("register.signIn")}</Link>
            </p>
          </form>
        </motion.div>
      </div>

      <div className="hidden lg:flex flex-1 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-[80px]" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 bg-grid opacity-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-center text-primary-foreground max-w-md"
        >
          <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-8 animate-float">
            <Leaf className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">{t("register.joinTitle")}</h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">{t("register.joinSubtitle")}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
