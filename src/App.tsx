import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { lazy, Suspense } from "react";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import AnalysisSkeleton from "@/components/AnalysisSkeleton";

// Eager-loaded (critical path)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PlantDisease = lazy(() => import("./pages/PlantDisease"));
const AnimalWeight = lazy(() => import("./pages/AnimalWeight"));
const CropRecommendation = lazy(() => import("./pages/CropRecommendation"));
const SoilAnalysis = lazy(() => import("./pages/SoilAnalysis"));
const FruitQuality = lazy(() => import("./pages/FruitQuality"));
const SmartFarmChatbot = lazy(() => import("./pages/SmartFarmChatbot"));
const DashboardReports = lazy(() => import("./pages/DashboardReports"));
const DashboardSettings = lazy(() => import("./pages/DashboardSettings"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));

const queryClient = new QueryClient();

const PageLoader = ({ skeleton }: { skeleton?: "dashboard" | "analysis" }) => (
  <div className="min-h-screen bg-background p-8">
    {skeleton === "dashboard" ? <DashboardSkeleton /> : skeleton === "analysis" ? <AnalysisSkeleton /> : <DashboardSkeleton />}
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="dashboard" />}><Dashboard /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/plant-disease" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="analysis" />}><PlantDisease /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/animal-weight" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="analysis" />}><AnimalWeight /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/crop-recommendation" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="analysis" />}><CropRecommendation /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/soil-analysis" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="analysis" />}><SoilAnalysis /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/fruit-quality" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="analysis" />}><FruitQuality /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/chatbot" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><SmartFarmChatbot /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><DashboardReports /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><DashboardSettings /></Suspense></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><Profile /></Suspense></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Suspense fallback={<PageLoader skeleton="dashboard" />}><AdminDashboard /></Suspense></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminUsers /></Suspense></ProtectedRoute>} />
            <Route path="/admin/system" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminSystem /></Suspense></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminReports /></Suspense></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminProfile /></Suspense></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><Suspense fallback={<PageLoader />}><AdminSettings /></Suspense></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
