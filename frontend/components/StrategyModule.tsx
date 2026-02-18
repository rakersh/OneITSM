import React, { useState } from 'react';
import { MOCK_STRATEGIC_THEMES, MOCK_STRATEGIC_GOALS } from '../constants';
import { StrategicTheme, StrategicGoal } from '../types';
import { Card, Badge, Button } from './Shared';
import { Target, Flag, TrendingUp, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

const StrategyModule = () => {
  const [selectedTheme, setSelectedTheme] = useState<StrategicTheme | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-green-600 bg-green-50 border-green-200';
      case 'At Risk': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Off Track': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'On Track': return <CheckCircle2 className="w-4 h-4" />;
      case 'At Risk': return <AlertTriangle className="w-4 h-4" />;
      case 'Off Track': return <XCircle className="w-4 h-4" />; // XCircle not imported, using AlertTriangle for now or import it
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Helper for XCircle since I missed importing it above
  const XCircle = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Strategy Management</h2>
          <p className="text-slate-500 text-sm">Strategic Themes & Goals Framework</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" /> New Theme
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
        {/* Themes List */}
        <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4">
          {MOCK_STRATEGIC_THEMES.map(theme => {
            const goals = MOCK_STRATEGIC_GOALS.filter(g => g.themeId === theme.id);
            const isSelected = selectedTheme?.id === theme.id;
            
            return (
              <div 
                key={theme.id}
                onClick={() => setSelectedTheme(theme)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-500 shadow-md' 
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{theme.name}</h3>
                      <span className="text-xs text-slate-500">{theme.horizon} Horizon</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{theme.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span>Owner: {theme.owner}</span>
                  <span className="font-medium">{goals.length} Goals</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Goals Detail View */}
        <div className="lg:col-span-2 h-full overflow-hidden flex flex-col">
          {selectedTheme ? (
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      {selectedTheme.name}
                      <Badge variant="neutral" >{selectedTheme.horizon}</Badge>
                    </h2>
                    <p className="text-slate-600 mt-1">{selectedTheme.description}</p>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Goal
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Flag className="w-5 h-5 text-indigo-600" /> Strategic Goals
                </h3>
                
                {MOCK_STRATEGIC_GOALS.filter(g => g.themeId === selectedTheme.id).map(goal => {
                  // Calculate progress percentage for visual bar
                  // Simple logic: (current / target) * 100. Handle cases where target is lower (e.g. reduce cost)
                  // For "Reduce", target < current is bad, target > current is good? No, usually target is the goal.
                  // Let's assume for visualization: 
                  // If target > current (e.g. revenue), progress = (current/target)*100
                  // If target < current (e.g. cost), progress = ((start - current) / (start - target))*100? Too complex for mock.
                  // Let's just use a simple ratio for now or random for mock visual if logic is ambiguous.
                  // Actually, let's just use a direct percentage interpretation for the bar width based on status for simplicity in this mock.
                  
                  let progressPercent = 0;
                  if (goal.status === 'On Track') progressPercent = 75;
                  else if (goal.status === 'At Risk') progressPercent = 45;
                  else progressPercent = 20;

                  // Override with real math if unit is % and it makes sense
                  if (goal.unit === '%' && goal.targetValue > 0) {
                     // This is rough approximation for the UI
                     progressPercent = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                  }

                  return (
                    <div key={goal.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg">{goal.name}</h4>
                          <p className="text-sm text-slate-500">{goal.description}</p>
                        </div>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(goal.status)}`}>
                          {getStatusIcon(goal.status)}
                          {goal.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div>
                          <div className="text-xs text-slate-500 uppercase font-semibold">Metric</div>
                          <div className="text-sm font-medium text-slate-900">{goal.metric}</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 uppercase font-semibold">Current</div>
                          <div className="text-xl font-bold text-slate-900">{goal.currentValue} <span className="text-xs font-normal text-slate-500">{goal.unit}</span></div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500 uppercase font-semibold">Target</div>
                          <div className="text-xl font-bold text-indigo-600">{goal.targetValue} <span className="text-xs font-normal text-slate-500">{goal.unit}</span></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>Progress</span>
                          <span>Deadline: {goal.deadline}</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              goal.status === 'On Track' ? 'bg-green-500' : 
                              goal.status === 'At Risk' ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {MOCK_STRATEGIC_GOALS.filter(g => g.themeId === selectedTheme.id).length === 0 && (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                    <Flag className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No goals defined for this theme yet.</p>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
              <div className="text-center">
                <Target className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Select a Strategic Theme</p>
                <p className="text-sm">View details, goals, and progress</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Plus icon since it wasn't imported in the main block
const Plus = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default StrategyModule;
