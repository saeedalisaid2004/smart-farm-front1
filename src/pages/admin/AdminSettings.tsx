import AdminLayout from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Palette } from "lucide-react";

const AdminSettings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Your profile has been updated." });
  };

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Full Name</Label>
              <Input defaultValue="Farm Owner" className="h-11 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Email</Label>
              <Input defaultValue="owner@smartfarm.com" className="h-11 rounded-lg" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">Phone Number</Label>
              <Input defaultValue="+1234567890" className="h-11 rounded-lg" />
            </div>
            <Button onClick={handleSave} className="w-full h-11 rounded-lg text-sm font-medium">
              Save Profile
            </Button>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Palette className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">Theme Preference</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <input type="radio" name="theme" value="light" defaultChecked className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-foreground">Light Mode</span>
            </label>
            <label className="flex items-center gap-3 border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <input type="radio" name="theme" value="dark" className="w-4 h-4 accent-primary" />
              <span className="text-sm font-medium text-foreground">Dark Mode</span>
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
