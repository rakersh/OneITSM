import React, { useState } from 'react';
import { MOCK_CAPABILITIES, MOCK_PROCESSES, MOCK_SERVICES } from '../constants';
import { BusinessCapability, BusinessProcess } from '../types';
import { Card, Badge, Button } from './Shared';
import { Layers, GitFork, ChevronRight, ChevronDown, Map, Activity, Server } from 'lucide-react';

const EnterpriseArchitectureModule = () => {
  const [activeTab, setActiveTab] = useState<'capabilities' | 'processes'>('capabilities');

  // Capability Map Component
  const CapabilityMap = () => {
    // Group capabilities by Area
    const groupedCapabilities = MOCK_CAPABILITIES.reduce((acc, cap) => {
      if (!acc[cap.area]) {
        acc[cap.area] = [];
      }
      acc[cap.area].push(cap);
      return acc;
    }, {} as Record<string, BusinessCapability[]>);

    const getMaturityColor = (maturity: string) => {
      switch(maturity) {
        case 'High': return 'bg-green-100 text-green-800 border-green-200';
        case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Low': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-slate-100 text-slate-800 border-slate-200';
      }
    };

    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(groupedCapabilities).map(([area, caps]) => (
            <Card key={area} className="flex flex-col h-full">
              <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h3 className="font-bold text-lg text-slate-900">{area}</h3>
              </div>
              <div className="p-4 flex-1 space-y-3">
                {caps.map(cap => {
                  const relatedServices = cap.relatedServiceIds?.map(id => MOCK_SERVICES.find(s => s.id === id)).filter(Boolean);
                  return (
                    <div key={cap.id} className="p-3 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800 text-sm">{cap.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getMaturityColor(cap.maturity)}`}>
                          {cap.maturity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-2">{cap.description}</p>
                      
                      {relatedServices && relatedServices.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {relatedServices.map(svc => (
                            <Badge key={svc!.id} variant="neutral">
                              <div className="flex items-center gap-1">
                                <Server className="w-3 h-3" /> {svc!.name}
                              </div>
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">{cap.id}</span>
                        {cap.strategicImportance === 'Critical' && (
                          <Badge variant="danger">Critical</Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Process Hierarchy Component
  const ProcessHierarchy = () => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
      setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Build tree
    const rootProcesses = MOCK_PROCESSES.filter(p => !p.parentId);
    
    const renderProcess = (process: BusinessProcess, level: number = 0) => {
      const children = MOCK_PROCESSES.filter(p => p.parentId === process.id);
      const hasChildren = children.length > 0;
      const isExpanded = expanded[process.id];
      
      // Helper to get service names
      const relatedServices = process.relatedServiceIds?.map(id => MOCK_SERVICES.find(s => s.id === id)).filter(Boolean);

      return (
        <div key={process.id} className="select-none">
          <div 
            className={`flex items-center p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${level > 0 ? 'bg-slate-50/30' : 'bg-white'}`}
            style={{ paddingLeft: `${level * 20 + 12}px` }}
            onClick={() => hasChildren && toggleExpand(process.id)}
          >
            <div className="mr-2 w-5 flex justify-center">
              {hasChildren && (
                isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 text-sm">{process.name}</span>
                <span className="text-xs text-slate-400 font-mono">({process.id})</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{process.description}</p>
            </div>
            <div className="flex items-center gap-4 pr-4">
              {relatedServices && relatedServices.length > 0 && (
                 <div className="flex gap-1">
                   {relatedServices.map(svc => (
                     <Badge key={svc!.id} variant="neutral">
                       <div className="flex items-center gap-1">
                         <Server className="w-3 h-3" /> {svc!.name}
                       </div>
                     </Badge>
                   ))}
                 </div>
               )}
              <div className="text-xs text-slate-500">
                <span className="font-semibold">Owner:</span> {process.owner}
              </div>
              <Badge variant={process.criticality === 'Critical' ? 'danger' : process.criticality === 'High' ? 'warning' : 'default'}>
                {process.criticality}
              </Badge>
            </div>
          </div>
          {isExpanded && children.map(child => renderProcess(child, level + 1))}
        </div>
      );
    };

    return (
      <Card className="overflow-hidden">
        <div className="bg-slate-50 p-3 border-b border-slate-200 font-semibold text-sm text-slate-700 flex">
          <div className="pl-10 flex-1">Process Name</div>
          <div className="pr-4 w-48">Details</div>
        </div>
        <div className="divide-y divide-slate-100">
          {rootProcesses.map(p => renderProcess(p))}
        </div>
      </Card>
    );
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Enterprise Architecture</h2>
          <p className="text-slate-500 text-sm">Business Capabilities & Process Maps</p>
        </div>
        <div className="flex bg-white rounded-lg border border-slate-200 p-1">
          <button
            onClick={() => setActiveTab('capabilities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'capabilities' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Map className="w-4 h-4" /> Capability Map
          </button>
          <button
            onClick={() => setActiveTab('processes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'processes' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GitFork className="w-4 h-4" /> Process Hierarchy
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'capabilities' ? <CapabilityMap /> : <ProcessHierarchy />}
      </div>
    </div>
  );
};

export default EnterpriseArchitectureModule;
