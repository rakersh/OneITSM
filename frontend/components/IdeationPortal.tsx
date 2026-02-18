import React, { useState } from 'react';
import { MOCK_CAPABILITIES, MOCK_SERVICES, MOCK_STRATEGIC_GOALS, MOCK_IDEAS } from '../constants';
import { Idea } from '../types';
import { Card, Button, MultiSelect } from './Shared';
import { Lightbulb, Map, Server, Target, CheckCircle2 } from 'lucide-react';

const IdeationPortal = () => {
  const [formData, setFormData] = useState<Partial<Idea>>({
    title: '',
    description: '',
    relatedCapabilityIds: [],
    relatedServiceIds: [],
    relatedGoalIds: []
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!formData.title || !formData.description) return;
    
    const newIdea: Idea = {
      id: `IDEA-${Math.floor(Math.random() * 10000)}`,
      title: formData.title!,
      description: formData.description!,
      submitter: 'Current User',
      created: new Date().toISOString().split('T')[0],
      status: 'Submitted',
      votes: 0,
      relatedCapabilityIds: formData.relatedCapabilityIds || [],
      relatedServiceIds: formData.relatedServiceIds || [],
      relatedGoalIds: formData.relatedGoalIds || []
    };

    // In a real app, this would save to backend. Here we just mock it.
    MOCK_IDEAS.push(newIdea);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        title: '',
        description: '',
        relatedCapabilityIds: [],
        relatedServiceIds: [],
        relatedGoalIds: []
      });
    }, 3000);
  };

  const toggleSelection = (field: 'relatedCapabilityIds' | 'relatedServiceIds' | 'relatedGoalIds', id: string) => {
    const current = formData[field] || [];
    const updated = current.includes(id) 
      ? current.filter(item => item !== id)
      : [...current, id];
    setFormData({ ...formData, [field]: updated });
  };

  const capabilityOptions = MOCK_CAPABILITIES.map(c => ({ id: c.id, label: c.name }));
  const serviceOptions = MOCK_SERVICES.map(s => ({ id: s.id, label: s.name }));
  const goalOptions = MOCK_STRATEGIC_GOALS.map(g => ({ id: g.id, label: g.name }));

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center gap-3">
          <Lightbulb className="w-8 h-8 text-yellow-500" />
          Ideation Portal
        </h1>
        <p className="text-slate-600 mt-2">Submit your innovative ideas to drive business value.</p>
      </div>

      {submitted ? (
        <Card className="p-12 text-center bg-green-50 border-green-200">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-800">Idea Submitted Successfully!</h2>
          <p className="text-green-700 mt-2">Thank you for your contribution. Your idea is now under review.</p>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Idea Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., AI-Powered Customer Support"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea 
                rows={5}
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your idea, the problem it solves, and the expected benefits..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MultiSelect 
                label="Impacted Business Capabilities" 
                icon={Map} 
                options={capabilityOptions} 
                selectedIds={formData.relatedCapabilityIds || []} 
                onSelect={(id) => toggleSelection('relatedCapabilityIds', id)}
                onRemove={(id) => toggleSelection('relatedCapabilityIds', id)}
              />
              
              <MultiSelect 
                label="Related Services" 
                icon={Server} 
                options={serviceOptions} 
                selectedIds={formData.relatedServiceIds || []} 
                onSelect={(id) => toggleSelection('relatedServiceIds', id)}
                onRemove={(id) => toggleSelection('relatedServiceIds', id)}
              />
            </div>

            <MultiSelect 
              label="Strategic Contribution" 
              icon={Target} 
              options={goalOptions} 
              selectedIds={formData.relatedGoalIds || []} 
              onSelect={(id) => toggleSelection('relatedGoalIds', id)}
              onRemove={(id) => toggleSelection('relatedGoalIds', id)}
            />

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSubmit} className="px-8 py-3 text-lg">
                Submit Idea
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default IdeationPortal;
