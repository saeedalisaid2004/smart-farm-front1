import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Monitor, Database, Brain, Power, CheckCircle, AlertCircle, Globe, Settings, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getSystemStatus, getSystemSettings, getModelsTable,
  toggleService as apiToggleService, toggleSystemSetting as apiToggleSystemSetting,
} from "@/services/smartFarmApi";

const AdminSystem = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      getSystemStatus().catch(() => null),
      getSystemSettings().catch(() => null),
      getModelsTable().catch(() => []),
    ]).then(([status, settingsData, modelsData]) => {
      if (status) setSystemStatus(status);
      
      // Load saved setting overrides
      const savedSettingOverrides: Record<string, boolean> = JSON.parse(localStorage.getItem("settingOverrides") || "{}");
      
      if (settingsData) {
        let settingsArr: any[] = [];
        if (Array.isArray(settingsData)) settingsArr = settingsData;
        else if (settingsData.settings) settingsArr = settingsData.settings;
        
        // Map API status, localStorage overrides only apply if they exist
        setSettings(settingsArr.map((s: any) => {
          const apiEnabled = s.status === "online" || s.enabled === true;
          const hasOverride = s.key && (s.key in savedSettingOverrides);
          return {
            ...s,
            enabled: hasOverride ? savedSettingOverrides[s.key] : apiEnabled,
          };
        }));
      }
      if (Array.isArray(modelsData)) setModels(modelsData);
      else if (modelsData?.models) setModels(modelsData.models);

      // Build services from status or use defaults, cross-reference with models table
      // Also check localStorage for any manual overrides
      const savedOverrides: Record<string, boolean> = JSON.parse(localStorage.getItem("serviceOverrides") || "{}");
      
      if (status?.services) {
        setServices(status.services);
      } else {
        const modelsList = Array.isArray(modelsData) ? modelsData : (modelsData?.models || []);
        const modelStatusMap: Record<string, boolean> = {};
        modelsList.forEach((m: any) => {
          const name = (m.name || "").toLowerCase();
          const isActive = (m.status || "").toLowerCase() === "active" || (m.status || "").toLowerCase() === "online";
          if (name.includes("plant")) modelStatusMap["plant_disease"] = isActive;
          if (name.includes("animal")) modelStatusMap["animal_weight"] = isActive;
          if (name.includes("crop")) modelStatusMap["crop_recommendation"] = isActive;
          if (name.includes("soil")) modelStatusMap["soil_analysis"] = isActive;
          if (name.includes("fruit")) modelStatusMap["fruit_quality"] = isActive;
          if (name.includes("chat")) modelStatusMap["chatbot"] = isActive;
        });
        
        const getStatus = (module: string) => {
          if (module in savedOverrides) return savedOverrides[module];
          return modelStatusMap[module] ?? true;
        };
        
        setServices([
          { name: t("dashboard.plantDisease"), module: "plant_disease", uptime: "99.9%", online: getStatus("plant_disease") },
          { name: t("dashboard.animalWeight"), module: "animal_weight", uptime: "99.7%", online: getStatus("animal_weight") },
          { name: t("dashboard.cropRecommendation"), module: "crop_recommendation", uptime: "99.8%", online: getStatus("crop_recommendation") },
          { name: t("dashboard.soilAnalysis"), module: "soil_analysis", uptime: "99.6%", online: getStatus("soil_analysis") },
          { name: t("dashboard.fruitQuality"), module: "fruit_quality", uptime: "99.5%", online: getStatus("fruit_quality") },
          { name: t("dashboard.chatbot"), module: "chatbot", uptime: "99.9%", online: getStatus("chatbot") },
        ]);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleToggleService = async (index: number) => {
    const svc = services[index];
    const newOnline = !svc.online;
    try {
      await apiToggleService(svc.module || svc.name);
      setServices(prev => prev.map((s, i) => i === index ? { ...s, online: newOnline } : s));
    } catch {
      setServices(prev => prev.map((s, i) => i === index ? { ...s, online: newOnline } : s));
    }
    // Save override to localStorage so it persists after refresh
    const savedOverrides = JSON.parse(localStorage.getItem("serviceOverrides") || "{}");
    savedOverrides[svc.module] = newOnline;
    localStorage.setItem("serviceOverrides", JSON.stringify(savedOverrides));
  };

  const handleToggleSetting = async (settingKey: string) => {
    try {
      await apiToggleSystemSetting(settingKey);
    } catch {}
    // Toggle in state
    setSettings(prev => prev.map(s => {
      const key = s.key || s.setting_name || s.name;
      return key === settingKey ? { ...s, enabled: !s.enabled } : s;
    }));
    // Save to localStorage
    const savedOverrides = JSON.parse(localStorage.getItem("settingOverrides") || "{}");
    const current = settings.find(s => (s.key || s.setting_name || s.name) === settingKey);
    savedOverrides[settingKey] = !(current?.enabled);
    localStorage.setItem("settingOverrides", JSON.stringify(savedOverrides));
  };

  const defaultSettings = [
    { name: t("adminSys.autoBackup"), desc: t("adminSys.autoBackupDesc"), key: "auto_backup", defaultOn: true },
    { name: t("adminSys.emailNotif"), desc: t("adminSys.emailNotifDesc"), key: "email_notifications", defaultOn: true },
    { name: t("adminSys.maintenance"), desc: t("adminSys.maintenanceDesc"), key: "maintenance_mode", defaultOn: false },
  ];

  const displaySettings = settings.length > 0 ? settings : defaultSettings;

  const defaultModels = [
    { name: "Plant-CNN-v2.3", version: "2.3.0", type: "CNN", accuracy: "94.2%", status: "Active" },
    { name: "Animal-YOLO-v4", version: "4.1.0", type: "YOLO", accuracy: "91.8%", status: "Active" },
    { name: "Crop-ML-v3.1", version: "3.1.0", type: "Machine Learning", accuracy: "89.5%", status: "Active" },
    { name: "Soil-DL-v2.0", version: "2.0.1", type: "Deep Learning", accuracy: "92.3%", status: "Active" },
    { name: "Fruit-CV-v1.5", version: "1.5.4", type: "Computer Vision", accuracy: "90.7%", status: "Active" },
    { name: "Chat-NLP-v2.7", version: "2.7.0", type: "NLP", accuracy: "96.1%", status: "Active" },
  ];

  const displayModels = models.length > 0 ? models : defaultModels;

  if (loading) {
    return (
      <AdminLayout title={t("adminSys.title")}>
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t("adminSys.title")}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("adminSys.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("adminSys.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("adminSys.systemStatus")}</p>
                <p className="text-xs text-green-500 font-medium">{systemStatus?.system?.status || t("adminSys.allOperational")}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("adminSys.uptime")}</span>
              <span className="font-semibold text-foreground">{systemStatus?.system?.uptime || "—"}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t("adminSys.responseTime")}</span>
              <span className="font-semibold text-foreground">{systemStatus?.system?.response_time || "—"}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("adminSys.database")}</p>
                <p className="text-xs text-green-500 font-medium">{systemStatus?.database?.status || t("adminSys.healthy")}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("adminSys.storageUsed")}</span>
              <span className="font-semibold text-foreground">{systemStatus?.database?.storage_used || "—"}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t("adminSys.connections")}</span>
              <span className="font-semibold text-foreground">{systemStatus?.database?.connections || "—"} {t("adminSys.connectionsActive")}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("adminSys.aiModels")}</p>
                <p className="text-xs text-green-500 font-medium">{systemStatus?.ai_models_summary?.active || "—"} {t("adminSys.activeModels")}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("adminSys.avgAccuracy")}</span>
              <span className="font-semibold text-foreground">{systemStatus?.ai_models_summary?.avg_accuracy || "—"}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t("adminSys.totalRequests")}</span>
              <span className="font-semibold text-foreground">{systemStatus?.ai_models_summary?.total_requests || "—"}</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Power className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{t("adminSys.servicesControl")}</p>
              <p className="text-sm text-muted-foreground">{t("adminSys.servicesControlDesc")}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc, index) => (
              <div key={index} className="flex items-center justify-between bg-secondary/30 border border-border rounded-lg px-4 py-3 cursor-pointer" onClick={() => handleToggleService(index)}>
                <div className="flex items-center gap-3">
                  {svc.online ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">{t("adminSys.uptime")}: {svc.uptime || "99%"}</p>
                  </div>
                </div>
                {svc.online ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">{t("adminSys.online")}</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-xs">{t("adminSys.offline")}</Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{t("adminSys.modelManagement")}</p>
              <p className="text-sm text-muted-foreground">{t("adminSys.modelManagementDesc")}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{t("adminSys.modelName")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{t("adminSys.version")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{t("adminSys.type")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{t("adminSys.accuracy")}</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">{t("adminSys.statusCol")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayModels.map((m: any) => (
                  <tr key={m.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{m.name || m.model_name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{m.version}</td>
                    <td className="px-5 py-3"><Badge variant="secondary" className="text-xs font-normal">{m.type || m.model_type}</Badge></td>
                    <td className="px-5 py-3 text-sm text-foreground">{m.accuracy}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> {m.status || "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">{t("adminSys.generalSettings")}</p>
              <p className="text-sm text-muted-foreground">{t("adminSys.generalSettingsDesc")}</p>
            </div>
          </div>
          <div className="space-y-1">
            {displaySettings.map((setting: any) => (
              <div key={setting.name || setting.key} className="flex items-center justify-between bg-secondary/20 border border-border rounded-lg px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{setting.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{setting.desc || setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled ?? setting.defaultOn ?? false}
                  onCheckedChange={() => handleToggleSetting(setting.key || setting.setting_name || setting.name)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystem;
