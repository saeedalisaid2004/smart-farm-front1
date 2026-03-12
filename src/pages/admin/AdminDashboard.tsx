import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Activity, Cpu, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const statsCards = [
  { icon: Users, label: "Total Users", value: "1,247", sub: "registered", change: "+12%", changeColor: "text-primary" },
  { icon: Activity, label: "Total Analyses", value: "8,456", sub: "this month", change: "+23%", changeColor: "text-primary" },
  { icon: Cpu, label: "AI Services", value: "6 of 6", sub: "active", badge: "All Online", badgeColor: "text-primary" },
  { icon: TrendingUp, label: "Most Used", value: "Plant Disease", sub: "Detection", badge: "Top", badgeColor: "text-primary" },
];

const usageData = [
  { month: "Jan", value: 150 },
  { month: "Feb", value: 180 },
  { month: "Mar", value: 230 },
  { month: "Apr", value: 280 },
  { month: "May", value: 350 },
  { month: "Jun", value: 400 },
];

const serviceData = [
  { name: "Plant Disease", value: 25 },
  { name: "Chatbot", value: 21 },
  { name: "Animal Weight", value: 18 },
  { name: "Recommendation", value: 14 },
  { name: "Soil Analysis", value: 12 },
  { name: "Fruit Quality", value: 10 },
];

const COLORS = [
  "hsl(142, 71%, 35%)",
  "hsl(142, 71%, 45%)",
  "hsl(142, 71%, 55%)",
  "hsl(142, 71%, 65%)",
  "hsl(142, 71%, 75%)",
  "hsl(142, 71%, 85%)",
];

const activeUsersData = [
  { day: "Mon", users: 32 },
  { day: "Tue", users: 40 },
  { day: "Wed", users: 36 },
  { day: "Thu", users: 50 },
  { day: "Fri", users: 45 },
  { day: "Sat", users: 28 },
  { day: "Sun", users: 24 },
];

const recentActivity = [
  { name: "John Farmer", action: "Used Plant Disease Detection", time: "2 minutes ago" },
  { name: "Sarah Miller", action: "Completed Soil Analysis", time: "15 minutes ago" },
  { name: "Mike Johnson", action: "Requested Crop Recommendation", time: "1 hour ago" },
  { name: "Emma Wilson", action: "Used Animal Weight Estimation", time: "2 hours ago" },
  { name: "David Brown", action: "Analyzed Fruit Quality", time: "3 hours ago" },
];

const AdminDashboard = () => {
  return (
    <AdminLayout title="Admin Dashboard">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System-wide overview and analytics for Smart Farm AI platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div key={card.label} className="bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                {card.change && (
                  <span className={`text-xs font-semibold ${card.changeColor}`}>{card.change}</span>
                )}
                {card.badge && (
                  <span className={`text-xs font-semibold ${card.badgeColor}`}>{card.badge}</span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{card.label}</p>
                <p className="text-sm text-muted-foreground">{card.value} {card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Usage Over Time</h3>
                <p className="text-sm text-muted-foreground">Monthly AI analyses trend</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 46%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="hsl(142, 71%, 45%)" strokeWidth={2} dot={{ fill: "hsl(142, 71%, 45%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Service Distribution</h3>
                <p className="text-sm text-muted-foreground">Usage by AI service</p>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={serviceData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}%`} fontSize={11}>
                    {serviceData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Users Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Active Users</h3>
              <p className="text-sm text-muted-foreground">Daily active users this week</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={activeUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="day" stroke="hsl(220, 10%, 46%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="users" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent System Activity */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent System Activity</h3>
          <div className="divide-y divide-border">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.name}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
