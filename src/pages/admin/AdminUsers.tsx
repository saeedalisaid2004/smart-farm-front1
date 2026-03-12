import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Search, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockUsers = [
  { id: 1, name: "John Farmer", email: "john@farm.com", role: "Farmer", status: "Active", joined: "2026-01-15", analyses: 45 },
  { id: 2, name: "Sarah Miller", email: "sarah@farm.com", role: "Farmer", status: "Active", joined: "2026-02-01", analyses: 32 },
  { id: 3, name: "Mike Johnson", email: "mike@farm.com", role: "Farmer", status: "Active", joined: "2026-02-10", analyses: 28 },
  { id: 4, name: "Emma Wilson", email: "emma@farm.com", role: "Farmer", status: "Inactive", joined: "2026-01-20", analyses: 15 },
  { id: 5, name: "David Brown", email: "david@farm.com", role: "Farmer", status: "Active", joined: "2026-03-01", analyses: 12 },
];

const AdminUsers = () => {
  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage and monitor all registered users</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold text-foreground mt-1">1,247</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold text-primary mt-1">1,180</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-sm text-muted-foreground">New This Month</p>
            <p className="text-2xl font-bold text-foreground mt-1">89</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-10 h-10 rounded-lg" />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">User</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Role</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Joined</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Analyses</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary text-sm font-semibold">{user.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{user.role}</td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === "Active" ? "default" : "secondary"} className="text-xs">
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.joined}</td>
                  <td className="px-6 py-4 text-sm text-foreground">{user.analyses}</td>
                  <td className="px-6 py-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
