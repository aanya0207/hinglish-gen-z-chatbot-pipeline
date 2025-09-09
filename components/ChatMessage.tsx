
import React, { useRef, useState } from 'react';
import { Message } from '../types';
import { BotIcon } from './icons/BotIcon';
import { UserIcon } from './icons/UserIcon';
import { SpeakerIcon } from './icons/SpeakerIcon';


interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
// ...existing code...

  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
          <BotIcon className="w-6 h-6 text-pink-400" />
        </div>
      )}
      <div
        className={`max-w-md p-3 rounded-lg shadow-md ${
          isUser
            ? 'bg-blue-600/50 text-white rounded-br-none'
            : 'bg-gray-700/50 text-gray-200 rounded-bl-none'
        } flex items-center`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
          <UserIcon className="w-6 h-6 text-blue-400" />
        </div>
      )}
    </div>
  );
};
