import AdminLayout from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings saved", description: "System settings have been updated." });
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform-wide settings</p>
        </div>

        {/* General */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">General</h3>
          <div className="space-y-2">
            <Label>Platform Name</Label>
            <Input defaultValue="Smart Farm AI" className="h-10" />
          </div>
          <div className="space-y-2">
            <Label>Support Email</Label>
            <Input defaultValue="support@smartfarm.ai" className="h-10" />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Email alerts for new users</p>
              <p className="text-xs text-muted-foreground">Get notified when new users register</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">System health alerts</p>
              <p className="text-xs text-muted-foreground">Get notified about system issues</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Button onClick={handleSave} className="rounded-lg">Save Settings</Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
