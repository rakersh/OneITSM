import React, { useState } from 'react';
import { MOCK_IDEAS, MOCK_CAPABILITIES, MOCK_SERVICES, MOCK_STRATEGIC_GOALS } from '../constants';
import { Idea, IdeaStatus } from '../types';
import { Card, Badge, Button } from './Shared';
import { Lightbulb, Search, ThumbsUp, Map, Server, Target, Check, X } from 'lucide-react';

const IdeationModule = () => {
  const [ideas, setIdeas] = useState<Idea[]>(MOCK_IDEAS);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);

  const handleStatusChange = (status: IdeaStatus) => {
    if (!selectedIdea) return;
    const updatedIdea = { ...selectedIdea, status };
    setIdeas(ideas.map(i => i.id === selectedIdea.id ? updatedIdea : i));
    setSelectedIdea(updatedIdea);
  };

  const getStatusColor = (status: IdeaStatus) => {
    switch (status) {
      case 'Draft': return 'neutral';
      case 'Submitted': return 'default';
      case 'Under Review': return 'warning';
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      default: return 'neutral';
    }
  };

  const getCapabilityName = (id: string) => MOCK_CAPABILITIES.find(c => c.id === id)?.name || id;
  const getServiceName = (id: string) => MOCK_SERVICES.find(s => s.id === id)?.name || id;
  const getGoalName = (id: string) => MOCK_STRATEGIC_GOALS.find(g => g.id === id)?.name || id;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* List View */}
      <div className="w-1/3 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Idea Pipeline</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search ideas..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {ideas.map(idea => (
            <div 
              key={idea.id}
              onClick={() => setSelectedIdea(idea)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedIdea?.id === idea.id 
                  ? 'bg-blue-50 border-blue-500 shadow-sm' 
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-500">{idea.id}</span>
                <Badge variant={getStatusColor(idea.status) as any}>{idea.status}</Badge>
              </div>
              <h3 className="font-medium text-slate-900 line-clamp-1">{idea.title}</h3>
              <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
                <span>{idea.submitter}</span>
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {idea.votes}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1">
        {selectedIdea ? (
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedIdea.title}</h2>
                  <Badge variant={getStatusColor(selectedIdea.status) as any}>{selectedIdea.status}</Badge>
                </div>
                <div className="text-sm text-slate-500 flex gap-4">
                  <span>Submitted by: {selectedIdea.submitter}</span>
                  <span>Date: {selectedIdea.created}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedIdea.status === 'Submitted' && (
                  <Button onClick={() => handleStatusChange('Under Review')} variant="secondary">Start Review</Button>
                )}
                {selectedIdea.status === 'Under Review' && (
                  <>
                    <Button onClick={() => handleStatusChange('Approved')} className="bg-green-600 hover:bg-green-700 text-white"><Check className="w-4 h-4 mr-1" /> Approve</Button>
                    <Button onClick={() => handleStatusChange('Rejected')} className="bg-red-600 hover:bg-red-700 text-white"><X className="w-4 h-4 mr-1" /> Reject</Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase mb-2">Description</h4>
                <p className="text-slate-700 leading-relaxed">{selectedIdea.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Map className="w-4 h-4 text-indigo-600" /> Business Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.relatedCapabilityIds?.length ? selectedIdea.relatedCapabilityIds.map(id => (
                      <Badge key={id} variant="neutral">{getCapabilityName(id)}</Badge>
                    )) : <span className="text-sm text-slate-400 italic">None linked</span>}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" /> Related Services
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.relatedServiceIds?.length ? selectedIdea.relatedServiceIds.map(id => (
                      <Badge key={id} variant="neutral">{getServiceName(id)}</Badge>
                    )) : <span className="text-sm text-slate-400 italic">None linked</span>}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-600" /> Strategic Contribution
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedIdea.relatedGoalIds?.length ? selectedIdea.relatedGoalIds.map(id => (
                      <Badge key={id} variant="neutral">{getGoalName(id)}</Badge>
                    )) : <span className="text-sm text-slate-400 italic">None linked</span>}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
            <div className="text-center">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Select an idea to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IdeationModule;
