import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, Users, Globe, Activity, Filter } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from "recharts";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const usageData = [
  { service: "Plant Disease", value: 340 },
  { service: "Animal Weight", value: 250 },
  { service: "Crop Rec.", value: 190 },
  { service: "Soil Analysis", value: 160 },
  { service: "Fruit Quality", value: 140 },
  { service: "Chatbot", value: 310 },
];

const growthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 240 },
  { month: "Apr", users: 300 },
  { month: "May", users: 380 },
  { month: "Jun", users: 420 },
];

const statsCards = [
  { icon: TrendingUp, label: "Total Analyses", value: "8,456", change: "+23% from last month", color: "text-green-600", bg: "bg-green-50" },
  { icon: Users, label: "Active Users", value: "1,247", change: "+12% from last month", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Globe, label: "AI Services", value: "6 Active", change: "99.8% uptime", color: "text-green-600", bg: "bg-green-50" },
  { icon: Activity, label: "Avg Response", value: "145ms", change: "-8% from last month", color: "text-green-600", bg: "bg-orange-50" },
];

const AdminReports = () => {
  return (
    <AdminLayout title="System Reports">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Reports</h1>
          <p className="text-muted-foreground mt-1">Comprehensive analytics and reporting for the Smart Farm AI platform</p>
        </div>

        {/* Report Filters */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Report Filters</h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1.5">Date Range</p>
            <Select defaultValue="30">
              <SelectTrigger className="w-64 h-10">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-xs mt-1 ${stat.color}`}>{stat.change}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Usage by Service */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Usage by Service</h3>
                <p className="text-sm text-muted-foreground">Total analyses per service</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="service" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">User Growth</h3>
                <p className="text-sm text-muted-foreground">New user registrations</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
