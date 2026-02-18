import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, AlertTriangle, GitPullRequest, Briefcase, Database, Settings, Bell, PieChart, ShoppingBag, ShieldAlert, BrainCircuit, Layers, Target, Lightbulb, FileText } from 'lucide-react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/strategy', label: 'Strategy', icon: Target },
    { path: '/ideation-portal', label: 'Ideation Portal', icon: Lightbulb },
    { path: '/ideation-mgmt', label: 'Ideation Mgmt', icon: FileText },
    { path: '/portfolio', label: 'Portfolio', icon: PieChart },
    { path: '/ea', label: 'Enterprise Arch.', icon: Layers },
    { path: '/portal', label: 'Service Portal', icon: ShoppingBag },
    { path: '/services', label: 'Services', icon: Briefcase },
    { path: '/incident', label: 'Incident', icon: AlertCircle },
    { path: '/problem', label: 'Problem', icon: AlertTriangle },
    { path: '/change', label: 'Change', icon: GitPullRequest },
    { path: '/risk', label: 'Risk Mgmt', icon: ShieldAlert },
    { path: '/ai-governance', label: 'AI Governance', icon: BrainCircuit },
    { path: '/cmdb', label: 'CMDB', icon: Database },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">OneITSM</span>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-slate-800">
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
