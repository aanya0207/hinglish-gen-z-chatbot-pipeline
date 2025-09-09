
import React from 'react';
import { SendIcon } from './icons/SendIcon';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSend, isLoading }) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isLoading) {
        onSend();
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900/50 border-t border-gray-700/50 backdrop-blur-sm">
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hinglish mein kuch poocho..."
          disabled={isLoading}
          rows={1}
          className="w-full pl-4 pr-12 py-3 bg-gray-800/80 border border-gray-600/80 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-300 resize-none"
        />
        <button
          onClick={onSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-pink-600 text-white hover:bg-pink-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
