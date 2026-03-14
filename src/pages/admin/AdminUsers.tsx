import AdminLayout from "@/components/admin/AdminLayout";
import { Users, UserCheck, UserX, Shield, Search, MoreVertical, Mail, Eye, UserMinus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

const statsCards = [
  { icon: Users, label: "Total Users", value: "1,247", iconColor: "text-primary", iconBg: "bg-primary/10" },
  { icon: UserCheck, label: "Active Users", value: "1,156", iconColor: "text-primary", iconBg: "bg-primary/10" },
  { icon: UserX, label: "Inactive Users", value: "91", iconColor: "text-destructive", iconBg: "bg-destructive/10" },
  { icon: Shield, label: "Admins", value: "12", iconColor: "text-primary", iconBg: "bg-primary/10" },
];

const mockUsers = [
  { id: 1, name: "John Farmer", email: "john.farmer@example.com", role: "Farmer", status: "Active", joined: "Jan 15, 2024" },
  { id: 2, name: "Sarah Miller", email: "sarah.miller@example.com", role: "Farmer", status: "Active", joined: "Feb 20, 2024" },
  { id: 3, name: "Mike Johnson", email: "mike.johnson@example.com", role: "Admin", status: "Active", joined: "Jan 10, 2024" },
  { id: 4, name: "Emma Wilson", email: "emma.wilson@example.com", role: "Farmer", status: "Active", joined: "Mar 5, 2024" },
  { id: 5, name: "David Brown", email: "david.brown@example.com", role: "Farmer", status: "Inactive", joined: "Feb 12, 2024" },
  { id: 6, name: "Lisa Anderson", email: "lisa.anderson@example.com", role: "Farmer", status: "Active", joined: "Mar 18, 2024" },
  { id: 7, name: "Tom Harris", email: "tom.harris@example.com", role: "Farmer", status: "Active", joined: "Jan 25, 2024" },
  { id: 8, name: "Rachel Green", email: "rachel.green@example.com", role: "Admin", status: "Active", joined: "Feb 8, 2024" },
];

const AdminUsers = () => {
  return (
    <AdminLayout title="User Management">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, and permissions across the Smart Farm AI platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full ${card.iconBg} flex items-center justify-center`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <span className="text-sm text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-12 h-12 rounded-lg border-0 bg-secondary" />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Joined</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockUsers.map((user) => (
                <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${
                        user.role === "Admin"
                          ? "border-primary/30 text-primary bg-primary/5"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {user.role === "Admin" && <Shield className="w-3 h-3 mr-1" />}
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${
                        user.status === "Active"
                          ? "border-primary/30 text-primary bg-primary/5"
                          : "border-destructive/30 text-destructive bg-destructive/5"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        user.status === "Active" ? "bg-primary" : "bg-destructive"
                      }`} />
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{user.joined}</td>
                  <td className="px-6 py-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-48 p-1">
                        <button
                          onClick={() => toast({ title: "View Profile", description: `Viewing ${user.name}'s profile` })}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          View Profile
                        </button>
                        <button
                          onClick={() => toast({ title: "Deactivate", description: `${user.name} has been deactivated` })}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground rounded-md hover:bg-secondary transition-colors"
                        >
                          <UserMinus className="w-4 h-4 text-muted-foreground" />
                          Deactivate
                        </button>
                        <button
                          onClick={() => toast({ title: "Delete User", description: `${user.name} has been deleted`, variant: "destructive" })}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-md hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete User
                        </button>
                      </PopoverContent>
                    </Popover>
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
