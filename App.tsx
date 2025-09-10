import React, { useState, useRef, useEffect } from 'react';
import { Message, AgentState, AgentStatus, GroundingSource } from './types';
import { ChatInput } from './components/ChatInput';
import { ChatMessage } from './components/ChatMessage';
import { PipelineDisplay } from './components/PipelineDisplay';
import { callGemini, callGeminiWithSearch, ChatSession } from './services/geminiService';
import { SpinnerIcon } from './components/icons/SpinnerIcon';

const initialAgents: AgentState[] = [
  { id: 1, name: 'Input Handler', description: 'Receives the user\'s Hinglish query.', status: AgentStatus.Pending, output: '' },
  { id: 2, name: 'Translation Agent', description: 'Translates the Hinglish query into English for better understanding.', status: AgentStatus.Pending, output: '' },
  { id: 3, name: 'Reasoning Agent', description: 'Decides if a real-time web search is needed to answer the query.', status: AgentStatus.Pending, output: '' },
  { id: 4, name: 'Search Agent', description: 'Performs a web search to gather up-to-date information if required.', status: AgentStatus.Pending, output: '' },
  { id: 5, name: 'Response Generation Agent', description: 'Generates the final response using chat history and search results.', status: AgentStatus.Pending, output: '' },
];

const genZSystemInstruction = `You are a chill, friendly, and helpful Gen-Z chatbot. Your name is VibeBot.
- Your responses MUST be in Hinglish (a mix of Hindi and English).
- Keep it informal, spicy, and dripping with confidence (60% cocky, 40% friendly).  
- Use informal language, slang, and emojis (✨, 🔥, 😂, 💅, 🙏).
- Incorporate Gen-Z slang.
- Use a different combination of Gen-Z slang and emojis in every response. Do not repeat the same slang or emoji in consecutive answers.
- If user asks something deep/technical → explain in Hinglish but with swag, like a know-it-all friend.
- Do NOT use formal Hindi. Be helpful but make it sound like you're texting a friend.
- Your goal is to be relatable, fun and entertaining and Talk like you’re texting a bestie — cocky but fun. 
- When you use information from a search, seamlessly integrate it into your chatty response. Don't say "according to my search". Just use the info naturally.
- Keep answers short (max 2–3 sentences).
- Maintain sass at 60%, but balance with helpful and friendly tone.`;


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Wassup! VibeBot here.✨", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [agents, setAgents] = useState<AgentState[]>(initialAgents);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  // Conversation history as array of { user, bot }
  const [conversationHistory, setConversationHistory] = useState<{ user: string; bot: string }[]>([]);

  // Download conversationHistory as JSON file
  const downloadHistory = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conversationHistory, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "conversation_history.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
  };

  useEffect(() => {
    // Initialize the chat session with memory on component mount
    setChatSession(new ChatSession(genZSystemInstruction));
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const updateAgentState = (id: number, newStatus: AgentStatus, output?: string, sources?: GroundingSource[]) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === id
          ? { ...agent, status: newStatus, output: output !== undefined ? output : agent.output, sources }
          : agent
      )
    );
  };

  const runPipeline = async (query: string) => {
    if (!chatSession) {
      return "Low-key, chat session is MIA. Try refreshing? 💀";
    }

    // 1. Input Handler
    updateAgentState(1, AgentStatus.Processing);
    await new Promise(res => setTimeout(res, 300));
    updateAgentState(1, AgentStatus.Complete, query);

    // 2. Translation Agent
    updateAgentState(2, AgentStatus.Processing);
    const translationPrompt = `Translate the following Hinglish message to simple, clear English. Only provide the translation. Message: "${query}"`;
    const englishQuery = await callGemini(translationPrompt);
    if (englishQuery.startsWith('Error:')) {
      updateAgentState(2, AgentStatus.Error, englishQuery);
      return "Sorry, translation mein kuch issue aa gaya. 😥";
    }
    updateAgentState(2, AgentStatus.Complete, englishQuery);

    // 3. Reasoning Agent
    updateAgentState(3, AgentStatus.Processing);
    const reasonPrompt = `Does the following query require real-time information from the web (e.g., about recent events, scores, weather, stock prices)? Answer only with YES or NO.\n\nQuery: "${englishQuery}"`;
    const needsSearchResponse = await callGemini(reasonPrompt);
    const needsSearch = needsSearchResponse.trim().toUpperCase().includes('YES');
    updateAgentState(3, AgentStatus.Complete, `Requires Search: ${needsSearch ? 'YES' : 'NO'}`);

    let finalMessageForBot = query; // Use original query for chat history
    
    // 4. Search Agent
    updateAgentState(4, AgentStatus.Processing);
    if (needsSearch) {
        const { text: searchResult, sources } = await callGeminiWithSearch(englishQuery);
         if (searchResult.startsWith('Error:')) {
            updateAgentState(4, AgentStatus.Error, searchResult);
        } else {
            updateAgentState(4, AgentStatus.Complete, searchResult, sources);
            // Augment the prompt for the final response generation
            finalMessageForBot = `Here's some info from a web search: "${searchResult}".\n\nNow, answer my original question in a friendly, Gen-Z Hinglish tone: "${query}"`;
        }
    } else {
        updateAgentState(4, AgentStatus.Skipped, 'Search not required for this query.');
    }

    // 5. Response Generation Agent
    updateAgentState(5, AgentStatus.Processing);
    const botResponseText = await chatSession.sendMessage(finalMessageForBot);
    if (botResponseText.startsWith('Error:')) {
        updateAgentState(5, AgentStatus.Error, botResponseText);
        return "Low-key, AI se connect nahi ho pa raha. Try again later?";
    }
    updateAgentState(5, AgentStatus.Complete, botResponseText);
    
    return botResponseText;
  };


  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setAgents(initialAgents.map(a => ({...a, output: '', sources: []})));

    const botResponseText = await runPipeline(currentInput);

    // Save user-bot exchange as a dictionary
    setConversationHistory(prev => [...prev, { user: currentInput, bot: botResponseText }]);

    const botMessage: Message = { id: (Date.now() + 1).toString(), text: botResponseText, sender: 'bot' };
    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="h-screen w-screen bg-gray-900 text-white font-sans flex flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700/20 via-gray-900 to-black">
      <header className="text-center p-4 border-b border-gray-700/50 shadow-lg">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
          Hinglish Gen-Z Chatbot
        </h1>
      </header>
      <main className="flex-1 flex flex-row overflow-hidden">
        <button
          onClick={downloadHistory}
          className="absolute top-4 right-4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded shadow"
        >
          Download Chat History (JSON)
        </button>
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
               <div className="flex items-start gap-3 my-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                     <SpinnerIcon className="w-6 h-6 text-pink-400 animate-spin" />
                  </div>
                  <div className="max-w-md p-3 rounded-lg shadow-md bg-gray-700/50 text-gray-400 rounded-bl-none italic">
                     Vibe check... AI soch raha hai...
                  </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <ChatInput input={input} setInput={setInput} onSend={handleSend} isLoading={isLoading} />
        </div>
        {/*
        <div className="w-[40%] max-w-2xl border-l border-gray-700/50 flex flex-col">
          <PipelineDisplay agents={agents} />
        </div>
        */}

    </main>
  </div>
  );
};

export default App;
