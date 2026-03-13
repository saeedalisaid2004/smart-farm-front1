import AdminLayout from "@/components/admin/AdminLayout";
import { TrendingUp, Users, Globe, Activity, Filter, FileText, Calendar, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const dailyData = [
  { day: "Jun 1", activity: 240 },
  { day: "Jun 2", activity: 265 },
  { day: "Jun 3", activity: 250 },
  { day: "Jun 4", activity: 300 },
  { day: "Jun 5", activity: 270 },
  { day: "Jun 6", activity: 210 },
  { day: "Jun 7", activity: 180 },
];

const generatedReports = [
  { name: "Monthly Usage Report", date: "Jun 1, 2024", tag: "Usage", size: "2.4 MB" },
  { name: "User Activity Analysis", date: "Jun 1, 2024", tag: "Users", size: "1.8 MB" },
  { name: "AI Model Performance", date: "May 25, 2024", tag: "Performance", size: "3.2 MB" },
  { name: "System Health Report", date: "May 20, 2024", tag: "System", size: "1.5 MB" },
  { name: "Revenue Analytics", date: "May 15, 2024", tag: "Finance", size: "2.1 MB" },
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

        {/* Daily Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Daily Activity</h3>
              <p className="text-sm text-muted-foreground">Platform activity over the past week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="activity" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Generated Reports */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Generated Reports</h3>
                <p className="text-sm text-muted-foreground">Download historical reports</p>
              </div>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-5">
              Generate New Report
            </Button>
          </div>

          <div className="space-y-3">
            {generatedReports.map((report) => (
              <div key={report.name} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{report.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{report.date}</span>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">{report.tag}</Badge>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button className="w-full flex items-center justify-center gap-2 bg-secondary/50 hover:bg-secondary text-sm text-muted-foreground py-2.5 rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
