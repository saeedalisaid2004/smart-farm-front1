import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, Eye, Sprout, FlaskConical, Apple, MessageCircle, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const userName = user?.name || "John Farmer";

  const features = [
    { icon: Leaf, title: t("dashboard.plantDisease"), desc: t("dashboard.plantDiseaseDesc"), path: "/dashboard/plant-disease", gradient: "from-emerald-500 to-green-600" },
    { icon: Eye, title: t("dashboard.animalWeight"), desc: t("dashboard.animalWeightDesc"), path: "/dashboard/animal-weight", gradient: "from-blue-500 to-indigo-600" },
    { icon: Sprout, title: t("dashboard.cropRecommendation"), desc: t("dashboard.cropRecommendationDesc"), path: "/dashboard/crop-recommendation", gradient: "from-amber-500 to-orange-600" },
    { icon: FlaskConical, title: t("dashboard.soilAnalysis"), desc: t("dashboard.soilAnalysisDesc"), path: "/dashboard/soil-analysis", gradient: "from-purple-500 to-violet-600" },
    { icon: Apple, title: t("dashboard.fruitQuality"), desc: t("dashboard.fruitQualityDesc"), path: "/dashboard/fruit-quality", gradient: "from-rose-500 to-pink-600" },
    { icon: MessageCircle, title: t("dashboard.chatbot"), desc: t("dashboard.chatbotDesc"), path: "/dashboard/chatbot", gradient: "from-cyan-500 to-teal-600" },
  ];

  return (
    <DashboardLayout title={t("dashboard.welcome")}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.welcomeUser")}, {userName} 👋</h1>
          <p className="text-muted-foreground mb-8">{t("dashboard.useAI")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <Link
                to={f.path}
                className="block bg-card border border-border rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 group hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <f.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
