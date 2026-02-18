import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from './Shared';
import { AlertCircle, Clock, AlertTriangle, ShieldAlert, PieChart as PieChartIcon } from 'lucide-react';
import { MOCK_INCIDENTS, MOCK_CHANGES, MOCK_SERVICES, MOCK_PROBLEMS, MOCK_RISKS, MOCK_EPICS } from '../constants';

const Dashboard = () => {
  const incidentStats = [
    { name: 'Critical', value: MOCK_INCIDENTS.filter(i => i.priority === 'Critical').length, color: '#ef4444' },
    { name: 'High', value: MOCK_INCIDENTS.filter(i => i.priority === 'High').length, color: '#f97316' },
    { name: 'Medium', value: MOCK_INCIDENTS.filter(i => i.priority === 'Medium').length, color: '#eab308' },
    { name: 'Low', value: MOCK_INCIDENTS.filter(i => i.priority === 'Low').length, color: '#22c55e' },
  ];

  const serviceHealth = [
    { name: 'Healthy', value: MOCK_SERVICES.filter(s => s.health === 'Healthy').length, color: '#22c55e' },
    { name: 'Degraded', value: MOCK_SERVICES.filter(s => s.health === 'Degraded').length, color: '#eab308' },
    { name: 'Down', value: MOCK_SERVICES.filter(s => s.health === 'Down').length, color: '#ef4444' },
  ];

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          title="Open Incidents" 
          value={MOCK_INCIDENTS.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length} 
          icon={AlertCircle} 
          color="bg-red-500" 
        />
        <StatCard 
          title="Open Problems" 
          value={MOCK_PROBLEMS.filter(p => p.status !== 'Resolved' && p.status !== 'Closed').length} 
          icon={AlertTriangle} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Open Changes" 
          value={MOCK_CHANGES.filter(c => c.status !== 'Implemented').length} 
          icon={Clock} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Open Risks" 
          value={MOCK_RISKS.filter(r => r.status !== 'Closed').length} 
          icon={ShieldAlert} 
          color="bg-amber-500" 
        />
        <StatCard 
          title="Open Epics" 
          value={MOCK_EPICS.filter(e => e.status !== 'Done').length} 
          icon={PieChartIcon} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Incident Priority Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {incidentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Service Health Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceHealth}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {serviceHealth.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
