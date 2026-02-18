import React, { useState } from 'react';
import { MOCK_PROBLEMS, MOCK_SERVICES, MOCK_RISKS } from '../constants';
import { Problem, Priority, Status } from '../types';
import { Card, Badge, Button, AIResponseBox } from './Shared';
import { AlertTriangle, Sparkles, Plus, Save, Search, Edit2, Server, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { generateRCA } from '../services/geminiService';

interface ProblemFormProps {
  initialData?: Problem | null;
  onSubmit: (data: Problem) => void;
  onCancel: () => void;
}

const ProblemForm: React.FC<ProblemFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Problem>>(
    initialData || {
      title: '',
      description: '',
      rootCause: '',
      status: 'New',
      priority: 'Medium',
      impact: 'Medium',
      category: 'Software',
      serviceId: '',
      relatedRiskIds: [],
      relatedIncidents: []
    }
  );

  const handleChange = (field: keyof Problem, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRisk = (riskId: string) => {
    const currentRisks = formData.relatedRiskIds || [];
    const newRisks = currentRisks.includes(riskId)
      ? currentRisks.filter(id => id !== riskId)
      : [...currentRisks, riskId];
    handleChange('relatedRiskIds', newRisks);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    const problemData = {
      ...formData,
      id: formData.id || `PRB${Math.floor(Math.random() * 100000)}`,
    } as Problem;

    onSubmit(problemData);
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">
          {initialData ? 'Edit Problem' : 'Create New Problem'}
        </h2>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            Save Problem
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Problem summary"
                required
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Detailed description"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Root Cause</label>
              <textarea
                value={formData.rootCause}
                onChange={(e) => handleChange('rootCause', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Known root cause (if any)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Network">Network</option>
                <option value="Database">Database</option>
                <option value="Process">Process</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value as Status)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as Priority)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Impact</label>
              <select
                value={formData.impact}
                onChange={(e) => handleChange('impact', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Affected Service</label>
              <select
                value={formData.serviceId}
                onChange={(e) => handleChange('serviceId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
            
            <div className="grid grid-cols-1 gap-6">
              {/* Risks */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Related Risks</label>
                <div className="border border-slate-300 rounded-lg p-3 max-h-48 overflow-y-auto bg-white">
                  {MOCK_RISKS.map(risk => (
                    <label key={risk.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.relatedRiskIds?.includes(risk.id)}
                        onChange={() => toggleRisk(risk.id)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900">{risk.title}</div>
                        <div className="text-xs text-slate-500">{risk.category} • {risk.id}</div>
                      </div>
                      <Badge variant={risk.score >= 10 ? 'danger' : 'warning'}>Score: {risk.score}</Badge>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Card>
  );
};

const ProblemModule = () => {
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');

  const handleGenerateRCA = async (problem: Problem) => {
    setIsGenerating(problem.id);
    const rca = await generateRCA(problem.title, problem.description);
    const updatedProblems = problems.map(p => 
      p.id === problem.id ? { ...p, aiRCA: rca } : p
    );
    setProblems(updatedProblems);
    setSelectedProblem({ ...problem, aiRCA: rca });
    setIsGenerating(null);
  };

  const handleCreate = (newProblem: Problem) => {
    setProblems([newProblem, ...problems]);
    setViewMode('list');
    setSelectedProblem(newProblem);
  };

  const handleUpdate = (updatedProblem: Problem) => {
    const updatedList = problems.map(p => p.id === updatedProblem.id ? updatedProblem : p);
    setProblems(updatedList);
    setViewMode('list');
    setSelectedProblem(updatedProblem);
  };

  const getServiceName = (id?: string) => MOCK_SERVICES.find(s => s.id === id)?.name || id || 'N/A';

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* List View */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Problems</h2>
          <Button 
            variant="primary" 
            className="h-9 w-9 p-0 rounded-full"
            onClick={() => {
              setSelectedProblem(null);
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
            placeholder="Search problems..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {problems.map(problem => (
            <div 
              key={problem.id}
              onClick={() => {
                setSelectedProblem(problem);
                setViewMode('list');
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedProblem?.id === problem.id && viewMode === 'list'
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-mono text-slate-500">{problem.id}</span>
                </div>
                <Badge variant={problem.status === 'Resolved' ? 'success' : 'warning'}>{problem.status}</Badge>
              </div>
              <h3 className="font-medium text-slate-900 line-clamp-1">{problem.title}</h3>
              <p className="text-sm text-slate-500 mt-1 line-clamp-2">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Detail View OR Form View */}
      <div className="flex-1">
        {viewMode === 'create' ? (
          <ProblemForm 
            onSubmit={handleCreate} 
            onCancel={() => setViewMode('list')} 
          />
        ) : viewMode === 'edit' && selectedProblem ? (
          <ProblemForm 
            initialData={selectedProblem} 
            onSubmit={handleUpdate} 
            onCancel={() => setViewMode('list')} 
          />
        ) : selectedProblem ? (
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedProblem.id}</h2>
                  <Badge variant={selectedProblem.status === 'Resolved' ? 'success' : 'neutral'}>
                    {selectedProblem.status}
                  </Badge>
                </div>
                <h3 className="text-lg text-slate-700">{selectedProblem.title}</h3>
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
                  onClick={() => handleGenerateRCA(selectedProblem)}
                  isLoading={isGenerating === selectedProblem.id}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Generate AI RCA
                </Button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              {/* Core Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                  <p className="text-slate-900 font-medium">{selectedProblem.category}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Service</label>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Server className="w-4 h-4 text-slate-400" />
                    {getServiceName(selectedProblem.serviceId)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Priority</label>
                  <p className="text-slate-900 font-medium">{selectedProblem.priority}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Impact</label>
                  <p className="text-slate-900 font-medium">{selectedProblem.impact}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedProblem.description}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Root Cause</label>
                  <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                    {selectedProblem.rootCause || 'Not identified yet.'}
                  </p>
                </div>
              </div>

              {/* Relationships Section */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-3 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Linked Items
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {/* Risks */}
                  <div className="bg-white border border-slate-200 rounded-lg p-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Related Risks
                    </label>
                    {selectedProblem.relatedRiskIds && selectedProblem.relatedRiskIds.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedProblem.relatedRiskIds.map(riskId => {
                          const risk = MOCK_RISKS.find(r => r.id === riskId);
                          return (
                            <span key={riskId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                              {risk?.title || riskId}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400 italic">No risks linked</span>
                    )}
                  </div>
                </div>
              </div>

              {selectedProblem.aiRCA && (
                <AIResponseBox content={selectedProblem.aiRCA} title="AI Generated Root Cause Analysis" />
              )}
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select a problem to view details or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemModule;
