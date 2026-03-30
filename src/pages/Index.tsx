import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, BarChart3, Shield, Zap, Users, Leaf, Sprout, FlaskConical,
  ChevronDown, Moon, Sun, Eye, Apple, MessageCircle, Star, ArrowRight, Check
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.8], [1, 0.95]);

  const features = [
    { icon: BarChart3, title: "Advanced Analytics", description: "Track your platform's performance with detailed reports and interactive charts", color: "from-primary to-primary-glow" },
    { icon: Users, title: "User Management", description: "Full user management with multi-level permissions", color: "from-blue-500 to-cyan-400" },
    { icon: Shield, title: "Maximum Security", description: "High-level security to protect your data and customer information", color: "from-amber-500 to-orange-400" },
    { icon: Zap, title: "Super Speed", description: "Fast and reliable performance ensuring a smooth experience for all users", color: "from-purple-500 to-pink-400" },
  ];

  const stats = [
    { value: "10K+", label: "Active Farms" },
    { value: "50+", label: "AI Models" },
    { value: "99%", label: "Accuracy" },
    { value: "24/7", label: "Support" },
  ];

  const services = [
    { icon: Leaf, title: "Plant Disease Detection", desc: "Instant plant disease analysis from photos", gradient: "from-emerald-500 to-green-600" },
    { icon: Eye, title: "Animal Weight Estimation", desc: "Accurate AI-powered animal weight estimation", gradient: "from-blue-500 to-indigo-600" },
    { icon: Sprout, title: "Crop Recommendation", desc: "Smart crop suggestions based on your soil", gradient: "from-amber-500 to-orange-600" },
    { icon: FlaskConical, title: "Soil Analysis", desc: "Comprehensive soil property analysis", gradient: "from-purple-500 to-violet-600" },
    { icon: Apple, title: "Fruit Quality", desc: "Fruit quality inspection and grading", gradient: "from-rose-500 to-pink-600" },
    { icon: MessageCircle, title: "Smart Chatbot", desc: "AI assistant for your farming questions", gradient: "from-cyan-500 to-teal-600" },
  ];

  const testimonials = [
    { name: "Ahmed Mohamed", role: "Wheat Farmer", text: "The system helped me detect plant diseases early and reduce losses by 40%", stars: 5 },
    { name: "Sara Ali", role: "Agricultural Engineer", text: "Great tool for soil analysis and recommending the right crops for each season", stars: 5 },
    { name: "Mohamed Hassan", role: "Livestock Farmer", text: "Animal weight estimation by photos saved me a lot of time and effort", stars: 5 },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir="ltr">
      {/* Hero */}
      <header ref={heroRef} className="relative min-h-screen flex flex-col">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-1/4 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/8 rounded-full blur-[120px] animate-pulse-gentle" />
        <div className="absolute bottom-1/4 left-1/4 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-primary-glow/5 rounded-full blur-[100px] animate-pulse-gentle" style={{ animationDelay: "1.5s" }} />

        {/* Floating decorative elements */}
        <div className="hidden sm:block absolute top-32 right-[15%] w-20 h-20 border-2 border-primary/10 rounded-2xl rotate-12 animate-float" />
        <div className="hidden sm:block absolute top-1/2 left-[10%] w-14 h-14 border-2 border-primary/8 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="hidden sm:block absolute bottom-32 right-[20%] w-8 h-8 bg-primary/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: "3s" }} />

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Smart Farm AI</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => document.documentElement.classList.toggle("dark")}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-card/60 backdrop-blur-md border border-border/50 hover:bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <Moon className="w-4 h-4 dark:hidden" />
                <Sun className="w-4 h-4 hidden dark:block" />
              </button>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-foreground font-medium rounded-full px-3 sm:px-5 text-xs sm:text-sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="shadow-primary rounded-full px-4 sm:px-6 font-semibold text-xs sm:text-sm">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 flex-1 flex items-center">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              className="max-w-4xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 backdrop-blur-sm text-primary px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Integrated Management Platform</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-5 sm:mb-8 leading-[1.08] tracking-tight"
              >
                Manage your business with{" "}
                <span className="text-gradient relative">
                  ease and precision
                  <motion.span
                    className="absolute -bottom-1 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-primary to-primary-glow rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                    style={{ transformOrigin: "left" }}
                  />
                </span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-base sm:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2"
              >
                A comprehensive dashboard that provides all the tools you need to manage your platform, from tracking statistics to user management
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
              >
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="text-sm sm:text-base px-6 sm:px-10 h-12 sm:h-14 shadow-primary rounded-full font-semibold gap-2 group w-full sm:w-auto">
                    Try it free now
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="text-sm sm:text-base px-6 sm:px-10 h-12 sm:h-14 rounded-full font-medium border-2 w-full sm:w-auto bg-card/50 backdrop-blur-sm">
                    Sign In
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                custom={4}
                variants={fadeUp}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-20 max-w-2xl mx-auto"
              >
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-3 sm:p-4 text-center"
                  >
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="relative z-10 flex justify-center pb-6 sm:pb-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="w-8 h-12 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [1, 0.3, 1], y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </motion.div>
        </motion.div>
      </header>

      {/* Services */}
      <section className="py-14 sm:py-24 relative">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider"
            >
              Our Services
            </motion.span>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">
              6 AI-Powered Services
            </h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
              Advanced tools for crop, soil, and animal analysis
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
                className="group relative bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`} />
                
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  <service.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{service.desc}</p>
                
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  Try now
                  <ArrowRight className="w-3 h-3" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 sm:py-24 bg-card/50 relative">
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Features
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4">Features that make your work easier</h2>
            <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">We offer a set of integrated tools to manage your work efficiently</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-card rounded-2xl p-6 sm:p-7 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              How it works
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { step: "01", icon: Sprout, title: "Upload Data", desc: "Upload plant or animal images, or enter soil data" },
              { step: "02", icon: FlaskConical, title: "AI Analysis", desc: "Our AI models analyze your data in seconds" },
              { step: "03", icon: BarChart3, title: "Get Results", desc: "Get accurate results and recommendations" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center relative"
              >
                <div className="relative inline-flex mb-5 sm:mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  >
                    <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                  </motion.div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center shadow-lg">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-14 sm:py-24 bg-card/50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <span className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary px-4 py-1.5 rounded-full text-xs font-semibold mb-4 uppercase tracking-wider">
              Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              What Our Users Say
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {testimonials.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="bg-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-border shadow-card relative"
              >
                <div className="absolute top-4 right-5 text-4xl sm:text-5xl text-primary/10 font-serif leading-none">"</div>
                
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: item.stars }).map((_, si) => (
                    <Star key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-foreground leading-relaxed mb-5">{item.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{item.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="gradient-primary rounded-2xl sm:rounded-[2rem] p-8 sm:p-14 lg:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-60 h-60 bg-white rounded-full blur-[80px]" />
              <div className="absolute bottom-10 left-10 w-80 h-80 bg-white rounded-full blur-[100px]" />
            </div>
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative z-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl lg:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6"
              >
                Start your journey with us today
              </motion.h2>
              <p className="text-primary-foreground/80 text-sm sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">Join thousands of users who manage their businesses efficiently</p>
              
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
                {["Free to try", "No credit card", "Instant results"].map((item, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-primary-foreground/90 text-xs sm:text-sm">
                    <Check className="w-4 h-4" />
                    {item}
                  </span>
                ))}
              </div>

              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-sm sm:text-base px-8 sm:px-12 h-12 sm:h-14 rounded-full font-semibold shadow-lg">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10 sm:py-14">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold text-foreground">Smart Farm AI</span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md">© 2026 Smart Farm AI. Graduation Project - Faculty of Cairo Higher Institute</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
