import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Phone, Calendar, Stethoscope } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  name: string;
  label: string;
  payload?: any;
}

interface ChainlitMessage {
  type: string;
  content?: string;
  actions?: Array<{
    name: string;
    label: string;
    payload?: any;
  }>;
}
const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isConnected) {
      connectToBot();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isOpen]);

  const connectToBot = async () => {
    try {
      // Generate a unique session ID
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      
      // Connect to Chainlit WebSocket
      const wsUrl = `wss://uatchatbotv2.altius.cc/ws`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('Connected to Chainlit backend');
        setIsConnected(true);
        
        // Send initial connection message
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'connection_init',
            sessionId: newSessionId
          }));
        }
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data: ChainlitMessage = JSON.parse(event.data);
          handleChainlitMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (isOpen && !isConnected) {
            connectToBot();
          }
        }, 3000);
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to connect to chatbot:', error);
      setIsConnected(false);
    }
  };

  const handleChainlitMessage = (data: ChainlitMessage) => {
    if (data.type === 'message' && data.content) {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        isUser: false,
        timestamp: new Date(),
        actions: data.actions
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    } else if (data.type === 'action_response' && data.content) {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        isUser: false,
        timestamp: new Date(),
        actions: data.actions
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }
  };
  const sendMessage = async (content: string, isAction: boolean = false) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Send message to Chainlit backend
    try {
      if (isAction) {
        // Send action message
        wsRef.current.send(JSON.stringify({
          type: 'action',
          content: content,
          sessionId: sessionId
        }));
      } else {
        // Send regular message
        wsRef.current.send(JSON.stringify({
          type: 'message',
          content: content,
          sessionId: sessionId
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleActionClick = (action: Action) => {
    // Send action to Chainlit backend
    if (wsRef.current && isConnected) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'action_callback',
          name: action.name,
          payload: action.payload,
          sessionId: sessionId
        }));
        
        // Add user message showing the action was clicked
        const userMessage: Message = {
          id: Date.now().toString(),
          content: action.label,
          isUser: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);
      } catch (error) {
        console.error('Error sending action:', error);
      }
    }
  };

  const formatMessage = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
        >
          <MessageCircle className="w-6 h-6 group-hover:animate-pulse" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
            !
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-96 h-[32rem] flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Surya Hospitals</h3>
                <p className="text-xs opacity-90">
                  {isConnected ? '🟢 Online' : '🔴 Connecting...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm border'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {!message.isUser && (
                      <Bot className="w-4 h-4 mt-1 text-blue-600 flex-shrink-0" />
                    )}
                    <div
                      className="text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                    {message.isUser && (
                      <User className="w-4 h-4 mt-1 text-white/80 flex-shrink-0" />
                    )}
                  </div>
                  
                  {message.actions && (
                    <div className="mt-3 space-y-2">
                      {message.actions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => handleActionClick(action)}
                          className="block w-full text-left bg-blue-50 hover:bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm transition-colors border border-blue-200"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 shadow-sm border rounded-2xl px-4 py-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 text-sm"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || !isConnected}
                className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-400 text-white rounded-full p-2 transition-all duration-200 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;