import React, { useState, useEffect, useRef } from 'react';
import { MOCK_RISKS, MOCK_SERVICES, MOCK_EPICS, MOCK_PROBLEMS, MOCK_INCIDENTS, MOCK_AI_SERVICES, MOCK_STRATEGIC_GOALS } from '../constants';
import { Risk, RiskLikelihood, RiskImpact, RiskStrategy, RiskStatus } from '../types';
import { Card, Badge, Button, AIResponseBox, MultiSelect } from './Shared';
import { Plus, Sparkles, Save, ShieldAlert, AlertTriangle, Activity, Search, Edit2, Link as LinkIcon, Server, Briefcase, Network, X, BrainCircuit, Target } from 'lucide-react';
import { analyzeRisk } from '../services/geminiService';
import * as d3 from 'd3';

const RiskGraphModal = ({ risk, onClose }: { risk: Risk, onClose: () => void }) => {
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
    const nodes: any[] = [{ id: risk.id, label: risk.title, type: 'Risk', group: 'risk' }];
    const links: any[] = [];

    // Services
    risk.relatedServiceIds?.forEach(id => {
      const item = MOCK_SERVICES.find(s => s.id === id);
      nodes.push({ id, label: item?.name || id, type: 'Service', group: 'service' });
      links.push({ source: risk.id, target: id });
    });

    // Epics
    risk.relatedEpicIds?.forEach(id => {
      const item = MOCK_EPICS.find(e => e.id === id);
      nodes.push({ id, label: item?.title || id, type: 'Epic', group: 'epic' });
      links.push({ source: risk.id, target: id });
    });

    // AI Services
    risk.relatedAIServiceIds?.forEach(id => {
      const item = MOCK_AI_SERVICES.find(a => a.id === id);
      nodes.push({ id, label: item?.name || id, type: 'AI Service', group: 'ai_service' });
      links.push({ source: risk.id, target: id });
    });

    // Strategic Goals
    risk.relatedGoalIds?.forEach(id => {
      const item = MOCK_STRATEGIC_GOALS.find(g => g.id === id);
      nodes.push({ id, label: item?.name || id, type: 'Goal', group: 'goal' });
      links.push({ source: risk.id, target: id });
    });

    // Problems linked to this Risk
    const problems = MOCK_PROBLEMS.filter(p => p.relatedRiskIds?.includes(risk.id));
    problems.forEach(p => {
      nodes.push({ id: p.id, label: p.title, type: 'Problem', group: 'problem' });
      links.push({ source: risk.id, target: p.id });

      // Incidents linked to Problem
      p.relatedIncidents?.forEach(incId => {
        const inc = MOCK_INCIDENTS.find(i => i.id === incId);
        if (!nodes.find(n => n.id === incId)) {
          nodes.push({ id: incId, label: inc?.title || incId, type: 'Incident', group: 'incident' });
        }
        links.push({ source: p.id, target: incId });
      });
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
          case 'risk': return '#ef4444'; // Red
          case 'service': return '#3b82f6'; // Blue
          case 'epic': return '#8b5cf6'; // Purple
          case 'ai_service': return '#10b981'; // Green
          case 'goal': return '#f59e0b'; // Amber/Yellow
          case 'problem': return '#f97316'; // Orange
          case 'incident': return '#ef4444'; // Red (lighter maybe?)
          default: return '#64748b';
        }
      });

    // Icons inside circles (simplified as text for now or small circles)
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

  }, [risk]);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[700px] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-slate-900">Risk Context: {risk.title}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative bg-slate-50/50">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Risk</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Service</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div> Epic</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div> AI Service</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Strategic Goal</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500"></div> Problem</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div> Incident</div>
            </div>
          </div>
          <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
        </div>
      </div>
    </div>
  );
};

