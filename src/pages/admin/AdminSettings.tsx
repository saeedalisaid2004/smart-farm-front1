import AdminLayout from "@/components/admin/AdminLayout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Settings, User, Palette, Globe, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

        {/* Language Selection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Globe className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">Language Selection</h3>
          </div>
          <Select defaultValue="en">
            <SelectTrigger className="h-11 rounded-lg">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notification Preferences */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <Bell className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-semibold text-foreground">Notification Preferences</h3>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <span className="text-sm font-medium text-foreground">Push Notifications</span>
              <Checkbox defaultChecked className="h-5 w-5" />
            </label>
            <label className="flex items-center justify-between border border-border rounded-lg px-4 py-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <span className="text-sm font-medium text-foreground">Email Alerts</span>
              <Checkbox defaultChecked className="h-5 w-5" />
            </label>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
