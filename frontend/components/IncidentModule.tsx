import React, { useState, useEffect, useRef } from 'react';
import { MOCK_INCIDENTS, MOCK_SERVICES, MOCK_CIS, MOCK_PROBLEMS, MOCK_CHANGES } from '../constants';
import { Incident, Priority, Status } from '../types';
import { Card, Badge, Button, AIResponseBox } from './Shared';
import { Plus, Search, Sparkles, Save, X, Edit2, Link as LinkIcon, Server, AlertTriangle, GitPullRequest, Network, Check } from 'lucide-react';
import { analyzeIncident } from '../services/geminiService';
import * as d3 from 'd3';

const IncidentGraphModal = ({ incident, onClose }: { incident: Incident, onClose: () => void }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 900;
    const height = 600;

    // Clear previous
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height]);

    // Prepare Data
    const nodes: any[] = [{ id: incident.id, label: incident.title, type: 'Incident', group: 'incident' }];
    const links: any[] = [];

    // Service
    if (incident.serviceId) {
      const service = MOCK_SERVICES.find(s => s.id === incident.serviceId);
      if (service) {
        nodes.push({ id: service.id, label: service.name, type: 'Service', group: 'service' });
        links.push({ source: incident.id, target: service.id });
      }
    }

    // Problem
    if (incident.problemId) {
      const problem = MOCK_PROBLEMS.find(p => p.id === incident.problemId);
      if (problem) {
        nodes.push({ id: problem.id, label: problem.title, type: 'Problem', group: 'problem' });
        links.push({ source: incident.id, target: problem.id });
      }
    }

    // CIs (Linked to Service if exists, else Incident)
    incident.relatedCiIds?.forEach(ciId => {
      const ci = MOCK_CIS.find(c => c.id === ciId);
      if (ci) {
        nodes.push({ id: ci.id, label: ci.name, type: 'CI', group: 'ci' });
        // Link to Service if available to show "Service with related CIs", else Incident
        const targetId = incident.serviceId ? incident.serviceId : incident.id;
        // Avoid self-loop if serviceId is missing and we link to incident (which is already source) - logic handles it by distinct IDs
        links.push({ source: targetId, target: ci.id });
      }
    });

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Arrow markers
    svg.append("defs").selectAll("marker")
      .data(["end"])
      .enter().append("marker")
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94a3b8");

    const link = svg.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#end)");

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(drag(simulation) as any);

    // Node Circles
    node.append("circle")
      .attr("r", 20)
      .attr("fill", (d: any) => {
        switch (d.group) {
          case 'incident': return '#ef4444'; // Red
          case 'service': return '#3b82f6'; // Blue
          case 'problem': return '#f97316'; // Orange
          case 'ci': return '#64748b'; // Slate
          default: return '#94a3b8';
        }
      });

    // Icons/Text inside circles
    node.append("text")
      .attr("dy", 4)
      .attr("dx", 0)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .text((d: any) => d.type[0]);

    // Labels
    node.append("text")
      .text((d: any) => d.label)
      .attr("x", 25)
      .attr("y", 5)
      .attr("stroke", "none")
      .attr("fill", "#1e293b")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .style("pointer-events", "none");
    
    node.append("text")
      .text((d: any) => d.type)
      .attr("x", 25)
      .attr("y", 18)
      .attr("stroke", "none")
      .attr("fill", "#64748b")
      .attr("font-size", "10px")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

  }, [incident]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[700px] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-900">Incident Context: {incident.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative bg-slate-50/50">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Incident</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Service</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Problem</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-500"></div> Configuration Item</div>
            </div>
          </div>
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>
      </div>
    </div>
  );
};

