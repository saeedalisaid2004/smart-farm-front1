import AdminLayout from "@/components/admin/AdminLayout";
import { Cpu, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const services = [
  { name: "Plant Disease Detection", status: "Online", uptime: "99.9%", requests: "3,245" },
  { name: "Animal Weight Estimation", status: "Online", uptime: "99.7%", requests: "1,890" },
  { name: "Crop Recommendation", status: "Online", uptime: "99.8%", requests: "1,456" },
  { name: "Soil Type Analysis", status: "Online", uptime: "99.5%", requests: "1,102" },
  { name: "Fruit Quality Analysis", status: "Online", uptime: "99.6%", requests: "876" },
  { name: "Smart Farm Chatbot", status: "Online", uptime: "99.9%", requests: "2,187" },
];

const AdminSystem = () => {
  return (
    <AdminLayout title="System Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Management</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage AI services and system health</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Services Online</p>
            <p className="text-2xl font-bold text-primary mt-1">6 / 6</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Avg Uptime</p>
            <p className="text-2xl font-bold text-foreground mt-1">99.7%</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Total Requests Today</p>
            <p className="text-2xl font-bold text-foreground mt-1">10,756</p>
          </div>
        </div>

        {/* Services Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Service</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Uptime</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Requests (Month)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {services.map((svc) => (
                <tr key={svc.name} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Cpu className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{svc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="text-xs gap-1">
                      <CheckCircle className="w-3 h-3" /> {svc.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{svc.uptime}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{svc.requests}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSystem;
