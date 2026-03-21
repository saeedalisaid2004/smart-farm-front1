import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiLogin } from "@/services/smartFarmApi";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.user) {
        setUser({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
        });
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast({ variant: "destructive", title: "Error", description: data.detail || "بيانات الدخول غير صحيحة" });
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "حدث خطأ غير متوقع" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-8 shadow-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Leaf className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{t("login.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">{t("login.email")}</Label>
            <Input id="email" type="email" placeholder={t("login.emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-full bg-secondary border-0 px-4" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">{t("login.password")}</Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("login.passwordPlaceholder")} value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-full bg-secondary border-0 px-4 pr-11" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 rounded-full text-base font-semibold mt-2">
            {loading ? t("login.signingIn") : t("login.signIn")}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="text-primary font-medium hover:underline">{t("login.signUp")}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