const IncidentLifecycle = ({ status }: { status: Status }) => {
  const steps = ['New', 'In Progress', 'Resolved', 'Closed'];
  
  // Map status to index
  let activeIndex = steps.indexOf(status);
  if (status === 'Pending') activeIndex = 1; // Treat Pending as part of In Progress phase visually
  if (activeIndex === -1) activeIndex = 0;

  return (
    <div className="w-full py-6 px-4 bg-slate-50/50 border-b border-slate-100">
      <div className="relative flex items-center justify-between max-w-3xl mx-auto">
        {/* Progress Bar Background */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500" 
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;
          const isPending = status === 'Pending' && isCurrent;
          
          return (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 ${
                isCompleted ? 'bg-blue-600 border-blue-600 text-white' :
                isCurrent ? (isPending ? 'bg-amber-100 border-amber-500 text-amber-600' : 'bg-white border-blue-600 text-blue-600') :
                'bg-white border-slate-200 text-slate-300'
              }`}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <span className={`text-xs font-medium mt-2 ${
                isCurrent ? (isPending ? 'text-amber-600' : 'text-blue-700') : 
                isCompleted ? 'text-blue-600' : 'text-slate-400'
              }`}>
                {step} {isPending && '(Pending)'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface IncidentFormProps {
  initialData?: Incident | null;
  onSubmit: (data: Incident) => void;
  onCancel: () => void;
}

const IncidentForm: React.FC<IncidentFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Incident>>(
    initialData || {
      title: '',
      description: '',
      priority: 'Medium',
      status: 'New',
      assignee: '',
      serviceId: '',
      relatedCiIds: [],
      problemId: '',
      changeId: ''
    }
  );

  const handleChange = (field: keyof Incident, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleCi = (ciId: string) => {
    const currentCis = formData.relatedCiIds || [];
    const newCis = currentCis.includes(ciId)
      ? currentCis.filter(id => id !== ciId)
      : [...currentCis, ciId];
    handleChange('relatedCiIds', newCis);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    const incidentData = {
      ...formData,
      id: formData.id || `INC${Math.floor(Math.random() * 1000000)}`,
      created: formData.created || new Date().toISOString(),
    } as Incident;

    onSubmit(incidentData);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">
          {initialData ? 'Edit Incident' : 'Create New Incident'}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Save Incident
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <form className="space-y-6 max-w-4xl mx-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Incident summary"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Detailed description of the issue"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as Status)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
              <input
                type="text"
                value={formData.assignee}
                onChange={(e) => handleChange('assignee', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Assigned to..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Affected Service</label>
              <select
                value={formData.serviceId}
                onChange={(e) => handleChange('serviceId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Service...</option>
                {MOCK_SERVICES.map(svc => (
                  <option key={svc.id} value={svc.id}>{svc.name} ({svc.id})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Relationships */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-slate-500" />
              Relationships & Links
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CIs */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Affected Configuration Items (CIs)</label>
                <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                  {MOCK_CIS.map(ci => (
                    <label key={ci.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.relatedCiIds?.includes(ci.id)}
                        onChange={() => toggleCi(ci.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{ci.name}</div>
                        <div className="text-xs text-slate-500">{ci.type} • {ci.id}</div>
                      </div>
                      <Badge variant={ci.status === 'Active' ? 'success' : 'neutral'}>{ci.status}</Badge>
                    </label>
                  ))}
                </div>
              </div>

              {/* Problem Link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Linked Problem</label>
                <select
                  value={formData.problemId}
                  onChange={(e) => handleChange('problemId', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None</option>
                  {MOCK_PROBLEMS.map(prob => (
                    <option key={prob.id} value={prob.id}>{prob.title} ({prob.id})</option>
                  ))}
                </select>
              </div>

              {/* Change Link */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Linked Change Request</label>
                <select
                  value={formData.changeId}
                  onChange={(e) => handleChange('changeId', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">None</option>
                  {MOCK_CHANGES.map(chg => (
                    <option key={chg.id} value={chg.id}>{chg.title} ({chg.id})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

const IncidentModule = () => {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [showGraph, setShowGraph] = useState(false);

  const handleAnalyze = async (incident: Incident) => {
    setIsAnalyzing(true);
    const analysis = await analyzeIncident(incident.title, incident.description);
    const updatedIncidents = incidents.map(i => 
      i.id === incident.id ? { ...i, aiAnalysis: analysis } : i
    );
    setIncidents(updatedIncidents);
    setSelectedIncident({ ...incident, aiAnalysis: analysis });
    setIsAnalyzing(false);
  };

  const handleCreate = (newIncident: Incident) => {
    setIncidents([newIncident, ...incidents]);
    setViewMode('list');
    setSelectedIncident(newIncident);
  };

  const handleUpdate = (updatedIncident: Incident) => {
    const updatedList = incidents.map(i => i.id === updatedIncident.id ? updatedIncident : i);
    setIncidents(updatedList);
    setViewMode('list');
    setSelectedIncident(updatedIncident);
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'Critical': return 'danger';
      case 'High': return 'warning';
      case 'Medium': return 'default';
      default: return 'success';
    }
  };

  const getServiceName = (id?: string) => MOCK_SERVICES.find(s => s.id === id)?.name || id || 'N/A';
  const getProblemTitle = (id?: string) => MOCK_PROBLEMS.find(p => p.id === id)?.title || id;
  const getChangeTitle = (id?: string) => MOCK_CHANGES.find(c => c.id === id)?.title || id;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {showGraph && selectedIncident && (
        <IncidentGraphModal incident={selectedIncident} onClose={() => setShowGraph(false)} />
      )}

      {/* List View */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Incidents</h2>
          <Button 
            variant="primary" 
            className="h-9 w-9 p-0 rounded-full"
            onClick={() => {
              setSelectedIncident(null);
              setViewMode('create');
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search incidents..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {incidents.map(incident => (
            <div 
              key={incident.id}
              onClick={() => {
                setSelectedIncident(incident);
                setViewMode('list');
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedIncident?.id === incident.id && viewMode === 'list'
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-500">{incident.id}</span>
                <Badge variant={getPriorityColor(incident.priority) as any}>{incident.priority}</Badge>
              </div>
              <h3 className="font-medium text-slate-900 line-clamp-1">{incident.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{incident.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Detail View OR Form View */}
      <div className="flex-1">
        {viewMode === 'create' ? (
          <IncidentForm 
            onSubmit={handleCreate} 
            onCancel={() => setViewMode('list')} 
          />
        ) : viewMode === 'edit' && selectedIncident ? (
          <IncidentForm 
            initialData={selectedIncident} 
            onSubmit={handleUpdate} 
            onCancel={() => setViewMode('list')} 
          />
        ) : selectedIncident ? (
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedIncident.id}</h2>
                  <Badge variant={selectedIncident.status === 'Resolved' ? 'success' : 'neutral'}>
                    {selectedIncident.status}
                  </Badge>
                </div>
                <h3 className="text-lg text-slate-700">{selectedIncident.title}</h3>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setViewMode('edit')}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleAnalyze(selectedIncident)}
                  isLoading={isAnalyzing}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Analysis
                </Button>
              </div>
            </div>
            
            <IncidentLifecycle status={selectedIncident.status} />

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Core Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Assignee</label>
                  <p className="text-slate-900 font-medium">{selectedIncident.assignee || 'Unassigned'}</p>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Service</label>
                    <Button variant="outline" className="h-6 text-[10px] px-2 py-0" onClick={() => setShowGraph(true)}>View Context</Button>
                  </div>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Server className="w-4 h-4 text-slate-400" />
                    {getServiceName(selectedIncident.serviceId)}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedIncident.description}
                  </p>
                </div>
              </div>

              {/* Relationships Section */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Linked Items
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* CIs */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Configuration Items</label>
                    {selectedIncident.relatedCiIds && selectedIncident.relatedCiIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedIncident.relatedCiIds.map(ciId => {
                          const ci = MOCK_CIS.find(c => c.id === ciId);
                          return (
                            <span key={ciId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                              {ci?.name || ciId}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">No CIs linked</span>
                    )}
                  </div>

                  {/* Problem & Change */}
                  <div className="space-y-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="p-2 bg-orange-50 rounded text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block">Problem</label>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedIncident.problemId ? getProblemTitle(selectedIncident.problemId) : 'None'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded text-blue-600">
                        <GitPullRequest className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase block">Change Request</label>
                        <span className="text-sm font-medium text-slate-900">
                          {selectedIncident.changeId ? getChangeTitle(selectedIncident.changeId) : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedIncident.aiAnalysis && (
                <AIResponseBox content={selectedIncident.aiAnalysis} title="Gemini Incident Analysis" />
              )}
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
            <div className="text-center">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select an incident to view details or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncidentModule;