import React, { useState } from 'react';
import { MOCK_CHANGES } from '../constants';
import { ChangeRequest } from '../types';
import { Card, Badge, Button, AIResponseBox } from './Shared';
import { GitPullRequest, ShieldAlert, Calendar } from 'lucide-react';
import { assessChangeRisk } from '../services/geminiService';

const ChangeModule = () => {
  const [changes, setChanges] = useState<ChangeRequest[]>(MOCK_CHANGES);
  const [assessingId, setAssessingId] = useState<string | null>(null);

  const handleRiskAssessment = async (change: ChangeRequest) => {
    setAssessingId(change.id);
    const assessment = await assessChangeRisk(change.title, change.description, change.type);
    const updatedChanges = changes.map(c => 
      c.id === change.id ? { ...c, aiRiskAssessment: assessment } : c
    );
    setChanges(updatedChanges);
    setAssessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Change Requests</h2>
        <Button variant="primary">New Change Request</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {changes.map(change => (
          <Card key={change.id} className="flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <GitPullRequest className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{change.title}</h3>
                    <span className="text-xs font-mono text-slate-500">{change.id}</span>
                  </div>
                </div>
                <Badge variant={change.status === 'Approved' ? 'success' : 'neutral'}>{change.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <ShieldAlert className="w-4 h-4" />
                  Risk: <span className={`font-medium ${change.risk === 'High' ? 'text-red-600' : 'text-slate-900'}`}>{change.risk}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  Date: <span className="font-medium text-slate-900">{change.implementationDate}</span>
                </div>
              </div>

              <p className="text-slate-700 mb-6">{change.description}</p>

              {change.aiRiskAssessment ? (
                <AIResponseBox content={change.aiRiskAssessment} title="AI Risk Assessment" />
              ) : (
                <Button 
                  variant="secondary" 
                  className="w-full gap-2"
                  onClick={() => handleRiskAssessment(change)}
                  isLoading={assessingId === change.id}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Run AI Risk Assessment
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChangeModule;
