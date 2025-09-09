
import React from 'react';
import { AgentState } from '../types';
import { AgentCard } from './AgentCard';

interface PipelineDisplayProps {
  agents: AgentState[];
}

export const PipelineDisplay: React.FC<PipelineDisplayProps> = ({ agents }) => {
  return (
  <div className="flex-1 p-6 bg-gray-900/30 overflow-y-auto">
    <div className="space-y-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  </div>
  );
};
