import React from 'react';
import { MOCK_SERVICES, MOCK_CAPABILITIES, MOCK_PROCESSES } from '../constants';
import { Card, Badge } from './Shared';
import { Server, Activity, Users, ShieldCheck, Map, GitFork } from 'lucide-react';

const ServicePortfolioModule = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Service Portfolio</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SERVICES.map(service => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Server className="w-8 h-8 text-indigo-600" />
                </div>
                <Badge variant={service.health === 'Healthy' ? 'success' : service.health === 'Degraded' ? 'warning' : 'danger'}>
                  {service.health}
                </Badge>
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
              <p className="text-slate-500 text-sm mb-6 h-10">{service.description}</p>
              
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Users className="w-4 h-4" />
                    <span>Owner</span>
                  </div>
                  <span className="font-medium text-slate-900">{service.owner}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SLA Tier</span>
                  </div>
                  <span className="font-medium text-slate-900">{service.sla}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Activity className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <span className="font-medium text-slate-900">{service.status}</span>
                </div>

                {/* Enterprise Architecture Links */}
                {(service.relatedCapabilityIds?.length || service.relatedProcessIds?.length) ? (
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                     {service.relatedCapabilityIds && service.relatedCapabilityIds.length > 0 && (
                       <div>
                         <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                           <Map className="w-3 h-3" /> Capabilities
                         </div>
                         <div className="flex flex-wrap gap-1">
                           {service.relatedCapabilityIds.map(id => {
                             const cap = MOCK_CAPABILITIES.find(c => c.id === id);
                             return <Badge key={id} variant="neutral">{cap?.name || id}</Badge>;
                           })}
                         </div>
                       </div>
                     )}
                     {service.relatedProcessIds && service.relatedProcessIds.length > 0 && (
                       <div>
                         <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                           <GitFork className="w-3 h-3" /> Processes
                         </div>
                         <div className="flex flex-wrap gap-1">
                           {service.relatedProcessIds.map(id => {
                             const proc = MOCK_PROCESSES.find(p => p.id === id);
                             return <Badge key={id} variant="neutral">{proc?.name || id}</Badge>;
                           })}
                         </div>
                       </div>
                     )}
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServicePortfolioModule;
