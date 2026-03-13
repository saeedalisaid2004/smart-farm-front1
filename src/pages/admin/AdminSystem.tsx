import AdminLayout from "@/components/admin/AdminLayout";
import { Monitor, Database, Brain, Power, CheckCircle, Globe, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const services = [
  { name: "Plant Disease Detection", uptime: "99.9%" },
  { name: "Animal Weight Estimation", uptime: "99.7%" },
  { name: "Crop Recommendation", uptime: "99.8%" },
  { name: "Soil Type Analysis", uptime: "99.6%" },
  { name: "Fruit Quality Analysis", uptime: "99.5%" },
  { name: "Smart Farm Chatbot", uptime: "99.9%" },
];

const models = [
  { name: "Plant-CNN-v2.3", version: "2.3.0", type: "CNN", accuracy: "94.2%", status: "Active" },
  { name: "Animal-YOLO-v4", version: "4.1.0", type: "YOLO", accuracy: "91.8%", status: "Active" },
  { name: "Crop-ML-v3.1", version: "3.1.0", type: "Machine Learning", accuracy: "89.5%", status: "Active" },
  { name: "Soil-DL-v2.0", version: "2.0.1", type: "Deep Learning", accuracy: "92.3%", status: "Active" },
  { name: "Fruit-CV-v1.5", version: "1.5.4", type: "Computer Vision", accuracy: "90.7%", status: "Active" },
  { name: "Chat-NLP-v2.7", version: "2.7.0", type: "NLP", accuracy: "96.1%", status: "Active" },
];

const systemSettings = [
  { name: "Auto-backup Database", desc: "Automatically backup database daily", defaultOn: true },
  { name: "Email Notifications", desc: "Send system alerts via email", defaultOn: true },
  { name: "API Rate Limiting", desc: "Limit API requests per user", defaultOn: true },
  { name: "Maintenance Mode", desc: "Enable system maintenance mode", defaultOn: false },
  { name: "Debug Logging", desc: "Enable detailed system logs", defaultOn: false },
];

const AdminSystem = () => {
  return (
    <AdminLayout title="System Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage all AI services and system components</p>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">System Status</p>
                <p className="text-xs text-green-500 font-medium">All Systems Operational</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Uptime</span>
              <span className="font-semibold text-foreground">99.8%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Response Time</span>
              <span className="font-semibold text-foreground">145ms</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Database</p>
                <p className="text-xs text-green-500 font-medium">Healthy</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Storage Used</span>
              <span className="font-semibold text-foreground">234 GB</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Connections</span>
              <span className="font-semibold text-foreground">156 active</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Models</p>
                <p className="text-xs text-green-500 font-medium">6 of 6 Active</p>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Accuracy</span>
              <span className="font-semibold text-foreground">92.4%</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-muted-foreground">Total Requests</span>
              <span className="font-semibold text-foreground">8,456</span>
            </div>
          </div>
        </div>

        {/* AI Services Control */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Power className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">AI Services Control</p>
              <p className="text-sm text-muted-foreground">Enable or disable individual AI services</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center justify-between bg-secondary/30 border border-border rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">Uptime: {svc.uptime}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs">online</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* AI Model Management */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Globe className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">AI Model Management</p>
              <p className="text-sm text-muted-foreground">Monitor and manage deployed AI models</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50 border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Model Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Version</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Accuracy</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {models.map((m) => (
                  <tr key={m.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-foreground">{m.name}</td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">{m.version}</td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="text-xs font-normal">{m.type}</Badge>
                    </td>
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

        {/* General System Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">General System Settings</p>
              <p className="text-sm text-muted-foreground">Configure system-wide preferences</p>
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
