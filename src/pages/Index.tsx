import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Shield, Zap, Users, Leaf, Sprout, FlaskConical, ChevronDown, Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const Index = () => {
  const { t, isRTL } = useLanguage();

  const features = [
    { icon: BarChart3, title: t("index.feat1Title"), description: t("index.feat1Desc"), color: "from-primary to-primary-glow" },
    { icon: Users, title: t("index.feat2Title"), description: t("index.feat2Desc"), color: "from-blue-500 to-cyan-400" },
    { icon: Shield, title: t("index.feat3Title"), description: t("index.feat3Desc"), color: "from-amber-500 to-orange-400" },
    { icon: Zap, title: t("index.feat4Title"), description: t("index.feat4Desc"), color: "from-purple-500 to-pink-400" },
  ];

  const stats = [
    { value: "10K+", label: isRTL ? "مزارع نشط" : "Active Farms" },
    { value: "50+", label: isRTL ? "نموذج ذكاء اصطناعي" : "AI Models" },
    { value: "99%", label: isRTL ? "دقة التحليل" : "Accuracy" },
    { value: "24/7", label: isRTL ? "دعم متواصل" : "Support" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Hero */}
      <header className="relative min-h-screen flex flex-col">
        {/* Background effects */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-pulse-gentle" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-primary-glow/5 rounded-full blur-[100px] animate-pulse-gentle" style={{ animationDelay: "1.5s" }} />

        {/* Floating decorative elements */}
        <div className="absolute top-32 right-[15%] w-20 h-20 border-2 border-primary/10 rounded-2xl rotate-12 animate-float" />
        <div className="absolute top-1/2 left-[10%] w-14 h-14 border-2 border-primary/8 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-32 right-[20%] w-8 h-8 bg-primary/10 rounded-lg rotate-45 animate-float" style={{ animationDelay: "3s" }} />

        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 container mx-auto px-6 py-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">{t("index.brand")}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => document.documentElement.classList.toggle("dark")}
                className="w-9 h-9 rounded-xl bg-secondary/80 backdrop-blur-sm hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
              >
                <Moon className="w-4 h-4 dark:hidden" />
                <Sun className="w-4 h-4 hidden dark:block" />
              </button>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-foreground font-medium rounded-full px-5">
                  {t("index.login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="shadow-primary rounded-full px-5 font-medium">
                  {t("index.register")}
                </Button>
              </Link>
            </div>
          </div>
        </motion.nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex items-center">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div
                custom={0}
                variants={fadeUp}
                className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 backdrop-blur-sm text-primary px-5 py-2.5 rounded-full text-sm font-medium mb-8"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>{t("index.badge")}</span>
              </motion.div>

              <motion.h1
                custom={1}
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-foreground mb-6 leading-[1.1] tracking-tight"
              >
                {t("index.heroTitle1")}{" "}
                <span className="text-gradient">{t("index.heroTitle2")}</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                className="text-lg lg:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
              >
                {t("index.heroDesc")}
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link to="/dashboard">
                  <Button size="lg" className="text-base px-8 h-13 shadow-primary rounded-full font-semibold gap-2 group">
                    {t("index.tryFree")}
                    <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? "rotate-180 group-hover:translate-x-1" : ""}`} />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="text-base px-8 h-13 rounded-full font-medium border-2">
                    {t("index.login")}
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                custom={4}
                variants={fadeUp}
                className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-20 max-w-xl mx-auto"
              >
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl lg:text-3xl font-bold text-gradient">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="relative z-10 flex justify-center pb-8"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
        </motion.div>
      </header>

      {/* Features */}
      <section className="py-24 relative">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="container mx-auto px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              {isRTL ? "الميزات" : "Features"}
            </p>
            <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-4">{t("index.featuresTitle")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("index.featuresDesc")}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-card rounded-2xl p-7 border border-border shadow-card hover:shadow-card-hover transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              {isRTL ? "كيف يعمل" : "How it works"}
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              {isRTL ? "ثلاث خطوات بسيطة" : "Three Simple Steps"}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "01", icon: Sprout, title: isRTL ? "ارفع بياناتك" : "Upload Data", desc: isRTL ? "ارفع صور النباتات أو الحيوانات أو أدخل بيانات التربة" : "Upload plant or animal images, or enter soil data" },
              { step: "02", icon: FlaskConical, title: isRTL ? "تحليل بالذكاء الاصطناعي" : "AI Analysis", desc: isRTL ? "نماذج الذكاء الاصطناعي تحلل بياناتك في ثوان" : "Our AI models analyze your data in seconds" },
              { step: "03", icon: BarChart3, title: isRTL ? "نتائج دقيقة" : "Get Results", desc: isRTL ? "احصل على نتائج وتوصيات دقيقة لمزرعتك" : "Get accurate results and recommendations" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center relative"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center justify-center">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="gradient-primary rounded-3xl p-12 lg:p-20 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-60 h-60 bg-white rounded-full blur-[80px]" />
              <div className="absolute bottom-10 left-10 w-80 h-80 bg-white rounded-full blur-[100px]" />
            </div>
            <div className="absolute inset-0 bg-grid opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold text-primary-foreground mb-6">{t("index.ctaTitle")}</h2>
              <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto">{t("index.ctaDesc")}</p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-base px-10 h-13 rounded-full font-semibold shadow-lg">
                  {t("index.ctaButton")}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">{t("index.brand")}</span>
          </div>
          <p className="text-muted-foreground text-sm">{t("index.footer")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
