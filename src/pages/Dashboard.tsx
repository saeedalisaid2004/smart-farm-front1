import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, Eye, Sprout, FlaskConical, Apple, MessageCircle, ArrowUpRight, BarChart3, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import OnboardingTour from "@/components/OnboardingTour";
import { useEffect, useState } from "react";
import { getAnalysisStats, getDailyStats, getTotalAnalyses, type AnalysisStats } from "@/services/analysisStats";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const userName = user?.name || "John Farmer";

  const [stats, setStats] = useState<AnalysisStats>(getAnalysisStats());
  const [daily, setDaily] = useState(getDailyStats());
  const [total, setTotal] = useState(getTotalAnalyses());

  useEffect(() => {
    const refresh = () => {
      setStats(getAnalysisStats());
      setDaily(getDailyStats());
      setTotal(getTotalAnalyses());
    };
    window.addEventListener("stats-updated", refresh);
    return () => window.removeEventListener("stats-updated", refresh);
  }, []);

  const features = [
    { icon: Leaf, title: t("dashboard.plantDisease"), desc: t("dashboard.plantDiseaseDesc"), path: "/dashboard/plant-disease", gradient: "from-emerald-500 to-green-600" },
    { icon: Eye, title: t("dashboard.animalWeight"), desc: t("dashboard.animalWeightDesc"), path: "/dashboard/animal-weight", gradient: "from-blue-500 to-indigo-600" },
    { icon: Sprout, title: t("dashboard.cropRecommendation"), desc: t("dashboard.cropRecommendationDesc"), path: "/dashboard/crop-recommendation", gradient: "from-amber-500 to-orange-600" },
    { icon: FlaskConical, title: t("dashboard.soilAnalysis"), desc: t("dashboard.soilAnalysisDesc"), path: "/dashboard/soil-analysis", gradient: "from-purple-500 to-violet-600" },
    { icon: Apple, title: t("dashboard.fruitQuality"), desc: t("dashboard.fruitQualityDesc"), path: "/dashboard/fruit-quality", gradient: "from-rose-500 to-pink-600" },
    { icon: MessageCircle, title: t("dashboard.chatbot"), desc: t("dashboard.chatbotDesc"), path: "/dashboard/chatbot", gradient: "from-cyan-500 to-teal-600" },
  ];

  const barData = [
    { name: "🌿 Plant", value: stats.plant_disease },
    { name: "🐄 Animal", value: stats.animal_weight },
    { name: "🌾 Crop", value: stats.crop_recommendation },
    { name: "🧪 Soil", value: stats.soil_analysis },
    { name: "🍎 Fruit", value: stats.fruit_quality },
    { name: "💬 Chat", value: stats.chatbot },
  ];

  const dailyData = daily.slice(-7).map((d) => ({
    date: d.date.slice(5), // MM-DD
    analyses: d.count,
  }));

  const statCards = [
    { label: "Total Analyses", value: total, icon: BarChart3, gradient: "from-primary to-primary-glow" },
    { label: "Today", value: daily.find((d) => d.date === new Date().toISOString().split("T")[0])?.count || 0, icon: Activity, gradient: "from-emerald-500 to-green-600" },
    { label: "Most Used", value: Object.entries(stats).sort((a, b) => b[1] - a[1])[0]?.[0]?.replace("_", " ") || "—", icon: TrendingUp, gradient: "from-amber-500 to-orange-600" },
  ];

  return (
    <DashboardLayout title={t("dashboard.welcome")}>
      <OnboardingTour />
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          
          <h1 className="text-2xl font-bold text-foreground mb-1">{t("dashboard.welcomeUser")}, {userName} 👋</h1>
          <p className="text-muted-foreground mb-6">{t("dashboard.useAI")}</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {statCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5 shadow-card"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold text-foreground capitalize">{s.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        {total > 0 && (
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-card"
            >
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" /> Usage by Service
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

          </div>
        )}

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
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
