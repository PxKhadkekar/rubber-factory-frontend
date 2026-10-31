import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get("/jobs/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-slate-400 font-medium animate-pulse">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500 dark:text-slate-400 font-medium">No analytics data available.</p>
      </div>
    );
  }

  const { jobsPerDay, stageBottlenecks, workerEfficiency } = analytics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">Track factory performance, bottlenecks, and worker efficiency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Jobs Per Day */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 border border-gray-100 dark:border-slate-800 transition-colors">
          <h2 className="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-4">Jobs Created Per Day</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={jobsPerDay} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc", borderRadius: "0.75rem" }} />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stage Bottlenecks */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 border border-gray-100 dark:border-slate-800 transition-colors">
          <h2 className="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-4">Stage Bottlenecks (Active Jobs)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stageBottlenecks}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={95}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="stage"
                >
                  {stageBottlenecks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc", borderRadius: "0.75rem" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Worker Efficiency */}
        <div className="bg-white dark:bg-slate-900 shadow-xl shadow-gray-200/40 dark:shadow-none rounded-2xl p-6 border border-gray-100 dark:border-slate-800 lg:col-span-2 transition-colors">
          <h2 className="text-lg leading-6 font-bold text-gray-900 dark:text-white mb-4">Worker Efficiency (Assigned Jobs)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workerEfficiency} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="workerName" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", color: "#f8fafc", borderRadius: "0.75rem" }} />
                <Legend />
                <Bar dataKey="active" stackId="a" fill="#f59e0b" name="Active Jobs" radius={[0, 0, 0, 0]} />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed Jobs" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
