import React, { useState } from 'react';
import { MOCK_AI_SERVICES, MOCK_SERVICES, MOCK_AI_TECHNOLOGIES, MOCK_RISKS } from '../constants';
import { AIService, AIComplianceFramework, AIRiskLevel, AIComplianceStatus, AIDataCategory } from '../types';
import { Card, Badge, Button, AIResponseBox } from './Shared';
import { Plus, Sparkles, Save, Search, Edit2, BrainCircuit, ShieldCheck, Server, Cpu, Database, ShieldAlert, X } from 'lucide-react';
import { analyzeAICompliance } from '../services/geminiService';

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

const AIGovernanceModule = () => {
  const [aiServices, setAiServices] = useState<AIService[]>(MOCK_AI_SERVICES);
  const [selectedService, setSelectedService] = useState<AIService | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState<Partial<AIService>>({});

  const handleCreateNew = () => {
    const newService: Partial<AIService> = {
      name: '',
      description: '',
      serviceId: '',
      technologyId: '',
      riskLevel: 'Minimal',
      frameworks: [],
      dataCategories: [],
      status: 'Pending',
      owner: '',
      lastAssessmentDate: new Date().toISOString().split('T')[0],
      relatedRiskIds: []
    };
    setFormData(newService);
    setSelectedService(null);
    setIsEditing(true);
  };

  const handleEdit = (service: AIService) => {
    setFormData({ ...service });
    setSelectedService(service);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) return;

    const serviceToSave = {
      ...formData,
      id: formData.id || `AI-${Math.floor(Math.random() * 1000)}`,
    } as AIService;

    if (formData.id) {
      setAiServices(aiServices.map(s => s.id === serviceToSave.id ? serviceToSave : s));
    } else {
      setAiServices([...aiServices, serviceToSave]);
    }
    setIsEditing(false);
    setSelectedService(serviceToSave);
  };

  const handleAnalyze = async () => {
    if (!formData.name || !formData.description) return;
    setIsAnalyzing(true);
    const analysis = await analyzeAICompliance(
      formData.name, 
      formData.description, 
      formData.frameworks || [],
      formData.dataCategories || []
    );
    setFormData(prev => ({ ...prev, aiAnalysis: analysis }));
    setIsAnalyzing(false);
  };

  const toggleFramework = (fw: AIComplianceFramework) => {
    const current = formData.frameworks || [];
    const updated = current.includes(fw)
      ? current.filter(f => f !== fw)
      : [...current, fw];
    setFormData({ ...formData, frameworks: updated });
  };

  const toggleDataCategory = (dc: AIDataCategory) => {
    const current = formData.dataCategories || [];
    const updated = current.includes(dc)
      ? current.filter(d => d !== dc)
      : [...current, dc];
    setFormData({ ...formData, dataCategories: updated });
  };

  const toggleRiskSelection = (id: string) => {
    const current = formData.relatedRiskIds || [];
    const updated = current.includes(id)
      ? current.filter(r => r !== id)
      : [...current, id];
    setFormData({ ...formData, relatedRiskIds: updated });
  };

  const getRiskColor = (level: AIRiskLevel) => {
    switch(level) {
      case 'Unacceptable': return 'bg-red-600 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Limited': return 'bg-yellow-500 text-white';
      default: return 'bg-green-500 text-white';
    }
  };

  const getServiceName = (id?: string) => MOCK_SERVICES.find(s => s.id === id)?.name || id || 'N/A';
  const getTechnologyName = (id?: string) => {
    const tech = MOCK_AI_TECHNOLOGIES.find(t => t.id === id);
    return tech ? `${tech.name} (${tech.vendor})` : 'N/A';
  };

  const riskOptions = MOCK_RISKS.map(r => ({ id: r.id, label: r.title }));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Governance</h2>
          <p className="text-slate-500 text-sm">EU AI Act • ISO 42001 • NIST AI RMF</p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" /> Register AI Service
        </Button>
      </div>

      <div className="flex gap-6 h-full overflow-hidden">
        {/* Left Panel: List */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search AI services..." 
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {aiServices.map(service => (
            <div 
              key={service.id}
              onClick={() => {
                setSelectedService(service);
                setIsEditing(false);
              }}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedService?.id === service.id 
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-500">{service.id}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${getRiskColor(service.riskLevel)}`}>
                  {service.riskLevel} Risk
                </span>
              </div>
              <h3 className="font-medium text-slate-900 line-clamp-1">{service.name}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Server className="w-3 h-3" /> {getServiceName(service.serviceId)}
                </span>
                <Badge variant={service.status === 'Compliant' ? 'success' : 'warning'}>{service.status}</Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel: Detail/Edit */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {isEditing ? (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">{formData.id ? 'Edit AI Service' : 'Register New AI Service'}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} className="gap-2"><Save className="w-4 h-4" /> Save</Button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">AI Service Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
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
                      placeholder="Describe the AI model, purpose, and data used..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Linked IT Service</label>
                    <select 
                      value={formData.serviceId} 
                      onChange={e => setFormData({...formData, serviceId: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Select Service...</option>
                      {MOCK_SERVICES.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">AI Technology / Model</label>
                    <select 
                      value={formData.technologyId} 
                      onChange={e => setFormData({...formData, technologyId: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Select Technology...</option>
                      {MOCK_AI_TECHNOLOGIES.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.vendor})</option>
                      ))}
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
                  
                  {/* Compliance Info */}
                  <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Compliance Assessment
                    </h4>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Risk Classification</label>
                        <select 
                          value={formData.riskLevel} 
                          onChange={e => setFormData({...formData, riskLevel: e.target.value as AIRiskLevel})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="Minimal">Minimal Risk</option>
                          <option value="Limited">Limited Risk</option>
                          <option value="High">High Risk</option>
                          <option value="Unacceptable">Unacceptable Risk</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Compliance Status</label>
                        <select 
                          value={formData.status} 
                          onChange={e => setFormData({...formData, status: e.target.value as AIComplianceStatus})}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        >
                          <option value="Pending">Pending Assessment</option>
                          <option value="Compliant">Compliant</option>
                          <option value="Non-Compliant">Non-Compliant</option>
                          <option value="Not Applicable">Not Applicable</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Applicable Frameworks</label>
                        <div className="flex gap-4 flex-wrap">
                          {['EU AI Act', 'ISO 42001', 'NIST AI RMF'].map((fw) => (
                            <label key={fw} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={formData.frameworks?.includes(fw as AIComplianceFramework)}
                                onChange={() => toggleFramework(fw as AIComplianceFramework)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700">{fw}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Processed Data</label>
                        <div className="flex gap-4 flex-wrap">
                          {['Customer Data', 'Employee Data', 'Financial Data', 'Intellectual Property', 'Public Data', 'Applicants Data'].map((dc) => (
                            <label key={dc} className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={formData.dataCategories?.includes(dc as AIDataCategory)}
                                onChange={() => toggleDataCategory(dc as AIDataCategory)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-slate-700">{dc}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Linked Risks */}
                  <div className="col-span-2">
                    <MultiSelect 
                      label="Related Risks" 
                      icon={ShieldAlert} 
                      options={riskOptions} 
                      selectedIds={formData.relatedRiskIds || []} 
                      onSelect={toggleRiskSelection}
                      onRemove={toggleRiskSelection}
                    />
                  </div>
                </div>

                {/* AI Analysis Section */}
                <div className="pt-6 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-slate-900">AI Compliance Analysis</h4>
                    <Button 
                      variant="outline" 
                      onClick={handleAnalyze} 
                      isLoading={isAnalyzing}
                      className="gap-2 text-purple-700 border-purple-200 hover:bg-purple-50"
                    >
                      <Sparkles className="w-4 h-4" /> Analyze Compliance
                    </Button>
                  </div>
                  {formData.aiAnalysis ? (
                    <AIResponseBox content={formData.aiAnalysis} title="Gemini Compliance Report" />
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
                      Click "Analyze Compliance" to generate a gap analysis and recommendations based on selected frameworks.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : selectedService ? (
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-slate-900">{selectedService.name}</h2>
                    <Badge variant={selectedService.status === 'Compliant' ? 'success' : 'warning'}>
                      {selectedService.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><Server className="w-4 h-4" /> {getServiceName(selectedService.serviceId)}</span>
                    <span>Owner: {selectedService.owner}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => handleEdit(selectedService)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                    <p className="text-slate-700 mt-1">{selectedService.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4" /> Governance Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Risk Level</label>
                      <div className={`mt-1 inline-block px-3 py-1 rounded text-sm font-bold ${getRiskColor(selectedService.riskLevel)}`}>
                        {selectedService.riskLevel}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Frameworks</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedService.frameworks.map(fw => (
                          <Badge key={fw} variant="neutral">{fw}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">AI Technology</label>
                      <div className="flex items-center gap-2 mt-1 text-slate-900 font-medium">
                        <Cpu className="w-4 h-4 text-slate-500" />
                        {getTechnologyName(selectedService.technologyId)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Processed Data</label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {selectedService.dataCategories && selectedService.dataCategories.length > 0 ? (
                          selectedService.dataCategories.map(dc => (
                            <Badge key={dc} variant="neutral">
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3" /> {dc}
                              </div>
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500 italic">None specified</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase">Last Assessment</label>
                      <p className="text-slate-900 font-medium mt-1">{selectedService.lastAssessmentDate}</p>
                    </div>
                  </div>
                </div>

                {/* Linked Risks Display */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Related Risks
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedService.relatedRiskIds?.length ? selectedService.relatedRiskIds.map(id => {
                        const risk = MOCK_RISKS.find(r => r.id === id);
                        return <Badge key={id} variant="neutral">{risk?.title || id}</Badge>
                    }) : <span className="text-sm text-slate-500 italic">None linked</span>}
                  </div>
                </div>

                {selectedService.aiAnalysis && (
                  <AIResponseBox content={selectedService.aiAnalysis} title="Gemini Compliance Report" />
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
              <div className="text-center">
                <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Select an AI Service to view details or register a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGovernanceModule;
