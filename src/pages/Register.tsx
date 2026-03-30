import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRegister, isTimeoutError } from "@/services/smartFarmApi";
import { motion } from "framer-motion";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    else if (name.trim().length < 2) errs.name = "Name is too short";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";
    if (!password) errs.password = "Password is required";
    else if (password.length < 6) errs.password = "Password must be at least 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await apiRegister(name, email, password);
      if (data.detail) {
        toast({ title: "Error", description: data.detail, variant: "destructive" });
      } else {
        toast({ title: "✅", description: "Account created successfully! Please sign in." });
        navigate("/login");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: isTimeoutError(err)
          ? "The server is not responding. Please try again shortly."
          : "Could not connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex" dir="ltr">
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
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Account</h1>
            <p className="text-muted-foreground">Register now to access all features</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium text-sm">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }} className={`h-12 rounded-xl bg-secondary/50 border-border focus:border-primary transition-colors pl-12 ${errors.name ? "border-destructive" : ""}`} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="example@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }} className={`h-12 rounded-xl bg-secondary/50 border-border focus:border-primary transition-colors pl-12 ${errors.email ? "border-destructive" : ""}`} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }} className={`h-12 rounded-xl bg-secondary/50 border-border focus:border-primary transition-colors pl-12 pr-12 ${errors.password ? "border-destructive" : ""}`} />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="terms" className="w-4 h-4 rounded border-input accent-primary" required />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link to="#" className="text-primary hover:underline">Terms & Conditions</Link>
              </label>
            </div>
            <Button type="submit" size="lg" disabled={loading} className="w-full h-12 rounded-xl font-semibold shadow-primary">
              {loading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
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
          <h2 className="text-3xl font-bold mb-4">Join us today</h2>
          <p className="text-primary-foreground/80 text-lg leading-relaxed">Start your journey with us and enjoy an integrated management experience</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
