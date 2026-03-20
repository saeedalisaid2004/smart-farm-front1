import AdminLayout from "@/components/admin/AdminLayout";
import { Monitor, Database, Brain, Power, CheckCircle, AlertCircle, Globe, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const models = [
  { name: "Plant-CNN-v2.3", version: "2.3.0", type: "CNN", accuracy: "94.2%", status: "Active" },
  { name: "Animal-YOLO-v4", version: "4.1.0", type: "YOLO", accuracy: "91.8%", status: "Active" },
  { name: "Crop-ML-v3.1", version: "3.1.0", type: "Machine Learning", accuracy: "89.5%", status: "Active" },
  { name: "Soil-DL-v2.0", version: "2.0.1", type: "Deep Learning", accuracy: "92.3%", status: "Active" },
  { name: "Fruit-CV-v1.5", version: "1.5.4", type: "Computer Vision", accuracy: "90.7%", status: "Active" },
  { name: "Chat-NLP-v2.7", version: "2.7.0", type: "NLP", accuracy: "96.1%", status: "Active" },
];

const AdminSystem = () => {
  const { t } = useLanguage();

  const initialServices = [
    { name: t("dashboard.plantDisease"), uptime: "99.9%", online: true },
    { name: t("dashboard.animalWeight"), uptime: "99.7%", online: true },
    { name: t("dashboard.cropRecommendation"), uptime: "99.8%", online: true },
    { name: t("dashboard.soilAnalysis"), uptime: "99.6%", online: true },
    { name: t("dashboard.fruitQuality"), uptime: "99.5%", online: true },
    { name: t("dashboard.chatbot"), uptime: "99.9%", online: true },
  ];

  const systemSettings = [
    { name: t("adminSys.autoBackup"), desc: t("adminSys.autoBackupDesc"), defaultOn: true },
    { name: t("adminSys.emailNotif"), desc: t("adminSys.emailNotifDesc"), defaultOn: true },
    { name: t("adminSys.maintenance"), desc: t("adminSys.maintenanceDesc"), defaultOn: false },
  ];

  const [services, setServices] = useState(initialServices);

  const toggleService = (index: number) => {
    setServices(prev => prev.map((svc, i) => i === index ? { ...svc, online: !svc.online } : svc));
  };

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
                <p className="text-xs text-green-500 font-medium">{t("adminSys.allOperational")}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("adminSys.uptime")}</span>
              <span className="font-semibold text-foreground">99.8%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t("adminSys.responseTime")}</span>
              <span className="font-semibold text-foreground">145ms</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("adminSys.database")}</p>
                <p className="text-xs text-green-500 font-medium">{t("adminSys.healthy")}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("adminSys.storageUsed")}</span>
              <span className="font-semibold text-foreground">234 GB</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t("adminSys.connections")}</span>
              <span className="font-semibold text-foreground">156 {t("adminSys.connectionsActive")}</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t("adminSys.aiModels")}</p>
                <p className="text-xs text-green-500 font-medium">{t("adminSys.activeModels")}</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("adminSys.avgAccuracy")}</span>
              <span className="font-semibold text-foreground">92.4%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">{t("adminSys.totalRequests")}</span>
              <span className="font-semibold text-foreground">8,456</span>
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
              <div key={index} className="flex items-center justify-between bg-secondary/30 border border-border rounded-lg px-4 py-3 cursor-pointer" onClick={() => toggleService(index)}>
                <div className="flex items-center gap-3">
                  {svc.online ? <CheckCircle className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-destructive" />}
                  <div>
                    <p className="text-sm font-medium text-foreground">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">{t("adminSys.uptime")}: {svc.uptime}</p>
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
                {models.map((m) => (
                  <tr key={m.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{m.name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{m.version}</td>
                    <td className="px-5 py-3"><Badge variant="secondary" className="text-xs font-normal">{m.type}</Badge></td>
                    <td className="px-5 py-3 text-sm text-foreground">{m.accuracy}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="w-3.5 h-3.5" /> {m.status}
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
            {systemSettings.map((setting) => (
              <div key={setting.name} className="flex items-center justify-between bg-secondary/20 border border-border rounded-lg px-5 py-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{setting.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{setting.desc}</p>
                </div>
                <Switch defaultChecked={setting.defaultOn} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystem;
