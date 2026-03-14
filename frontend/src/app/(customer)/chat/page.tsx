"use client";
import { useState, useRef, useEffect } from 'react';
import { chatService } from '@/services/api';
import { Send, Bot, User, AlertTriangle } from 'lucide-react';


interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  ticketCreated?: boolean; // The '?' makes it optional
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! How can I help you with your order today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const onSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await chatService.query(userMsg);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: res.data.answer,
        ticketCreated: res.data.ticket_created 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100-80px)] flex flex-col p-4">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[75%] ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm">{msg.content}</p>
              {msg.ticketCreated && (
                <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-center gap-2">
                  <AlertTriangle size={14} /> Escalated to human support.
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-xs text-gray-400 animate-pulse">AI is typing...</div>}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 bg-white p-2 border rounded-full shadow-lg">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Ask a question..."
          className="flex-1 px-4 py-2 outline-none bg-transparent"
        />
        <button onClick={onSend} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700">
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}