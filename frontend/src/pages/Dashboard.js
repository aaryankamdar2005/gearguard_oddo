import { useEffect, useState } from 'react';
import { axiosInstance } from '../App';
import { Users, Wrench, AlertCircle, CheckCircle, ClipboardList, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const statCards = [
    {
      title: 'Total Equipment',
      value: stats?.total_equipment || 0,
      icon: Wrench,
      color: 'bg-blue-100 text-blue-700',
      iconBg: 'bg-blue-600',
    },
    {
      title: 'Maintenance Teams',
      value: stats?.total_teams || 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-700',
      iconBg: 'bg-purple-600',
    },
    {
      title: 'Total Requests',
      value: stats?.total_requests || 0,
      icon: ClipboardList,
      color: 'bg-slate-100 text-slate-700',
      iconBg: 'bg-slate-600',
    },
    {
      title: 'New Requests',
      value: stats?.new_requests || 0,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-700',
      iconBg: 'bg-orange-500',
    },
    {
      title: 'In Progress',
      value: stats?.in_progress_requests || 0,
      icon: Activity,
      color: 'bg-yellow-100 text-yellow-700',
      iconBg: 'bg-yellow-600',
    },
    {
      title: 'Repaired',
      value: stats?.repaired_requests || 0,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-700',
      iconBg: 'bg-green-600',
    },
  ];

  return (
    <div className="p-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="font-heading font-bold text-4xl text-slate-900 mb-3" data-testid="dashboard-title">
            Dashboard
          </h1>
          <p className="font-body text-slate-600">Overview of your maintenance operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="font-mono text-xs uppercase tracking-wider text-slate-500 mb-2">
                {stat.title}
              </div>
              <div className="font-heading font-bold text-3xl text-slate-900">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <h3 className="font-heading font-semibold text-xl text-slate-900 mb-4" data-testid="request-type-heading">
              Request Types
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-body text-slate-600">Corrective (Breakdown)</span>
                <span className="font-mono text-sm font-medium bg-orange-100 text-orange-700 px-3 py-1 rounded">
                  {stats?.corrective_requests || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-slate-600">Preventive (Scheduled)</span>
                <span className="font-mono text-sm font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  {stats?.preventive_requests || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 rounded-lg p-6 shadow-sm text-white">
            <h3 className="font-heading font-semibold text-xl mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <a
                href="/requests"
                className="block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md p-3 transition-all"
                data-testid="quick-action-new-request"
              >
                <span className="font-medium">Create New Request</span>
              </a>
              <a
                href="/equipment"
                className="block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md p-3 transition-all"
                data-testid="quick-action-add-equipment"
              >
                <span className="font-medium">Add Equipment</span>
              </a>
              <a
                href="/calendar"
                className="block bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md p-3 transition-all"
                data-testid="quick-action-view-calendar"
              >
                <span className="font-medium">View Calendar</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}