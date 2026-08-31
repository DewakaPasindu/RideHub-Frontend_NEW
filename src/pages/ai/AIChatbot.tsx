import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, MessageSquare } from 'lucide-react';
import { AIService } from '../../services/api/ai.service';
import type { ChatMessage } from '../../services/api/types';

const INITIAL_SUGGESTIONS = [
  'I need a van for 8 people from Colombo to Kandy tomorrow.',
  'I want a car with a driver for 4 passengers.',
  'Best route from Colombo to Kandy.'
];

export default function AIChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your RideHub AI Assistant. How can I help you today? You can ask me for vehicle recommendations, driver matches, or trip route details in Sri Lanka.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(INITIAL_SUGGESTIONS);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await AIService.chat(messages, text);
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.reply }
      ]);

      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      } else {
        setSuggestions(INITIAL_SUGGESTIONS);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am having trouble connecting to the RideHub server. Please try again shortly.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">RideHub AI Assistant</h1>
              <p className="text-xs text-blue-100 flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                Online & Ready
              </p>
            </div>
          </div>
          <Sparkles className="h-5 w-5 text-blue-200" />
        </div>

        {/* Chat History */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-blue-600" />}
              </div>
              <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-white border border-gray-200">
                <Bot className="h-4 w-4 text-blue-600 animate-bounce" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-sm text-gray-500">
                Typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions & Input */}
        <div className="p-4 bg-white border-t border-gray-100 space-y-4">
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  disabled={loading}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border border-blue-100/50 flex items-center space-x-1"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{s}</span>
                </button>
              ))}
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about vehicle recommendations or travel routes..."
              disabled={loading}
              className="flex-grow rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
