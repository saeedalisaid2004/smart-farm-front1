import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, Eye, Sprout, FlaskConical, Apple, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const userName = user?.user_metadata?.full_name || "John Farmer";

  const features = [
    { icon: Leaf, title: t("dashboard.plantDisease"), desc: t("dashboard.plantDiseaseDesc"), path: "/dashboard/plant-disease" },
    { icon: Eye, title: t("dashboard.animalWeight"), desc: t("dashboard.animalWeightDesc"), path: "/dashboard/animal-weight" },
    { icon: Sprout, title: t("dashboard.cropRecommendation"), desc: t("dashboard.cropRecommendationDesc"), path: "/dashboard/crop-recommendation" },
    { icon: FlaskConical, title: t("dashboard.soilAnalysis"), desc: t("dashboard.soilAnalysisDesc"), path: "/dashboard/soil-analysis" },
    { icon: Apple, title: t("dashboard.fruitQuality"), desc: t("dashboard.fruitQualityDesc"), path: "/dashboard/fruit-quality" },
    { icon: MessageCircle, title: t("dashboard.chatbot"), desc: t("dashboard.chatbotDesc"), path: "/dashboard/chatbot" },
  ];

  return (
    <DashboardLayout title={t("dashboard.welcome")}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-1">{t("dashboard.welcomeUser")}, {userName}</h1>
        <p className="text-muted-foreground mb-8">{t("dashboard.useAI")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link
              key={f.path}
              to={f.path}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
