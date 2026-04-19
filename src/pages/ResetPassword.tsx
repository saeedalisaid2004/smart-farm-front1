import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiResetPassword, getApiErrorMessage, isTimeoutError } from "@/services/smartFarmApi";
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
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim() || !newPassword) {
      toast({ variant: "destructive", title: "Please fill all fields" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords do not match" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ variant: "destructive", title: "Password must be at least 6 characters" });
      return;
    }
    setLoading(true);
    try {
      await apiResetPassword(email, otp, newPassword);
      setSuccess(true);
      toast({ title: "Password reset successfully!" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: isTimeoutError(err)
          ? "The server is not responding. Please try again shortly."
          : getApiErrorMessage(err) || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden" dir="ltr">
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
          <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter the code sent to your email</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">Email</Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">Verification Code</Label>
              <Input
                type="text"
                placeholder="Enter code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4 text-center tracking-widest text-lg font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground font-medium text-sm">New Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
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
              <Label className="text-foreground font-medium text-sm">Confirm Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold shadow-primary mt-2">
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-medium">Password reset successfully!</p>
            <p className="text-sm text-muted-foreground">You can now sign in with your new password</p>
            <Button onClick={() => navigate("/login")} className="w-full h-12 rounded-xl text-base font-semibold">
              Go to Sign In
            </Button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
