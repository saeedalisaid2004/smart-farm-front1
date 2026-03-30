import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, ArrowLeft, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiForgotPassword, isTimeoutError } from "@/services/smartFarmApi";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({ variant: "destructive", title: "Please enter your email" });
      return;
    }
    setLoading(true);
    try {
      const data = await apiForgotPassword(email);
      if (data.detail && data.detail.toLowerCase().includes("not found")) {
        toast({ variant: "destructive", title: "Email not found" });
      } else {
        setSent(true);
        toast({ title: "Code sent!", description: "Check your email for the verification code" });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: isTimeoutError(err)
          ? "The server is not responding. Please try again shortly."
          : "Something went wrong. Please try again.",
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
          <h1 className="text-2xl font-bold text-foreground">Forgot Password</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your email to receive a reset code</p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary/50 border-border focus:border-primary px-4"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-base font-semibold shadow-primary">
              {loading ? "Sending..." : "Send Reset Code"}
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-medium">Code sent!</p>
            <p className="text-sm text-muted-foreground">Check your email for the verification code</p>
            <Button onClick={() => navigate("/reset-password", { state: { email } })} className="w-full h-12 rounded-xl text-base font-semibold">
              Enter Code
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

export default ForgotPassword;
