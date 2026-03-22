import { useState, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Leaf, BarChart3, MessageCircle, Bell, Bug, Weight, Sprout, FlaskConical, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title: string;
  description: string;
  icon: ReactNode;
}

const steps: Step[] = [
  {
    title: "Welcome to SmartFarm! 🌱",
    description: "Your AI-powered farming assistant. Let us show you around!",
    icon: <Leaf className="w-6 h-6" />,
  },
  {
    title: "🌿 Plant Disease Detection",
    description: "Upload a photo of your plant leaf and our AI will detect diseases instantly with confidence scores.",
    icon: <Bug className="w-6 h-6" />,
  },
  {
    title: "🐄 Animal Weight Estimation",
    description: "Take a photo of your animal and get an accurate weight estimate using computer vision.",
    icon: <Weight className="w-6 h-6" />,
  },
  {
    title: "🌾 Crop Recommendation",
    description: "Enter your soil parameters (N, P, K, pH, temperature, humidity, rainfall) and get the best crop suggestion.",
    icon: <Sprout className="w-6 h-6" />,
  },
  {
    title: "🧪 Soil Analysis",
    description: "Upload a soil image to get detailed analysis of soil type, pH level, and nutrient content.",
    icon: <FlaskConical className="w-6 h-6" />,
  },
  {
    title: "🍎 Fruit Quality Check",
    description: "Snap a photo of your fruit to determine its quality grade — fresh, moderate, or spoiled.",
    icon: <Apple className="w-6 h-6" />,
  },
  {
    title: "💬 Smart Chatbot",
    description: "Ask any farming question in natural language. Get instant AI-powered advice on crops, diseases, weather, and more.",
    icon: <MessageCircle className="w-6 h-6" />,
  },
  {
    title: "🔔 Real-time Notifications",
    description: "Get notified when your analyses are complete. Check the bell icon anytime!",
    icon: <Bell className="w-6 h-6" />,
  },
];

const TOUR_KEY = "onboarding_completed";

const OnboardingTour = () => {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const finish = () => {
    setShow(false);
    localStorage.setItem(TOUR_KEY, "true");
  };

  const next = () => {
    if (current < steps.length - 1) setCurrent(current + 1);
    else finish();
  };

  const prev = () => {
    if (current > 0) setCurrent(current - 1);
  };

  if (!show) return null;

  const step = steps[current];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={finish}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button onClick={finish} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots */}
          <div className="flex gap-2 justify-center mb-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? "w-8 bg-primary" : i < current ? "w-4 bg-primary/40" : "w-4 bg-border"
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <motion.div
            key={current}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow text-primary-foreground"
          >
            {step.icon}
          </motion.div>

          {/* Content */}
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={prev}
              disabled={current === 0}
              className="rounded-xl gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            <span className="text-xs text-muted-foreground">
              {current + 1} / {steps.length}
            </span>

            <Button onClick={next} className="rounded-xl gap-1">
              {current === steps.length - 1 ? "Get Started" : "Next"}
              {current < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingTour;
