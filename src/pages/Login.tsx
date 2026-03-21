import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiLogin } from "@/services/smartFarmApi";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast({ variant: "destructive", title: "Error", description: "Please select your role" });
      return;
    }
    setLoading(true);
    try {
      // Login with Supabase
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        let msg = "Login failed. Please try again.";
        if (error.message.includes("Invalid login")) msg = "Invalid email or password.";
        if (error.message.includes("Email not confirmed")) msg = "Please confirm your email first.";
        toast({ variant: "destructive", title: "Error", description: msg });
      } else {
        // Also login with external API to get user_id
        try {
          await apiLogin(email, password);
        } catch {
          // External API login is optional, continue anyway
        }
        if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }
    } catch {
      toast({ variant: "destructive", title: "Error", description: "An unexpected error occurred." });
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
          <div className="space-y-2">
            <Label className="text-foreground font-medium">{t("login.role")}</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="h-11 rounded-full bg-secondary border-0 px-4">
                <SelectValue placeholder={t("login.selectRole")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">{t("common.farmer")}</SelectItem>
                <SelectItem value="admin">{t("common.admin")}</SelectItem>
              </SelectContent>
            </Select>
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
