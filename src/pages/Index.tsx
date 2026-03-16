import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3, Shield, Zap, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t, isRTL } = useLanguage();

  const features = [
    { icon: BarChart3, title: t("index.feat1Title"), description: t("index.feat1Desc") },
    { icon: Users, title: t("index.feat2Title"), description: t("index.feat2Desc") },
    { icon: Shield, title: t("index.feat3Title"), description: t("index.feat3Desc") },
    { icon: Zap, title: t("index.feat4Title"), description: t("index.feat4Desc") },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-light opacity-50" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <nav className="relative z-10 container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-primary">
                <svg className="w-6 h-6 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-foreground">{t("index.brand")}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login"><Button variant="ghost" className="text-foreground">{t("index.login")}</Button></Link>
              <Link to="/register"><Button variant="default" className="shadow-primary">{t("index.register")}</Button></Link>
            </div>
          </div>
        </nav>
        <div className="relative z-10 container mx-auto px-6 py-20 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>{t("index.badge")}</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              {t("index.heroTitle1")}{" "}<span className="text-primary">{t("index.heroTitle2")}</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              {t("index.heroDesc")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link to="/dashboard">
                <Button size="lg" className="text-lg px-8 shadow-primary">
                  {t("index.tryFree")}
                  <ArrowLeft className={`w-5 h-5 ${isRTL ? "mr-2 rotate-180" : "ml-2"}`} />
                </Button>
              </Link>
              <Link to="/login"><Button size="lg" variant="outline" className="text-lg px-8">{t("index.login")}</Button></Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">{t("index.featuresTitle")}</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">{t("index.featuresDesc")}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-background rounded-2xl p-8 border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${400 + index * 100}ms` }}>
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="gradient-primary rounded-3xl p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 right-10 w-40 h-40 bg-primary-foreground rounded-full blur-2xl" />
              <div className="absolute bottom-10 left-10 w-60 h-60 bg-primary-foreground rounded-full blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">{t("index.ctaTitle")}</h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">{t("index.ctaDesc")}</p>
              <Link to="/register">
                <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 text-lg px-8">{t("index.ctaButton")}</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-muted-foreground">{t("index.footer")}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
