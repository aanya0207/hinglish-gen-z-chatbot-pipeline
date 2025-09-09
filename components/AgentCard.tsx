import React from 'react';
import { AgentState, AgentStatus } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface AgentCardProps {
  agent: AgentState;
}

const getStatusStyles = (status: AgentStatus) => {
  switch (status) {
    case AgentStatus.Processing:
      return {
        borderColor: 'border-cyan-500',
        textColor: 'text-cyan-400',
        bgColor: 'bg-cyan-500/10',
      };
    case AgentStatus.Complete:
      return {
        borderColor: 'border-green-500',
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10',
      };
    case AgentStatus.Error:
      return {
        borderColor: 'border-red-500',
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10',
      };
    case AgentStatus.Skipped:
       return {
        borderColor: 'border-gray-700',
        textColor: 'text-gray-500',
        bgColor: 'bg-gray-800/10',
      };
    case AgentStatus.Pending:
    default:
      return {
        borderColor: 'border-gray-600',
        textColor: 'text-gray-400',
        bgColor: 'bg-gray-800/20',
      };
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const { borderColor, textColor, bgColor } = getStatusStyles(agent.status);

  return (
    <div
      className={`border ${borderColor} ${bgColor} rounded-xl p-4 shadow-lg transition-all duration-500 ease-in-out transform hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-bold ${textColor}`}>
          {agent.id}. {agent.name}
        </h3>
        <div className="flex items-center gap-2">
            {agent.status === AgentStatus.Processing && (
                <SpinnerIcon className="w-5 h-5 text-cyan-400 animate-spin" />
            )}
            <span className={`text-xs font-semibold uppercase tracking-wider ${textColor}`}>
                {agent.status}
            </span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-3 h-10">{agent.description}</p>
      
      {agent.output && (
        <div className="mt-2 p-3 bg-black/30 rounded-lg text-xs font-mono text-gray-300 max-h-48 overflow-y-auto">
          <pre className="whitespace-pre-wrap break-words">{agent.output}</pre>
        </div>
      )}

      {agent.sources && agent.sources.length > 0 && (
        <div className="mt-3 border-t border-gray-700/50 pt-3">
          <h4 className="text-xs font-semibold text-gray-400 mb-2">Sources:</h4>
          <ul className="space-y-1">
            {agent.sources.map((source, index) => (
              <li key={index} className="truncate">
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  title={source.title}
                  className="text-xs text-pink-400 hover:text-pink-300 hover:underline transition-colors"
                >
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