const RiskModule = () => {
  const [risks, setRisks] = useState<Risk[]>(MOCK_RISKS);
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [formData, setFormData] = useState<Partial<Risk>>({});

  const handleCreateNew = () => {
    const newRisk: Partial<Risk> = {
      title: '',
      description: '',
      category: 'Operational',
      owner: '',
      likelihood: 1,
      impact: 1,
      score: 1,
      strategy: 'Reduce',
      status: 'Identified',
      mitigationPlan: '',
      relatedServiceIds: [],
      relatedEpicIds: [],
      relatedAIServiceIds: [],
      relatedGoalIds: []
    };
    setFormData(newRisk);
    setSelectedRisk(null);
    setIsEditing(true);
  };

  const handleEdit = (risk: Risk) => {
    setFormData({ ...risk });
    setSelectedRisk(risk);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.description) return;

    const score = (formData.likelihood || 1) * (formData.impact || 1);
    const riskToSave = {
      ...formData,
      id: formData.id || `RSK-${Math.floor(Math.random() * 1000)}`,
      score: score
    } as Risk;

    if (formData.id) {
      setRisks(risks.map(r => r.id === riskToSave.id ? riskToSave : r));
    } else {
      setRisks([...risks, riskToSave]);
    }
    setIsEditing(false);
    setSelectedRisk(riskToSave);
  };

  const handleAnalyze = async () => {
    if (!formData.title || !formData.description) return;
    setIsAnalyzing(true);
    const analysis = await analyzeRisk(formData.title, formData.description, formData.category || 'Operational');
    setFormData(prev => ({ ...prev, aiAnalysis: analysis }));
    setIsAnalyzing(false);
  };

  const toggleSelection = (field: 'relatedServiceIds' | 'relatedEpicIds' | 'relatedAIServiceIds' | 'relatedGoalIds', id: string) => {
    const current = formData[field] || [];
    const updated = current.includes(id) 
      ? current.filter(item => item !== id)
      : [...current, id];
    setFormData({ ...formData, [field]: updated });
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 15) return 'bg-red-500 text-white'; // Critical
    if (score >= 10) return 'bg-orange-500 text-white'; // High
    if (score >= 5) return 'bg-yellow-500 text-white'; // Medium
    return 'bg-green-500 text-white'; // Low
  };

  const getRiskLevelLabel = (score: number) => {
    if (score >= 15) return 'Critical';
    if (score >= 10) return 'High';
    if (score >= 5) return 'Medium';
    return 'Low';
  };

  // Risk Matrix Component
  const RiskMatrix = () => {
    const matrix = Array(5).fill(null).map(() => Array(5).fill(0));
    
    // Populate matrix counts
    risks.forEach(r => {
      // Matrix indices are 0-based, likelihood/impact are 1-based
      // Likelihood is Y-axis (row), Impact is X-axis (col)
      // We want Likelihood 5 at top (row 0), Likelihood 1 at bottom (row 4)
      const row = 5 - r.likelihood; 
      const col = r.impact - 1;
      if (row >= 0 && row < 5 && col >= 0 && col < 5) {
        matrix[row][col]++;
      }
    });

    return (
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Risk Heatmap</h3>
        <div className="flex">
          <div className="flex flex-col justify-between mr-2 text-xs font-semibold text-slate-500 h-64 py-4">
            <span>Almost Certain</span>
            <span>Likely</span>
            <span>Possible</span>
            <span>Unlikely</span>
            <span>Rare</span>
          </div>
          <div className="flex-1">
            <div className="grid grid-cols-5 grid-rows-5 gap-1 h-64">
              {matrix.map((row, rowIndex) => (
                row.map((count, colIndex) => {
                  // Calculate score for this cell to determine color
                  const likelihood = 5 - rowIndex;
                  const impact = colIndex + 1;
                  const score = likelihood * impact;
                  
                  let bgClass = 'bg-green-100';
                  if (score >= 15) bgClass = 'bg-red-200';
                  else if (score >= 10) bgClass = 'bg-orange-200';
                  else if (score >= 5) bgClass = 'bg-yellow-100';

                  return (
                    <div key={`${rowIndex}-${colIndex}`} className={`${bgClass} rounded flex items-center justify-center relative group`}>
                      {count > 0 && (
                        <span className="font-bold text-slate-800">{count}</span>
                      )}
                    </div>
                  );
                })
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs font-semibold text-slate-500 px-4">
              <span>Insignificant</span>
              <span>Minor</span>
              <span>Moderate</span>
              <span>Major</span>
              <span>Catastrophic</span>
            </div>
            <div className="text-center text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Impact</div>
          </div>
        </div>
        <div className="absolute -left-6 top-1/2 -rotate-90 text-xs font-bold text-slate-400 uppercase tracking-wider transform origin-center">Likelihood</div>
      </div>
    );
  };

  const serviceOptions = MOCK_SERVICES.map(s => ({ id: s.id, label: s.name }));
  const epicOptions = MOCK_EPICS.map(e => ({ id: e.id, label: e.title }));
  const aiServiceOptions = MOCK_AI_SERVICES.map(a => ({ id: a.id, label: a.name }));
  const goalOptions = MOCK_STRATEGIC_GOALS.map(g => ({ id: g.id, label: g.name }));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      {showGraph && selectedRisk && (
        <RiskGraphModal risk={selectedRisk} onClose={() => setShowGraph(false)} />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Risk Management</h2>
          <p className="text-slate-500 text-sm">ISO 31000 Framework</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> New Risk
        </Button>
      </div>

      <div className="flex gap-6 h-full overflow-hidden">
        {/* Left Panel: List & Matrix */}
        <div className="w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
          <RiskMatrix />
          
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search risks..." 
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {risks.map(risk => (
              <div 
                key={risk.id}
                onClick={() => {
                  setSelectedRisk(risk);
                  setIsEditing(false);
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedRisk?.id === risk.id 
                    ? 'bg-blue-50 border-blue-500 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-slate-500">{risk.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${getRiskLevelColor(risk.score)}`}>
                    {getRiskLevelLabel(risk.score)} ({risk.score})
                  </span>
                </div>
                <h3 className="font-medium text-slate-900 line-clamp-1">{risk.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <Badge variant="neutral">{risk.category}</Badge>
                  <span className="text-xs text-slate-500">{risk.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Detail/Edit */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {isEditing ? (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Risk' : 'Identify New Risk'}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Save Risk</Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Risk Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      rows={3}
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value as any})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Operational">Operational</option>
                      <option value="Strategic">Strategic</option>
                      <option value="Financial">Financial</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
                    <input 
                      type="text" 
                      value={formData.owner} 
                      onChange={e => setFormData({...formData, owner: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  
                  {/* Assessment */}
                  <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Risk Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Likelihood (1-5)</label>
                        <input 
                          type="range" min="1" max="5" 
                          value={formData.likelihood} 
                          onChange={e => setFormData({...formData, likelihood: Number(e.target.value) as RiskLikelihood})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Rare</span>
                          <span>Almost Certain</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Impact (1-5)</label>
                        <input 
                          type="range" min="1" max="5" 
                          value={formData.impact} 
                          onChange={e => setFormData({...formData, impact: Number(e.target.value) as RiskImpact})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>Insignificant</span>
                          <span>Catastrophic</span>
                        </div>
                      </div>
                      <div className="col-span-2 flex items-center justify-between bg-white p-3 rounded border border-slate-200">
                        <span className="font-medium text-slate-700">Calculated Risk Score:</span>
                        <span className={`font-bold px-3 py-1 rounded ${getRiskLevelColor((formData.likelihood || 1) * (formData.impact || 1))}`}>
                          {(formData.likelihood || 1) * (formData.impact || 1)} - {getRiskLevelLabel((formData.likelihood || 1) * (formData.impact || 1))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Treatment */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Strategy</label>
                    <select 
                      value={formData.strategy} 
                      onChange={e => setFormData({...formData, strategy: e.target.value as RiskStrategy})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Avoid">Avoid</option>
                      <option value="Reduce">Reduce</option>
                      <option value="Share">Share</option>
                      <option value="Accept">Accept</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value as RiskStatus})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="Identified">Identified</option>
                      <option value="Assessed">Assessed</option>
                      <option value="Treated">Treated</option>
                      <option value="Monitored">Monitored</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Mitigation Plan</label>
                    <textarea 
                      rows={3}
                      value={formData.mitigationPlan} 
                      onChange={e => setFormData({...formData, mitigationPlan: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Action plan to address this risk..."
                    />
                  </div>

                  {/* Linked Items Section */}
                  <div className="col-span-2 border-t border-slate-200 pt-6 mt-2">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" /> Linked Items
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <MultiSelect 
                        label="Strategic Goals" 
                        icon={Target} 
                        options={goalOptions} 
                        selectedIds={formData.relatedGoalIds || []} 
                        onSelect={(id) => toggleSelection('relatedGoalIds', id)}
                        onRemove={(id) => toggleSelection('relatedGoalIds', id)}
                      />
                      <MultiSelect 
                        label="Affected Services" 
                        icon={Server} 
                        options={serviceOptions} 
                        selectedIds={formData.relatedServiceIds || []} 
                        onSelect={(id) => toggleSelection('relatedServiceIds', id)}
                        onRemove={(id) => toggleSelection('relatedServiceIds', id)}
                      />
                      <MultiSelect 
                        label="Remediation Projects" 
                        icon={Briefcase} 
                        options={epicOptions} 
                        selectedIds={formData.relatedEpicIds || []} 
                        onSelect={(id) => toggleSelection('relatedEpicIds', id)}
                        onRemove={(id) => toggleSelection('relatedEpicIds', id)}
                      />
                      <MultiSelect 
                        label="Related AI Services" 
                        icon={BrainCircuit} 
                        options={aiServiceOptions} 
                        selectedIds={formData.relatedAIServiceIds || []} 
                        onSelect={(id) => toggleSelection('relatedAIServiceIds', id)}
                        onRemove={(id) => toggleSelection('relatedAIServiceIds', id)}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-slate-900">AI Risk Analysis</h4>
                    <Button 
                      variant="outline" 
                      onClick={handleAnalyze} 
                      isLoading={isAnalyzing}
                      className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      <Sparkles className="w-4 h-4" /> Analyze with AI
                    </Button>
                  </div>
                  {formData.aiAnalysis ? (
                    <AIResponseBox content={formData.aiAnalysis} title="ISO 31000 Risk Analysis" />
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                      Click "Analyze with AI" to generate consequences, strategies, and KRIs.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : selectedRisk ? (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedRisk.id}</h2>
                    <Badge variant={selectedRisk.status === 'Closed' ? 'success' : 'neutral'}>
                      {selectedRisk.status}
                    </Badge>
                  </div>
                  <h3 className="text-lg text-slate-700">{selectedRisk.title}</h3>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleEdit(selectedRisk)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                    <p className="text-slate-900 font-medium">{selectedRisk.category}</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Owner</label>
                    <p className="text-slate-900 font-medium">{selectedRisk.owner}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                    <p className="text-slate-700 mt-1">{selectedRisk.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Risk Assessment
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <div className="text-xs text-slate-500 uppercase">Likelihood</div>
                      <div className="text-xl font-bold text-slate-900">{selectedRisk.likelihood}/5</div>
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <div className="text-xs text-slate-500 uppercase">Impact</div>
                      <div className="text-xl font-bold text-slate-900">{selectedRisk.impact}/5</div>
                    </div>
                    <div className={`p-3 rounded border border-slate-200 ${getRiskLevelColor(selectedRisk.score)}`}>
                      <div className="text-xs opacity-80 uppercase">Risk Score</div>
                      <div className="text-xl font-bold">{selectedRisk.score}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Treatment Plan</h4>
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-slate-500">Strategy:</span>
                      <Badge variant="default">{selectedRisk.strategy}</Badge>
                    </div>
                    <p className="text-slate-700">{selectedRisk.mitigationPlan || 'No mitigation plan defined.'}</p>
                  </div>
                </div>

                {/* Linked Items Display */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" /> Strategic Goals
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRisk.relatedGoalIds?.length ? selectedRisk.relatedGoalIds.map(id => {
                         const goal = MOCK_STRATEGIC_GOALS.find(g => g.id === id);
                         return <Badge key={id} variant="neutral">{goal?.name || id}</Badge>
                      }) : <span className="text-sm text-slate-500 italic">None linked</span>}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <Server className="w-4 h-4" /> Affected Services
                      </h4>
                      <Button variant="outline" className="h-7 text-xs px-2" onClick={() => setShowGraph(true)}>View Context</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedRisk.relatedServiceIds?.length ? selectedRisk.relatedServiceIds.map(id => {
                         const svc = MOCK_SERVICES.find(s => s.id === id);
                         return <Badge key={id} variant="neutral">{svc?.name || id}</Badge>
                      }) : <span className="text-sm text-slate-500 italic">None linked</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> Remediation Projects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRisk.relatedEpicIds?.length ? selectedRisk.relatedEpicIds.map(id => {
                         const epic = MOCK_EPICS.find(e => e.id === id);
                         return <Badge key={id} variant="neutral">{epic?.title || id}</Badge>
                      }) : <span className="text-sm text-slate-500 italic">None linked</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> Related AI Services
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedRisk.relatedAIServiceIds?.length ? selectedRisk.relatedAIServiceIds.map(id => {
                         const ai = MOCK_AI_SERVICES.find(a => a.id === id);
                         return <Badge key={id} variant="neutral">{ai?.name || id}</Badge>
                      }) : <span className="text-sm text-slate-500 italic">None linked</span>}
                    </div>
                  </div>
                </div>

                {selectedRisk.aiAnalysis && (
                  <AIResponseBox content={selectedRisk.aiAnalysis} title="ISO 31000 Risk Analysis" />
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
              <div className="text-center">
                <ShieldAlert className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select a risk to view details or identify a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskModule;
