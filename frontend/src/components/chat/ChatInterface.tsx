"use client";
import { useState } from 'react';
import { chatService } from '@/services/api';
import { Send, User, Bot, AlertCircle } from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<{role: string, content: string, ticketCreated?: boolean}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await chatService.query(input);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.answer, 
        ticketCreated: data.ticket_created 
      }]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-2xl border rounded-lg bg-white shadow-xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                {m.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                {m.role.toUpperCase()}
              </div>
              {m.content}
              {m.ticketCreated && (
                <div className="mt-2 p-2 bg-amber-100 border border-amber-300 rounded text-amber-800 text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>A support ticket has been created for human review.</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && <div className="text-gray-400 text-sm animate-pulse">AI is thinking...</div>}
      </div>
      <div className="p-4 border-t flex gap-2">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ask about returns, products..."
        />
        <button onClick={handleSend} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}