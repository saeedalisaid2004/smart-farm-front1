import AdminLayout from "@/components/admin/AdminLayout";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan", analyses: 1200 },
  { month: "Feb", analyses: 1450 },
  { month: "Mar", analyses: 1800 },
  { month: "Apr", analyses: 2100 },
  { month: "May", analyses: 2500 },
  { month: "Jun", analyses: 2800 },
];

const AdminReports = () => {
  return (
    <AdminLayout title="System Reports">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Reports</h1>
            <p className="text-muted-foreground mt-1">Detailed analytics and usage reports</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>

        {/* Monthly Analyses Chart */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-1">Monthly Analyses</h3>
          <p className="text-sm text-muted-foreground mb-6">Total analyses performed per month</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
              <XAxis dataKey="month" stroke="hsl(220, 10%, 46%)" fontSize={12} />
              <YAxis stroke="hsl(220, 10%, 46%)" fontSize={12} />
              <Tooltip />
              <Bar dataKey="analyses" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Analyses", value: "11,850" },
            { label: "Avg. Per Day", value: "65.8" },
            { label: "Peak Day", value: "Mar 15" },
            { label: "Growth Rate", value: "+18%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
