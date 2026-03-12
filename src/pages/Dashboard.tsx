import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Leaf, Eye, Sprout, FlaskConical, Apple, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: Leaf, title: "Plant Disease Detection", desc: "Detect plant diseases early using AI image analysis.", path: "/dashboard/plant-disease" },
  { icon: Eye, title: "Animal Weight Estimation", desc: "Estimate animal weight accurately without physical scales.", path: "/dashboard/animal-weight" },
  { icon: Sprout, title: "Crop Recommendation", desc: "Get the best crop suggestions based on soil and climate data.", path: "/dashboard/crop-recommendation" },
  { icon: FlaskConical, title: "Soil Type Analysis", desc: "Analyze soil fertility and type using AI.", path: "/dashboard/soil-analysis" },
  { icon: Apple, title: "Fruit Quality Analysis", desc: "Classify fruit quality and detect defects.", path: "/dashboard/fruit-quality" },
  { icon: MessageCircle, title: "Smart Farm Chatbot", desc: "Ask questions and get instant farming advice.", path: "/dashboard/chatbot" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.user_metadata?.full_name || "John Farmer";

  return (
    <DashboardLayout title="Welcome">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Welcome, {userName}</h1>
        <p className="text-muted-foreground mb-8">Use AI to improve your farming decisions</p>

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
