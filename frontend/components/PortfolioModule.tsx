import React, { useState } from 'react';
import { MOCK_EPICS, MOCK_SERVICES, MOCK_CHANGES, MOCK_PROBLEMS, MOCK_RISKS, MOCK_CAPABILITIES, MOCK_STRATEGIC_GOALS } from '../constants';
import { Epic, PortfolioStatus, GanttTask } from '../types';
import { Card, Badge, Button, AIResponseBox } from './Shared';
import { Plus, Sparkles, Save, X, DollarSign, TrendingUp, Layout, ArrowRight, ArrowLeft, Link as LinkIcon, Server, GitPullRequest, AlertTriangle, ShieldAlert, Calendar, Map, Target } from 'lucide-react';
import { generateLeanBusinessCase, generateWBS, generateGanttData } from '../services/geminiService';

const COLUMNS: PortfolioStatus[] = ['Funnel', 'Review', 'Analyzing', 'Portfolio Backlog', 'Implementing', 'Done'];

const GanttChart = ({ tasks }: { tasks: GanttTask[] }) => {
  if (!tasks || !tasks.length) return null;

  const dates = tasks.map(t => [new Date(t.start).getTime(), new Date(t.end).getTime()]).flat();
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const totalDuration = maxDate - minDate;
  const paddedDuration = totalDuration || 1;

  return (
    <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-white">
      <div className="bg-slate-50 p-3 border-b border-slate-200 font-semibold text-sm text-slate-700 grid grid-cols-12 gap-4">
        <div className="col-span-4">Task Name</div>
        <div className="col-span-8">Timeline</div>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {tasks.map(task => {
          const start = new Date(task.start).getTime();
          const end = new Date(task.end).getTime();
          const left = ((start - minDate) / paddedDuration) * 100;
          const width = ((end - start) / paddedDuration) * 100;

          return (
            <div key={task.id} className="p-3 border-b border-slate-100 grid grid-cols-12 gap-4 items-center hover:bg-slate-50">
              <div className="col-span-4 text-sm font-medium text-slate-900 truncate" title={task.name}>
                {task.type === 'phase' ? <span className="font-bold text-indigo-700">{task.name}</span> : <span className="pl-4">{task.name}</span>}
              </div>
              <div className="col-span-8 relative h-6 bg-slate-100 rounded-full overflow-hidden">
                 <div
                    className={`absolute h-full rounded-full ${task.type === 'phase' ? 'bg-indigo-400 opacity-50' : 'bg-blue-500'}`}
                    style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }}
                 ></div>
                 <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-600">
                    {new Date(task.start).toLocaleDateString()} - {new Date(task.end).toLocaleDateString()}
                 </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MultiSelect = ({ 
  label, 
  icon: Icon, 
  options, 
  selectedIds, 
  onSelect, 
  onRemove 
}: { 
  label: string, 
  icon: any, 
  options: { id: string, label: string }[], 
  selectedIds: string[], 
  onSelect: (id: string) => void, 
  onRemove: (id: string) => void 
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
        <Icon className="w-4 h-4 text-slate-500" /> {label}
      </label>
      
      <select 
        className="w-full px-3 py-2 border border-slate-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-blue-500"
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
            e.target.value = ''; // Reset select
          }
        }}
        defaultValue=""
      >
        <option value="" disabled>Select to add...</option>
        {options.filter(opt => !selectedIds.includes(opt.id)).map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>

      <div className="flex flex-wrap gap-2">
        {selectedIds.map(id => {
          const option = options.find(o => o.id === id);
          return (
            <span key={id} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {option?.label || id}
              <button 
                type="button"
                onClick={() => onRemove(id)}
                className="ml-1.5 text-slate-400 hover:text-red-500 focus:outline-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
        {selectedIds.length === 0 && (
          <span className="text-xs text-slate-400 italic">No items linked</span>
        )}
      </div>
    </div>
  );
};

const PortfolioModule = () => {
  const [epics, setEpics] = useState<Epic[]>(MOCK_EPICS);
  const [selectedEpic, setSelectedEpic] = useState<Epic | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingWBS, setIsGeneratingWBS] = useState(false);
  const [isGeneratingGantt, setIsGeneratingGantt] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Epic>>({});

  const handleCreateNew = () => {
    const newEpic: Partial<Epic> = {
      title: '',
      description: '',
      status: 'Funnel',
      owner: '',
      strategicTheme: '',
      budget: 0,
      wsjf: { userBusinessValue: 1, timeCriticality: 1, rrOe: 1, jobSize: 1, score: 3 },
      relatedServiceIds: [],
      relatedChangeIds: [],
      relatedProblemIds: [],
      relatedRiskIds: [],
      relatedCapabilityIds: [],
      relatedGoalIds: []
    };
    setFormData(newEpic);
    setSelectedEpic(null);
    setIsEditing(true);
  };

  const handleEdit = (epic: Epic) => {
    setFormData({ ...epic });
    setSelectedEpic(epic);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.description) return;

    const wsjfScore = calculateWSJFScore(formData.wsjf);
    const epicToSave = {
      ...formData,
      id: formData.id || `EPC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
      wsjf: { ...formData.wsjf, score: wsjfScore }
    } as Epic;

    if (formData.id) {
      setEpics(epics.map(e => e.id === epicToSave.id ? epicToSave : e));
    } else {
      setEpics([...epics, epicToSave]);
    }
    setIsEditing(false);
    setSelectedEpic(epicToSave);
  };

  const calculateWSJFScore = (wsjf: any) => {
    if (!wsjf) return 0;
    const cod = (Number(wsjf.userBusinessValue) || 0) + (Number(wsjf.timeCriticality) || 0) + (Number(wsjf.rrOe) || 0);
    const size = Number(wsjf.jobSize) || 1;
    return parseFloat((cod / size).toFixed(2));
  };

  const handleGenerateBusinessCase = async () => {
    if (!formData.title || !formData.description) return;
    setIsAnalyzing(true);
    const analysis = await generateLeanBusinessCase(formData.title, formData.description, formData.strategicTheme || '');
    setFormData(prev => ({ ...prev, aiAnalysis: analysis }));
    setIsAnalyzing(false);
  };

  const handleGenerateWBS = async () => {
    if (!formData.title || !formData.description) return;
    setIsGeneratingWBS(true);
    const wbs = await generateWBS(formData.title, formData.description);
    setFormData(prev => ({ ...prev, aiWBS: wbs }));
    setIsGeneratingWBS(false);
  };

  const handleGenerateGantt = async () => {
    if (!formData.title || !formData.description || !formData.aiWBS) return;
    setIsGeneratingGantt(true);
    const ganttData = await generateGanttData(formData.title, formData.description, formData.aiWBS);
    setFormData(prev => ({ ...prev, aiGantt: ganttData }));
    setIsGeneratingGantt(false);
  };

  const moveEpic = (epicId: string, direction: 'next' | 'prev') => {
    const epic = epics.find(e => e.id === epicId);
    if (!epic) return;

    const currentIndex = COLUMNS.indexOf(epic.status);
    let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    if (newIndex >= 0 && newIndex < COLUMNS.length) {
      const newStatus = COLUMNS[newIndex];
      setEpics(epics.map(e => e.id === epicId ? { ...e, status: newStatus } : e));
      if (selectedEpic?.id === epicId) {
        setSelectedEpic({ ...selectedEpic, status: newStatus });
      }
    }
  };

  const toggleSelection = (field: 'relatedServiceIds' | 'relatedChangeIds' | 'relatedProblemIds' | 'relatedRiskIds' | 'relatedCapabilityIds' | 'relatedGoalIds', id: string) => {
    const current = formData[field] || [];
    const updated = current.includes(id) 
      ? current.filter(item => item !== id)
      : [...current, id];
    setFormData({ ...formData, [field]: updated });
  };

  const getStatusColor = (status: PortfolioStatus) => {
    switch(status) {
      case 'Funnel': return 'bg-slate-100 border-slate-200';
      case 'Review': return 'bg-blue-50 border-blue-200';
      case 'Analyzing': return 'bg-purple-50 border-purple-200';
      case 'Portfolio Backlog': return 'bg-amber-50 border-amber-200';
      case 'Implementing': return 'bg-indigo-50 border-indigo-200';
      case 'Done': return 'bg-green-50 border-green-200';
      default: return 'bg-white';
    }
  };

  const serviceOptions = MOCK_SERVICES.map(s => ({ id: s.id, label: s.name }));
  const riskOptions = MOCK_RISKS.map(r => ({ id: r.id, label: r.title }));
  const changeOptions = MOCK_CHANGES.map(c => ({ id: c.id, label: c.title }));
  const problemOptions = MOCK_PROBLEMS.map(p => ({ id: p.id, label: p.title }));
  const capabilityOptions = MOCK_CAPABILITIES.map(c => ({ id: c.id, label: c.name }));
  const goalOptions = MOCK_STRATEGIC_GOALS.map(g => ({ id: g.id, label: g.name }));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Portfolio Management</h2>
          <p className="text-slate-500 text-sm">Lean Portfolio Management (LPM) Kanban</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> New Epic
        </Button>
      </div>

      {isEditing ? (
        <Card className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit Epic' : 'New Portfolio Epic'}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Save Epic</Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Details */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Epic Title</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Cloud Migration"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      rows={4}
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the epic..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Strategic Theme</label>
                    <input 
                      type="text" 
                      value={formData.strategicTheme} 
                      onChange={e => setFormData({...formData, strategicTheme: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    />
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
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Budget Estimate</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="number" 
                        value={formData.budget} 
                        onChange={e => setFormData({...formData, budget: Number(e.target.value)})}
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value as PortfolioStatus})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      {COLUMNS.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Relationships Section */}
                <div className="border-t border-slate-200 pt-6">
                  <h4 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <LinkIcon className="w-5 h-5 text-slate-500" />
                    Linked Items
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MultiSelect 
                      label="Strategic Goals" 
                      icon={Target} 
                      options={goalOptions} 
                      selectedIds={formData.relatedGoalIds || []} 
                      onSelect={(id) => toggleSelection('relatedGoalIds', id)}
                      onRemove={(id) => toggleSelection('relatedGoalIds', id)}
                    />
                    <MultiSelect 
                      label="Services" 
                      icon={Server} 
                      options={serviceOptions} 
                      selectedIds={formData.relatedServiceIds || []} 
                      onSelect={(id) => toggleSelection('relatedServiceIds', id)}
                      onRemove={(id) => toggleSelection('relatedServiceIds', id)}
                    />
                    <MultiSelect 
                      label="Business Capabilities" 
                      icon={Map} 
                      options={capabilityOptions} 
                      selectedIds={formData.relatedCapabilityIds || []} 
                      onSelect={(id) => toggleSelection('relatedCapabilityIds', id)}
                      onRemove={(id) => toggleSelection('relatedCapabilityIds', id)}
                    />
                    <MultiSelect 
                      label="Risks" 
                      icon={ShieldAlert} 
                      options={riskOptions} 
                      selectedIds={formData.relatedRiskIds || []} 
                      onSelect={(id) => toggleSelection('relatedRiskIds', id)}
                      onRemove={(id) => toggleSelection('relatedRiskIds', id)}
                    />
                    <MultiSelect 
                      label="Changes" 
                      icon={GitPullRequest} 
                      options={changeOptions} 
                      selectedIds={formData.relatedChangeIds || []} 
                      onSelect={(id) => toggleSelection('relatedChangeIds', id)}
                      onRemove={(id) => toggleSelection('relatedChangeIds', id)}
                    />
                    <MultiSelect 
                      label="Problems" 
                      icon={AlertTriangle} 
                      options={problemOptions} 
                      selectedIds={formData.relatedProblemIds || []} 
                      onSelect={(id) => toggleSelection('relatedProblemIds', id)}
                      onRemove={(id) => toggleSelection('relatedProblemIds', id)}
                    />
                  </div>
                </div>

                {/* AI Section - Lean Business Case */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-slate-900">Lean Business Case</h4>
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateBusinessCase} 
                      isLoading={isAnalyzing}
                      className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      <Sparkles className="w-4 h-4" /> Generate with AI
                    </Button>
                  </div>
                  {formData.aiAnalysis ? (
                    <AIResponseBox content={formData.aiAnalysis} title="Draft Lean Business Case" />
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                      Click "Generate with AI" to draft a business case based on the description.
                    </div>
                  )}
                </div>

                {/* AI Section - WBS & GANTT */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-slate-900">Propose the work break down structure</h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleGenerateWBS} 
                        isLoading={isGeneratingWBS}
                        className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                      >
                        <Sparkles className="w-4 h-4" /> Generate WBS
                      </Button>
                      {formData.aiWBS && (
                        <Button 
                          variant="outline" 
                          onClick={handleGenerateGantt} 
                          isLoading={isGeneratingGantt}
                          className="gap-2 text-blue-700 border-blue-200 hover:bg-blue-50"
                        >
                          <Calendar className="w-4 h-4" /> Create GANTT Chart
                        </Button>
                      )}
                    </div>
                  </div>
                  {formData.aiWBS ? (
                    <div className="space-y-4">
                      <AIResponseBox content={formData.aiWBS} title="Draft Work Breakdown Structure" />
                      {formData.aiGantt && (
                        <div className="mt-4">
                          <h5 className="text-sm font-bold text-slate-900 mb-2">Project GANTT Chart</h5>
                          <GanttChart tasks={formData.aiGantt} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                      Click "Generate WBS" to draft a work plan based on the description. This AI can be used for define the activities for implementing this Epic.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: WSJF Calculator */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                <h4 className="text-md font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  WSJF Calculator
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">User-Business Value</label>
                      <span className="text-xs font-bold text-slate-900">{formData.wsjf?.userBusinessValue}</span>
                    </div>
                    <input 
                      type="range" min="1" max="21" step="1"
                      value={formData.wsjf?.userBusinessValue || 1}
                      onChange={e => setFormData({...formData, wsjf: { ...formData.wsjf!, userBusinessValue: Number(e.target.value) }})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">Time Criticality</label>
                      <span className="text-xs font-bold text-slate-900">{formData.wsjf?.timeCriticality}</span>
                    </div>
                    <input 
                      type="range" min="1" max="21" step="1"
                      value={formData.wsjf?.timeCriticality || 1}
                      onChange={e => setFormData({...formData, wsjf: { ...formData.wsjf!, timeCriticality: Number(e.target.value) }})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">Risk Reduction | Opp. Enablement</label>
                      <span className="text-xs font-bold text-slate-900">{formData.wsjf?.rrOe}</span>
                    </div>
                    <input 
                      type="range" min="1" max="21" step="1"
                      value={formData.wsjf?.rrOe || 1}
                      onChange={e => setFormData({...formData, wsjf: { ...formData.wsjf!, rrOe: Number(e.target.value) }})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-medium text-slate-600">Job Size (Duration)</label>
                      <span className="text-xs font-bold text-slate-900">{formData.wsjf?.jobSize}</span>
                    </div>
                    <input 
                      type="range" min="1" max="21" step="1"
                      value={formData.wsjf?.jobSize || 1}
                      onChange={e => setFormData({...formData, wsjf: { ...formData.wsjf!, jobSize: Number(e.target.value) }})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-600 rounded-lg text-white text-center">
                    <div className="text-xs opacity-80 uppercase tracking-wider font-semibold">WSJF Score</div>
                    <div className="text-3xl font-bold mt-1">
                      {calculateWSJFScore(formData.wsjf)}
                    </div>
                    <div className="text-xs opacity-70 mt-1">Higher is better</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* Kanban Board View */
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex h-full gap-4 min-w-max pb-4">
            {COLUMNS.map(column => (
              <div key={column} className={`w-80 flex-shrink-0 flex flex-col rounded-xl border ${getStatusColor(column)}`}>
                <div className="p-3 border-b border-slate-200/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700 text-sm uppercase tracking-wide">{column}</h3>
                  <Badge variant="neutral">{epics.filter(e => e.status === column).length}</Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {epics.filter(e => e.status === column).map(epic => (
                    <div 
                      key={epic.id} 
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => handleEdit(epic)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-slate-400">{epic.id}</span>
                        {epic.wsjf.score > 5 && (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">
                            WSJF: {epic.wsjf.score}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-slate-900 mb-2 line-clamp-2">{epic.title}</h4>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {epic.owner.charAt(0)}
                          </div>
                          <span className="text-xs text-slate-500 truncate max-w-[80px]">{epic.owner}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => moveEpic(epic.id, 'prev')}
                            disabled={column === 'Funnel'}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => moveEpic(epic.id, 'next')}
                            disabled={column === 'Done'}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioModule;
