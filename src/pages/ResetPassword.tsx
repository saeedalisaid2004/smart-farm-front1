import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiResetPassword, isTimeoutError } from "@/services/smartFarmApi";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const location = useLocation();
  const [email, setEmail] = useState((location.state as any)?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim() || !newPassword) {
      toast({ variant: "destructive", title: t("reset.fillAll") });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: t("reset.noMatch") });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: t("reset.tooShort") });
      return;
    }
    setLoading(true);
    try {
      const data = await apiResetPassword(email, otp, newPassword);
      if (data.detail) {
        toast({ variant: "destructive", title: data.detail });
      } else {
        setSuccess(true);
        toast({ title: t("reset.success") });
      }
    } catch (err) {
      toast({ variant: "destructive", title: isTimeoutError(err) ? t("api.timeout") : t("forgot.error") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/6 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-card relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-5 shadow-glow">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{t("reset.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("reset.subtitle")}</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t("reset.email")}</Label>
              <Input
                type="email"
                placeholder={t("forgot.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t("reset.otp")}</Label>
              <Input
                type="text"
                placeholder={t("reset.otpPlaceholder")}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4 text-center tracking-widest text-lg font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t("reset.newPassword")}</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("reset.newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">{t("reset.confirmPassword")}</Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("reset.confirmPlaceholder")}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold shadow-primary mt-2">
              {loading ? t("reset.submitting") : t("reset.submit")}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-medium">{t("reset.success")}</p>
            <p className="text-sm text-muted-foreground">{t("reset.successDesc")}</p>
            <Button onClick={() => navigate("/login")} className="w-full h-12 rounded-xl text-base font-semibold">
              {t("reset.goToLogin")}
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> {t("reset.backToLogin")}
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
